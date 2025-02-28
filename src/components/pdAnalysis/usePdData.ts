import { useState, useCallback } from "react";
import { format, addDays } from "date-fns";

// 定义腹透数据类型
export interface PdDataPoint {
  date: string;
  timestamp: string;
  ultrafiltration: number;
  drainageVolume: number;
  dialysateType: string;
  recordTime: string;
  hasMeasurement: boolean;
}

// 定义元数据类型
export interface PdMetadata {
  averageUltrafiltration: number;
  maxUltrafiltration: number;
  minUltrafiltration: number;
  avgDrainageVolume: number;
  maxDrainageVolume: number;
  minDrainageVolume: number;
  dataCoverage: number;
  abnormalCount: number;
}

// 生成模拟数据
const generateMockData = (viewMode: "day" | "week" | "month", date: Date): PdDataPoint[] => {
  const result: PdDataPoint[] = [];
  
  // 根据视图模式确定生成数据的数量
  const dataCount = viewMode === "day" ? 4 : viewMode === "week" ? 7 : 30;
  
  for (let i = 0; i < dataCount; i++) {
    const currentDate = new Date(date);
    
    // 日视图生成当天的多个时间点数据，周/月视图生成多天的数据
    if (viewMode === "day") {
      // 一天内的不同时间点
      const hours = [8, 12, 18, 22];
      currentDate.setHours(hours[i], 0, 0);
    } else {
      // 不同的日期
      currentDate.setDate(currentDate.getDate() - (dataCount - 1) + i);
    }
    
    // 随机生成数据
    const ultrafiltration = Math.floor(Math.random() * 500) + 200; // 200-700
    const drainageVolume = Math.floor(Math.random() * 1000) + 1000; // 1000-2000
    const dialysateTypes = ["1.5%", "2.5%", "4.25%"];
    const dialysateType = dialysateTypes[Math.floor(Math.random() * dialysateTypes.length)];
    
    // 格式化日期和时间
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const timeStr = format(currentDate, "HH:mm:ss");
    
    result.push({
      date: dateStr,
      timestamp: `${dateStr}T${timeStr}`,
      ultrafiltration,
      drainageVolume,
      dialysateType,
      recordTime: timeStr,
      hasMeasurement: true
    });
  }
  
  return result;
};

// 计算模拟元数据
const calculateMockMetadata = (data: PdDataPoint[]): PdMetadata => {
  if (data.length === 0) {
    return {
      averageUltrafiltration: 0,
      maxUltrafiltration: 0,
      minUltrafiltration: 0,
      avgDrainageVolume: 0,
      maxDrainageVolume: 0,
      minDrainageVolume: 0,
      dataCoverage: 0,
      abnormalCount: 0
    };
  }
  
  let totalUltrafiltration = 0;
  let maxUltrafiltration = data[0].ultrafiltration;
  let minUltrafiltration = data[0].ultrafiltration;
  
  let totalDrainageVolume = 0;
  let maxDrainageVolume = data[0].drainageVolume;
  let minDrainageVolume = data[0].drainageVolume;
  
  let abnormalCount = 0;
  
  data.forEach(item => {
    // 超滤量统计
    totalUltrafiltration += item.ultrafiltration;
    maxUltrafiltration = Math.max(maxUltrafiltration, item.ultrafiltration);
    minUltrafiltration = Math.min(minUltrafiltration, item.ultrafiltration);
    
    // 引流量统计
    totalDrainageVolume += item.drainageVolume;
    maxDrainageVolume = Math.max(maxDrainageVolume, item.drainageVolume);
    minDrainageVolume = Math.min(minDrainageVolume, item.drainageVolume);
    
    // 简单的异常判断逻辑
    if (item.ultrafiltration < 200 || item.ultrafiltration > 800) {
      abnormalCount++;
    }
  });
  
  return {
    averageUltrafiltration: Math.round(totalUltrafiltration / data.length),
    maxUltrafiltration,
    minUltrafiltration,
    avgDrainageVolume: Math.round(totalDrainageVolume / data.length),
    maxDrainageVolume,
    minDrainageVolume,
    dataCoverage: 0.85, // 模拟数据覆盖率
    abnormalCount
  };
};

/**
 * 腹透数据自定义钩子
 * 根据不同的视图模式（日/周/月）和日期获取腹透数据
 */
const usePdData = () => {
  const [pdData, setPdData] = useState<PdDataPoint[]>([]);
  const [metadata, setMetadata] = useState<PdMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  const refreshData = useCallback((viewMode: "day" | "week" | "month", currentDate: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      // 使用模拟数据替代实际API请求
      setTimeout(() => {
        const mockData = generateMockData(viewMode, currentDate);
        const mockMetadata = calculateMockMetadata(mockData);
        
        setPdData(mockData);
        setMetadata(mockMetadata);
        setIsLoading(false);
      }, 500); // 模拟网络延迟
    } catch (err) {
      console.error("获取腹透数据时出错:", err);
      setError("获取数据时发生错误");
      setPdData([]);
      setIsLoading(false);
    }
  }, []);

  return {
    pdData,
    metadata,
    isLoading,
    error,
    refreshData,
  };
};

export default usePdData; 