import { useState, useCallback, useRef } from "react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";
import Taro from "@tarojs/taro";

// 定义尿量数据类型
export interface UrineDataPoint {
  date: string;
  timestamp: string;
  volume: number;  // 尿量(ml)
  recordTime: string;
  hasMeasurement: boolean;
  notes?: string;
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
  // 新增字段
  timeDistribution: {
    period: string;
    count: number;
    percentage: number;
    totalVolume: number;
    avgVolume: number;
  }[];
  trend: "increasing" | "decreasing" | "stable" | "fluctuating";
  trendPercentage: number;
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

// 获取时间段
export const getTimePeriod = (timeStr: string) => {
  const hour = parseInt(timeStr.split(':')[0], 10);
  
  if (hour >= TIME_PERIODS.MORNING.range[0] && hour <= TIME_PERIODS.MORNING.range[1]) {
    return TIME_PERIODS.MORNING.name;
  } else if (hour >= TIME_PERIODS.AFTERNOON.range[0] && hour <= TIME_PERIODS.AFTERNOON.range[1]) {
    return TIME_PERIODS.AFTERNOON.name;
  } else if (hour >= TIME_PERIODS.EVENING.range[0] && hour <= TIME_PERIODS.EVENING.range[1]) {
    return TIME_PERIODS.EVENING.name;
  } else {
    return TIME_PERIODS.NIGHT.name;
  }
};

// 计算趋势
export const calculateTrend = (data: UrineDataPoint[], viewMode: "day" | "week" | "month") => {
  if (data.length < 2) {
    return { trend: "stable" as const, percentage: 0 };
  }
  
  // 按日期分组
  const dailyData = new Map<string, number>();
  
  data.forEach(item => {
    const date = item.date.split(' ')[0];
    dailyData.set(date, (dailyData.get(date) || 0) + item.volume);
  });
  
  // 转换为数组并排序
  const sortedData = Array.from(dailyData.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  
  if (sortedData.length < 2) {
    return { trend: "stable" as const, percentage: 0 };
  }
  
  // 计算趋势
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, [_, volume]) => sum + volume, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, [_, volume]) => sum + volume, 0) / secondHalf.length;
  
  const difference = secondHalfAvg - firstHalfAvg;
  const percentageChange = firstHalfAvg !== 0 ? (difference / firstHalfAvg) * 100 : 0;
  
  // 计算波动性
  const volumes = sortedData.map(([_, volume]) => volume);
  const avgVolume = volumes.reduce((sum, volume) => sum + volume, 0) / volumes.length;
  const variance = volumes.reduce((sum, volume) => sum + Math.pow(volume - avgVolume, 2), 0) / volumes.length;
  const stdDeviation = Math.sqrt(variance);
  const coefficientOfVariation = (stdDeviation / avgVolume) * 100;
  
  let trend: "increasing" | "decreasing" | "stable" | "fluctuating" = "stable";
  
  if (coefficientOfVariation > 30) {
    trend = "fluctuating";
  } else if (percentageChange > 10) {
    trend = "increasing";
  } else if (percentageChange < -10) {
    trend = "decreasing";
  }
  
  return { trend, percentage: Math.abs(Math.round(percentageChange)) };
};

// 计算统计元数据
const calculateMetadata = (data: UrineDataPoint[], viewMode: "day" | "week" | "month"): UrineMetadata => {
  if (data.length === 0) {
    return {
      averageVolume: 0,
      maxVolume: 0,
      minVolume: 0,
      totalVolume: 0,
      dataCoverage: 0,
      abnormalCount: 0,
      recordCount: 0,
      dailyAverage: 0,
      dayWithMaxVolume: "",
      dayWithMinVolume: "",
      timeDistribution: [],
      trend: "stable",
      trendPercentage: 0
    };
  }
  
  let totalVolume = 0;
  let maxVolume = data[0].volume;
  let minVolume = data[0].volume;
  let abnormalCount = 0;
  let dayWithMaxVolume = data[0].date;
  let dayWithMinVolume = data[0].date;
  
  // 按日期分组的数据，用于计算每日总量
  const dailyData = new Map<string, number>();
  
  // 按时间段分组的数据
  const periodData = new Map<string, { count: number, totalVolume: number }>();
  
  data.forEach(item => {
    // 尿量统计
    totalVolume += item.volume;
    
    // 按日期分组
    const currentDate = item.date.split(' ')[0]; // 提取日期部分
    dailyData.set(
      currentDate,
      (dailyData.get(currentDate) || 0) + item.volume
    );
    
    // 按时间段分组
    const period = getTimePeriod(item.recordTime);
    const periodStats = periodData.get(period) || { count: 0, totalVolume: 0 };
    periodStats.count += 1;
    periodStats.totalVolume += item.volume;
    periodData.set(period, periodStats);
    
    // 简单的异常判断逻辑
    const volumeStatus = getUrineVolumeStatus(item.volume);
    if (volumeStatus !== "normal") {
      abnormalCount++;
    }
  });
  
  // 找出每日最大和最小尿量
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
  
  // 计算时间分布
  const timeDistribution = Array.from(periodData.entries())
    .map(([period, stats]) => ({
      period,
      count: stats.count,
      percentage: Math.round((stats.count / data.length) * 100),
      totalVolume: stats.totalVolume,
      avgVolume: Math.round(stats.totalVolume / stats.count)
    }))
    .sort((a, b) => {
      // 按时间段顺序排序
      const periodOrder = ["早晨", "下午", "晚上", "夜间"];
      return periodOrder.indexOf(a.period) - periodOrder.indexOf(b.period);
    });
  
  // 计算数据覆盖率
  let expectedDays = 1;
  if (viewMode === "week") {
    expectedDays = 7;
  } else if (viewMode === "month") {
    expectedDays = 30;
  }
  
  const uniqueDays = new Set(data.map(item => item.date.split(' ')[0])).size;
  const dataCoverage = uniqueDays / expectedDays;
  
  // 计算趋势
  const { trend, percentage } = calculateTrend(data, viewMode);
  
  return {
    averageVolume: Math.round(totalVolume / data.length),
    maxVolume: maxDailyVolume,
    minVolume: minDailyVolume === Number.MAX_SAFE_INTEGER ? 0 : minDailyVolume,
    totalVolume,
    dataCoverage,
    abnormalCount,
    recordCount: data.length,
    dailyAverage: Math.round(totalVolume / uniqueDays),
    dayWithMaxVolume,
    dayWithMinVolume,
    timeDistribution,
    trend,
    trendPercentage: percentage
  };
};

// 模拟API调用获取尿量数据
const fetchUrineData = async (startDate: string, endDate: string): Promise<UrineDataPoint[]> => {
  // 这里应该是实际的API调用，现在使用模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 生成模拟数据
      const mockData: UrineDataPoint[] = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // 每天生成1-4条记录
        const recordCount = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < recordCount; i++) {
          // 生成随机时间
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // 生成随机尿量 (200-500ml)
          const volume = Math.floor(Math.random() * 300) + 200;
          
          mockData.push({
            date: dateStr,
            timestamp: `${dateStr} ${timeStr}`,
            volume,
            recordTime: timeStr,
            hasMeasurement: true,
            notes: Math.random() > 0.8 ? "用户备注" : undefined
          });
        }
        
        // 前进一天
        currentDate = addDays(currentDate, 1);
      }
      
      resolve(mockData);
    }, 500); // 模拟网络延迟
  });
};

// 自定义钩子
const useUrineData = () => {
  // 状态管理
  const [urineData, setUrineData] = useState<UrineDataPoint[]>([]);
  const [metadata, setMetadata] = useState<UrineMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 请求控制
  const activeRequestRef = useRef<string | null>(null);
  
  // 显示提示
  const showToast = (message: string) => {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  };
  
  // 清空所有数据
  const clearData = useCallback(() => {
    setUrineData([]);
    setMetadata(null);
  }, []);
  
  // 刷新数据
  const refreshData = useCallback(async (
    viewMode: "day" | "week" | "month" = "day",
    endDate: Date = new Date()
  ) => {
    // 生成请求ID
    const requestId = `${viewMode}-${endDate.toISOString()}`;
    
    // 如果已经有相同的请求在进行中，则不重复请求
    if (requestId === activeRequestRef.current) {
      return;
    }
    
    // 设置当前请求ID
    activeRequestRef.current = requestId;
    
    // 开始加载
    setIsLoading(true);
    setError(null);
    
    try {
      // 根据视图模式确定日期范围
      let startDate: Date;
      
      if (viewMode === "day") {
        startDate = endDate;
      } else if (viewMode === "week") {
        startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // 周一开始
        endDate = endOfWeek(endDate, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(endDate);
        endDate = endOfMonth(endDate);
      }
      
      // 格式化日期
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // 获取数据
      const data = await fetchUrineData(formattedStartDate, formattedEndDate);
      
      // 如果请求ID已经改变，说明有新的请求，放弃当前结果
      if (requestId !== activeRequestRef.current) {
        return;
      }
      
      // 计算元数据
      const meta = calculateMetadata(data, viewMode);
      
      // 更新状态
      setUrineData(data);
      setMetadata(meta);
    } catch (err) {
      // 如果请求ID已经改变，说明有新的请求，放弃当前错误处理
      if (requestId !== activeRequestRef.current) {
        return;
      }
      
      console.error("获取尿量数据失败:", err);
      setError("获取数据失败，请稍后重试");
      showToast("获取数据失败，请稍后重试");
      clearData();
    } finally {
      // 如果请求ID没有改变，才更新加载状态
      if (requestId === activeRequestRef.current) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  }, [clearData]);
  
  return {
    urineData,
    metadata,
    refreshData,
    isLoading,
    error,
    clearData
  };
};

export default useUrineData; 