import { useState, useCallback, useRef } from "react";
import { format, parseISO, subDays } from "date-fns";
import Taro from "@tarojs/taro";
import { 
  getUrineHistory, 
  getUrineStatistics, 
  getUrineTimeDistribution,
  UrineHistoryItem, 
  UrineStatistics as ApiUrineStatistics,
  UrineTimeDistributionListVO,
  UrineTimeDistributionItemVO
} from "@/api/urineApi";

// 定义尿量数据类型
export interface UrineDataPoint {
  date: string;
  timestamp: string;
  volume: number;  // 尿量(ml)
  recordTime: string;
  hasMeasurement: boolean;
  notes?: string;
  id?: number;     // 记录ID
  tag?: string;    // 时间段标签
}

// 定义元数据类型
export interface UrineMetadata {
  averageVolume: number;
  maxVolume: number;
  minVolume: number;
  totalVolume: number;
  dataCoverage: number;
  abnormalCount: number;
  recordCount: number;
  dailyAverage: number;
  dayWithMaxVolume: string;
  dayWithMinVolume: string;
  timeDistribution: UrineTimeDistributionItemVO[];
  trend: "increasing" | "decreasing" | "stable" | "fluctuating";
  trendPercentage: number;
  // API返回的额外字段
  weeklyAverage?: number;
  monthlyAverage?: number;
  // 数据完整度相关字段
  dataCompleteness?: number;
  daysWithData?: number;
  totalDays?: number;
}

// 尿量正常范围
export const NORMAL_VOLUME_RANGE = {
  MIN: 800,  // 每日最小正常尿量(ml)
  MAX: 2000, // 每日最大正常尿量(ml)
  MIN_SINGLE: 200, // 单次最小正常尿量(ml)
  MAX_SINGLE: 500  // 单次最大正常尿量(ml)
};

// 时间段定义
export const TIME_PERIODS = {
  MORNING: { name: "早晨", range: [6, 11], color: "#FFD54F" },
  AFTERNOON: { name: "下午", range: [12, 17], color: "#4FC3F7" },
  EVENING: { name: "晚上", range: [18, 23], color: "#7986CB" },
  NIGHT: { name: "夜间", range: [0, 5], color: "#9575CD" }
};

// 获取尿量状态
export const getUrineVolumeStatus = (volume: number, isDaily = false) => {
  const min = isDaily ? NORMAL_VOLUME_RANGE.MIN : NORMAL_VOLUME_RANGE.MIN_SINGLE;
  const max = isDaily ? NORMAL_VOLUME_RANGE.MAX : NORMAL_VOLUME_RANGE.MAX_SINGLE;
  
  if (volume < min) {
    return "low";
  } else if (volume > max) {
    return "high";
  } else {
    return "normal";
  }
};

// 将API返回的趋势转换为组件使用的趋势
const mapApiTrendToComponentTrend = (apiTrend: 'up' | 'down' | 'stable'): "increasing" | "decreasing" | "stable" | "fluctuating" => {
  switch (apiTrend) {
    case 'up':
      return 'increasing';
    case 'down':
      return 'decreasing';
    case 'stable':
    default:
      return 'stable';
  }
};

// 将API返回的历史记录转换为组件使用的数据点
const mapHistoryItemToDataPoint = (item: UrineHistoryItem): UrineDataPoint => {
  // 如果后端已经提供了格式化的字段，直接使用
  if (item.date && item.timestamp && item.recordTime) {
    return {
      id: item.id,
      date: item.date,
      timestamp: item.timestamp,
      volume: item.volume,
      recordTime: item.recordTime,
      hasMeasurement: true,
      notes: item.notes || '',
      tag: item.tag || ''
    };
  }
  
  // 否则，从recordedTime字段解析
  const recordedTime = new Date(item.recordedTime);
  const date = recordedTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const recordTime = recordedTime.toTimeString().substring(0, 5); // HH:MM
  
  return {
    id: item.id,
    date: date,
    timestamp: item.recordedTime,
    volume: item.volume,
    recordTime: recordTime,
    hasMeasurement: true,
    notes: item.notes || '',
    tag: item.tag || ''
  };
};

// 从API统计数据和历史记录生成元数据
const generateMetadataFromApiData = (
  apiStats: ApiUrineStatistics, 
  historyData: UrineDataPoint[],
  viewMode: "day" | "week" | "month"
): UrineMetadata => {
  // 从API获取的基本统计数据
  const {
    dailyAverage = 0,
    weeklyAverage = 0,
    monthlyAverage = 0,
    totalRecords = 0,
    lowestVolume = 0,
    highestVolume = 0,
    averageSingleVolume = 0,
    abnormalCount = 0,
    totalVolume = historyData.reduce((sum, item) => sum + item.volume, 0),
    dataCompleteness = 0,
    daysWithData = 0,
    totalDays = 0
  } = apiStats;
  
  // 计算每日最大和最小尿量的日期（如果API没有提供）
  let dayWithMaxVolume = "";
  let dayWithMinVolume = "";
  
  if (historyData.length > 0) {
    // 按日期分组计算每日总尿量
    const dailyVolumes: Record<string, number> = {};
    historyData.forEach(item => {
      const day = item.date;
      if (!dailyVolumes[day]) {
        dailyVolumes[day] = 0;
      }
      dailyVolumes[day] += item.volume;
    });
    
    // 找出最大和最小尿量的日期
    let maxDay = "";
    let minDay = "";
    let maxVol = -1;
    let minVol = Number.MAX_VALUE;
    
    Object.entries(dailyVolumes).forEach(([day, vol]) => {
      if (vol > maxVol) {
        maxVol = vol;
        maxDay = day;
      }
      if (vol < minVol) {
        minVol = vol;
        minDay = day;
      }
    });
    
    dayWithMaxVolume = maxDay;
    dayWithMinVolume = minDay;
  }
  
  // 根据视图模式选择正确的平均值
  let effectiveAverage = dailyAverage;
  switch (viewMode) {
    case "week":
      effectiveAverage = weeklyAverage || dailyAverage;
      break;
    case "month":
      effectiveAverage = monthlyAverage || weeklyAverage || dailyAverage;
      break;
    default:
      effectiveAverage = dailyAverage;
  }
  
  // 计算预期天数
  let expectedDays = 1;
  switch (viewMode) {
    case "week":
      expectedDays = 7;
      break;
    case "month":
      // 获取当月天数
      const today = new Date();
      expectedDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      break;
    default:
      expectedDays = 1;
  }
  
  const uniqueDays = new Set(historyData.map(item => item.date)).size;
  const dataCoverage = uniqueDays / expectedDays;
  
  // 初始化空的时间分布数组，将在refreshData中填充
  const timeDistribution: UrineTimeDistributionItemVO[] = [];
  
  // 计算趋势百分比（如果API没有提供）
  const trendPercentage = apiStats.trendAnalysis?.percentage || (apiStats.trend === 'up' ? 5 : (apiStats.trend === 'down' ? -5 : 0));
  
  return {
    averageVolume: averageSingleVolume || (historyData.length > 0 ? Math.round(totalVolume / historyData.length) : 0),
    maxVolume: highestVolume,
    minVolume: lowestVolume,
    totalVolume,
    dataCoverage,
    abnormalCount,
    recordCount: totalRecords,
    dailyAverage: effectiveAverage,
    weeklyAverage,
    monthlyAverage,
    dayWithMaxVolume,
    dayWithMinVolume,
    timeDistribution,
    trend: mapApiTrendToComponentTrend(apiStats.trend || 'stable'),
    trendPercentage,
    // 添加数据完整度相关字段
    dataCompleteness,
    daysWithData,
    totalDays: expectedDays
  };
};

// 按周分组数据
const groupDataByWeek = (dataPoints: UrineDataPoint[]): UrineDataPoint[] => {
  const weeklyData: Record<string, UrineDataPoint> = {};
  
  dataPoints.forEach(point => {
    const date = new Date(point.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // 设置为本周第一天
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        date: weekKey,
        timestamp: point.timestamp,
        volume: 0,
        recordTime: '00:00',
        hasMeasurement: false,
        notes: '',
        tag: 'week'
      };
    }
    
    weeklyData[weekKey].volume += point.volume;
    weeklyData[weekKey].hasMeasurement = true;
  });
  
  return Object.values(weeklyData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

// 主钩子函数
const useUrineData = () => {
  const [urineData, setUrineData] = useState<UrineDataPoint[]>([]);
  const [metadata, setMetadata] = useState<UrineMetadata | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<UrineTimeDistributionItemVO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 调试日志
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[UrineData] ${message}`, data);
    }
  };
  
  // 显示提示
  const showToast = (message: string) => {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  };
  
  // 获取用户ID
  const getUserId = () => {
    try {
      const userInfo = Taro.getStorageSync('userInfo');
      if (userInfo && userInfo.id) {
        return userInfo.id;
      }
      
      // 如果没有用户信息，使用默认ID（仅用于开发测试）
      if (process.env.NODE_ENV !== 'production') {
        return 1; // 开发环境默认用户ID
      }
      
      throw new Error('未找到用户信息');
    } catch (e) {
      debugLog('获取用户ID失败', e);
      showToast('获取用户信息失败，请重新登录');
      throw e;
    }
  };
  
  // 计算日期范围
  const calculateDateRange = (viewMode: "day" | "week" | "month", endDate: Date) => {
    let startDate: Date;
    
    switch (viewMode) {
      case "day":
        startDate = endDate; // 当天
        break;
      case "week":
        // 获取自然周的第一天（周一）
        const dayOfWeek = endDate.getDay(); // 0是周日，1-6是周一到周六
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 计算到周一的天数差
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - diff);
        break;
      case "month":
        // 获取当月第一天
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      default:
        startDate = endDate;
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  // 获取历史记录数据
  const fetchHistoryData = async (userId: number, startDate: string, endDate: string, viewMode: "day" | "week" | "month" = "day") => {
    try {
      const response = await getUrineHistory({
        userId,
        startDate,
        endDate,
        pageSize: 100, // 获取足够多的数据以便前端处理
        viewMode
      });
      
      if (response.code !== 0 && response.code !== 200) {
        throw new Error(`获取历史数据失败: ${response.msg}`);
      }
      
      // 将API返回的数据转换为前端需要的格式
      const dataPoints: UrineDataPoint[] = [];
      
      if (response.data && response.data.records) {
        for (const record of response.data.records) {
          try {
            dataPoints.push(mapHistoryItemToDataPoint(record));
          } catch (error) {
            console.error("转换历史记录失败:", error);
          }
        }
      }
      
      return dataPoints;
    } catch (error) {
      console.error("获取历史数据失败:", error);
      throw error;
    }
  };
  
  // 获取统计数据
  const fetchStatisticsData = async (userId: number, viewMode: "day" | "week" | "month", startDate: string, endDate: string) => {
    const statsResponse = await getUrineStatistics(
      userId, 
      viewMode,
      startDate, 
      endDate
    );
    
    if (statsResponse.code !== 0 && statsResponse.code !== 200) {
      throw new Error(statsResponse.msg || '获取统计数据失败');
    }
    
    return statsResponse.data;
  };
  
  // 获取时间分布数据
  const fetchTimeDistributionData = async (userId: number, viewMode: "day" | "week" | "month", startDate: string, endDate: string) => {
    const timeDistResponse = await getUrineTimeDistribution(
      userId,
      viewMode,
      startDate,
      endDate
    );
    
    if (timeDistResponse.code !== 0 && timeDistResponse.code !== 200) {
      throw new Error(`获取排尿时间分布数据失败: ${timeDistResponse.msg}`);
    }
    
    return timeDistResponse.data;
  };
  
  // 刷新数据
  const refreshData = useCallback(async (
    viewMode: "day" | "week" | "month" = "day",
    endDate: Date = new Date()
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      const { startDate, endDate: endDateStr } = calculateDateRange(viewMode, endDate);
      
      debugLog(`刷新数据: 模式=${viewMode}, 开始=${startDate}, 结束=${endDateStr}`, endDate);
      
      // 1. 获取历史记录数据
      const dataPoints = await fetchHistoryData(userId, startDate, endDateStr, viewMode);
      
      // 2. 根据视图模式处理数据
      let processedDataPoints: UrineDataPoint[];
      if (viewMode === 'day') {
        // 日模式下，按记录时间排序
        processedDataPoints = dataPoints.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
      } else if (viewMode === 'week') {
        // 周模式下，按日期排序
        processedDataPoints = dataPoints.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      } else {
        // 月模式下，数据已经按周分组，直接使用
        processedDataPoints = dataPoints;
      }
      
      // 3. 获取统计数据
      const statsData = await fetchStatisticsData(userId, viewMode, startDate, endDateStr);
      
      // 4. 获取时间分布数据
      const timeDistData = await fetchTimeDistributionData(userId, viewMode, startDate, endDateStr);
      
      // 5. 生成元数据
      const metadataObj = generateMetadataFromApiData(statsData, processedDataPoints, viewMode);
      
      // 6. 使用时间分布数据
      if (timeDistData && timeDistData.items && timeDistData.items.length > 0) {
        metadataObj.timeDistribution = timeDistData.items;
        setTimeDistribution(timeDistData.items);
      } else {
        // 如果没有时间分布数据，设置为空数组
        metadataObj.timeDistribution = [];
        setTimeDistribution([]);
        debugLog('警告: 时间分布数据为空');
      }
      
      // 7. 更新状态
      setUrineData(processedDataPoints);
      setMetadata(metadataObj);
      
      debugLog('数据刷新完成', { 
        dataPoints: processedDataPoints, 
        metadata: metadataObj, 
        timeDistribution: metadataObj.timeDistribution 
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      debugLog('数据刷新出错', err);
      setError(errorMessage);
      showToast(`加载失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    urineData,
    metadata,
    timeDistribution,
    refreshData,
    isLoading,
    error
  };
};

export default useUrineData;
