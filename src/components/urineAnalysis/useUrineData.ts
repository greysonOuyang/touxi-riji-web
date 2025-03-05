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
  const date = parseISO(item.recordedTime);
  const formattedDate = format(date, 'yyyy-MM-dd');
  const formattedTime = format(date, 'HH:mm');
  
  return {
    id: item.id,
    date: formattedDate,
    timestamp: item.recordedTime,
    volume: item.volume,
    recordTime: formattedTime,
    // 根据volume判断是否有测量值，如果volume大于0则认为有测量值
    hasMeasurement: item.volume > 0,
    notes: item.notes,
    tag: item.tag
  };
};

// 从API统计数据和历史记录生成元数据
const generateMetadataFromApiData = (
  apiStats: ApiUrineStatistics, 
  historyData: UrineDataPoint[],
  viewMode: "day" | "week" | "month"
): UrineMetadata => {
  // 优先使用API返回的统计数据
  const dailyAverage = apiStats.dailyAverage || 0;
  const weeklyAverage = apiStats.weeklyAverage || 0;
  const monthlyAverage = apiStats.monthlyAverage || 0;
  const totalRecords = apiStats.totalRecords || 0;
  const highestVolume = apiStats.highestVolume || 0;
  const lowestVolume = apiStats.lowestVolume || 0;
  const totalVolume = apiStats.totalVolume || historyData.reduce((sum, item) => sum + item.volume, 0);
  const abnormalCount = apiStats.abnormalCount || 0;
  const averageSingleVolume = apiStats.averageSingleVolume || 0;
  
  // 计算每日最大和最小尿量的日期（如果API没有提供）
  let dayWithMaxVolume = "";
  let dayWithMinVolume = "";
  
  // 只有在API没有提供时才进行前端计算
  if (historyData.length > 0) {
    const dailyData = new Map<string, number>();
    historyData.forEach(item => {
      const currentDate = item.date;
      dailyData.set(
        currentDate,
        (dailyData.get(currentDate) || 0) + item.volume
      );
    });
    
    let maxDailyVolume = 0;
    let minDailyVolume = Number.MAX_SAFE_INTEGER;
    
    dailyData.forEach((volume, date) => {
      if (volume > maxDailyVolume) {
        maxDailyVolume = volume;
        dayWithMaxVolume = date;
      }
      if (volume < minDailyVolume) {
        minDailyVolume = volume;
        dayWithMinVolume = date;
      }
    });
  }
  
  // 计算数据覆盖率
  let expectedDays = 1;
  if (viewMode === "week") {
    expectedDays = 7;
  } else if (viewMode === "month") {
    expectedDays = 30;
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
    dailyAverage,
    weeklyAverage,
    monthlyAverage,
    dayWithMaxVolume,
    dayWithMinVolume,
    timeDistribution,
    trend: mapApiTrendToComponentTrend(apiStats.trend),
    trendPercentage
  };
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
        startDate = subDays(endDate, 6); // 过去7天
        break;
      case "month":
        startDate = subDays(endDate, 29); // 过去30天
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
  const fetchHistoryData = async (userId: number, startDate: string, endDate: string) => {
    const historyResponse = await getUrineHistory({
      userId,
      startDate,
      endDate,
      pageSize: 100, // 足够大的页面大小以获取所有数据
      pageNum: 1
    });
    
    if (historyResponse.code !== 0 && historyResponse.code !== 200) {
      throw new Error(historyResponse.msg || '获取历史记录失败');
    }
    
    if (!historyResponse.data || !historyResponse.data.records || !Array.isArray(historyResponse.data.records)) {
      debugLog('警告: 历史记录API返回数据结构异常', historyResponse.data);
      return [];
    }
    
    // 转换历史记录为数据点
    return historyResponse.data.records.map(item => {
      try {
        return mapHistoryItemToDataPoint(item);
      } catch (error) {
        debugLog('转换历史记录项时出错', { error, item });
        // 返回一个默认的数据点，避免整个映射失败
        return {
          id: item.id || 0,
          date: item.recordedTime ? format(parseISO(item.recordedTime), 'yyyy-MM-dd') : '未知日期',
          timestamp: item.recordedTime || new Date().toISOString(),
          volume: item.volume || 0,
          recordTime: item.recordedTime ? format(parseISO(item.recordedTime), 'HH:mm') : '00:00',
          hasMeasurement: item.volume > 0,
          notes: item.notes || '',
          tag: item.tag || ''
        };
      }
    });
  };
  
  // 获取统计数据
  const fetchStatisticsData = async (userId: number, period: "day" | "week" | "month", startDate: string, endDate: string, viewMode: "day" | "week" | "month") => {
    const statsResponse = await getUrineStatistics(
      userId, 
      period, 
      startDate, 
      endDate, 
      viewMode
    );
    
    if (statsResponse.code !== 0 && statsResponse.code !== 200) {
      throw new Error(statsResponse.msg || '获取统计数据失败');
    }
    
    return statsResponse.data;
  };
  
  // 获取时间分布数据
  const fetchTimeDistributionData = async (userId: number, period: "day" | "week" | "month", startDate: string, endDate: string) => {
    const timeDistResponse = await getUrineTimeDistribution(
      userId,
      period,
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
      const dataPoints = await fetchHistoryData(userId, startDate, endDateStr);
      
      // 2. 根据视图模式排序数据
      if (viewMode === 'day') {
        // 日模式下，按记录时间排序
        dataPoints.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
      } else {
        // 周/月模式下，按日期排序
        dataPoints.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      }
      
      // 3. 获取统计数据
      const apiPeriod = viewMode === 'day' ? 'day' : (viewMode === 'week' ? 'week' : 'month');
      const statsData = await fetchStatisticsData(userId, apiPeriod as "day" | "week" | "month", startDate, endDateStr, viewMode);
      
      // 4. 获取时间分布数据
      const timeDistData = await fetchTimeDistributionData(userId, apiPeriod as "day" | "week" | "month", startDate, endDateStr);
      
      // 5. 生成元数据
      const metadataObj = generateMetadataFromApiData(statsData, dataPoints, viewMode);
      
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
      setUrineData(dataPoints);
      setMetadata(metadataObj);
      
      debugLog('数据刷新完成', { dataPoints, metadata: metadataObj, timeDistribution: metadataObj.timeDistribution });
      
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
