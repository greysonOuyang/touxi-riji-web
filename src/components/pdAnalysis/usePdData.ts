import { useState, useCallback } from "react";
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import Taro from "@tarojs/taro";
import { 
  getPdRecordsStatistics, 
  getPaginatedPdRecordsData, 
  PdRecordData,
  getStats,
  StatsQuery
} from "@/api/pdRecordApi";

// 定义腹透数据类型
export interface PdDataPoint {
  date: string;
  timestamp: string;
  ultrafiltration: number;
  drainageVolume: number;
  dialysateType: string;
  recordTime: string;
  infusionVolume: number;
  hasMeasurement: boolean;
  notes?: string;
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
  totalUltrafiltration: number;
  totalDrainageVolume: number;
  totalInfusionVolume: number;
  recordCount: number;
  dialysateDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

// 计算日期范围
const getDateRange = (viewMode: "day" | "week" | "month", endDate: Date) => {
  let startDate: Date;
  
  switch (viewMode) {
    case "day":
      startDate = endDate;
      break;
    case "week":
      startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // 周一开始
      endDate = endOfWeek(endDate, { weekStartsOn: 1 }); // 周日结束
      break;
    case "month":
      startDate = startOfMonth(endDate);
      endDate = endOfMonth(endDate);
      break;
  }
  
  return {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: format(endDate, "yyyy-MM-dd")
  };
};

// 将API数据转换为图表数据点
const convertToDataPoints = (records: PdRecordData[]): PdDataPoint[] => {
  return records.map(record => ({
    date: record.recordDate,
    timestamp: `${record.recordDate}T${record.recordTime}`,
    ultrafiltration: record.ultrafiltration || 0,
    drainageVolume: record.drainageVolume,
    infusionVolume: record.infusionVolume,
    dialysateType: record.dialysateType,
    recordTime: record.recordTime.substring(0, 5), // 只保留小时和分钟
    hasMeasurement: true,
    notes: record.notes
  }));
};

// 计算统计元数据
const calculateMetadata = (data: PdDataPoint[]): PdMetadata => {
  if (data.length === 0) {
    return {
      averageUltrafiltration: 0,
      maxUltrafiltration: 0,
      minUltrafiltration: 0,
      avgDrainageVolume: 0,
      maxDrainageVolume: 0,
      minDrainageVolume: 0,
      dataCoverage: 0,
      abnormalCount: 0,
      totalUltrafiltration: 0,
      totalDrainageVolume: 0,
      totalInfusionVolume: 0,
      recordCount: 0,
      dialysateDistribution: []
    };
  }
  
  let totalUltrafiltration = 0;
  let maxUltrafiltration = data[0].ultrafiltration;
  let minUltrafiltration = data[0].ultrafiltration;
  
  let totalDrainageVolume = 0;
  let maxDrainageVolume = data[0].drainageVolume;
  let minDrainageVolume = data[0].drainageVolume;
  
  let totalInfusionVolume = 0;
  
  let abnormalCount = 0;
  
  // 透析液类型分布统计
  const dialysateTypes = new Map<string, number>();
  
  data.forEach(item => {
    // 超滤量统计
    totalUltrafiltration += item.ultrafiltration;
    maxUltrafiltration = Math.max(maxUltrafiltration, item.ultrafiltration);
    minUltrafiltration = Math.min(minUltrafiltration, item.ultrafiltration);
    
    // 引流量统计
    totalDrainageVolume += item.drainageVolume;
    maxDrainageVolume = Math.max(maxDrainageVolume, item.drainageVolume);
    minDrainageVolume = Math.min(minDrainageVolume, item.drainageVolume);
    
    // 注入量统计
    totalInfusionVolume += item.infusionVolume;
    
    // 透析液类型统计
    if (item.dialysateType) {
      dialysateTypes.set(
        item.dialysateType, 
        (dialysateTypes.get(item.dialysateType) || 0) + 1
      );
    }
    
    // 简单的异常判断逻辑
    if (item.ultrafiltration < 0 || item.ultrafiltration > 1000) {
      abnormalCount++;
    }
  });
  
  // 计算透析液分布
  const dialysateDistribution = Array.from(dialysateTypes.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / data.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    averageUltrafiltration: Math.round(totalUltrafiltration / data.length),
    maxUltrafiltration,
    minUltrafiltration,
    avgDrainageVolume: Math.round(totalDrainageVolume / data.length),
    maxDrainageVolume,
    minDrainageVolume,
    dataCoverage: 1.0, // 实际数据覆盖率
    abnormalCount,
    totalUltrafiltration,
    totalDrainageVolume,
    totalInfusionVolume,
    recordCount: data.length,
    dialysateDistribution
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
  const [lastRequest, setLastRequest] = useState<{
    viewMode: "day" | "week" | "month";
    date: string;
  } | null>(null);

  // 获取数据
  const refreshData = useCallback(async (viewMode: "day" | "week" | "month", currentDate: Date) => {
    // 检查是否与上次请求相同，避免重复请求
    const currentDateStr = format(currentDate, "yyyy-MM-dd");
    if (
      lastRequest && 
      lastRequest.viewMode === viewMode && 
      lastRequest.date === currentDateStr
    ) {
      return; // 避免重复请求相同的数据
    }
    
    setIsLoading(true);
    setError(null);
    
    // 更新最后请求信息
    setLastRequest({
      viewMode,
      date: currentDateStr
    });

    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        throw new Error("用户ID不存在");
      }
      
      const { startDate, endDate } = getDateRange(viewMode, currentDate);
      
      // 获取分页数据，设置较大的页面大小以获取所有数据
      const recordsResponse = await getPaginatedPdRecordsData(
        userId,
        1,
        1000, // 大页面大小
        startDate,
        endDate
      );
      
      if (!recordsResponse.isSuccess()) {
        throw new Error(recordsResponse.msg || "获取腹透记录失败");
      }
      
      const records = recordsResponse.data.records || [];
      const dataPoints = convertToDataPoints(records);
      
      // 计算统计数据
      const statsMetadata = calculateMetadata(dataPoints);
      
      // 如果是周或月视图，尝试获取聚合统计数据
      if (viewMode === "week" || viewMode === "month") {
        try {
          // 构建统计查询参数
          const timeKey = viewMode === "week" 
            ? `${format(currentDate, "yyyy")}-${format(currentDate, "ww")}` 
            : format(currentDate, "yyyy-MM");
          
          const statsQuery: StatsQuery = {
            userId,
            timeDimension: viewMode,
            timeKey
          };
          
          const statsResponse = await getStats(statsQuery);
          
          if (statsResponse.isSuccess() && statsResponse.data) {
            // 使用聚合统计数据更新元数据
            const aggregatedStats = statsResponse.data.aggregatedStats;
            
            if (aggregatedStats) {
              statsMetadata.averageUltrafiltration = aggregatedStats.avgUltrafiltration;
              statsMetadata.maxUltrafiltration = aggregatedStats.maxUltrafiltration;
              statsMetadata.minUltrafiltration = aggregatedStats.minUltrafiltration;
              statsMetadata.totalUltrafiltration = aggregatedStats.totalUltrafiltration;
              statsMetadata.recordCount = aggregatedStats.actualRecords;
            }
          }
        } catch (statsError) {
          console.error("获取聚合统计数据失败:", statsError);
          // 继续使用本地计算的统计数据
        }
      }
      
      // 直接设置新数据，不需要先清空再设置
      setPdData(dataPoints);
      setMetadata(statsMetadata);
    } catch (err) {
      console.error("获取腹透数据时出错:", err);
      setError(err instanceof Error ? err.message : "获取数据时发生错误");
      setPdData([]);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [lastRequest]); // 移除pdData.length依赖，只依赖lastRequest

  return {
    pdData,
    metadata,
    isLoading,
    error,
    refreshData,
  };
};

export default usePdData; 