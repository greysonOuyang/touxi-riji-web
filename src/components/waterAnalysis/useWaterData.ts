import { useState, useCallback } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import Taro from "@tarojs/taro";
import { getWaterIntakeRecords, getWaterIntakeStatistics, WaterIntakeVO, WaterIntakeStatisticsVO } from "@/api/waterIntakeApi";

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

export const useWaterData = () => {
  const [waterData, setWaterData] = useState<WaterIntakeVO[]>([]);
  const [statistics, setStatistics] = useState<WaterIntakeStatisticsVO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 刷新数据
  const refreshData = useCallback(async (
    viewMode: "day" | "week" | "month", 
    endDate: Date
  ) => {
    setIsLoading(true);
    
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        console.error("用户ID不存在");
        setIsLoading(false);
        return;
      }
      
      const { startDate, endDate: formattedEndDate } = getDateRange(viewMode, endDate);
      
      // 并行请求数据
      const [recordsRes, statsRes] = await Promise.all([
        getWaterIntakeRecords(userId, startDate, formattedEndDate, viewMode),
        getWaterIntakeStatistics(userId, startDate, formattedEndDate, viewMode)
      ]);
      
      if (recordsRes?.isSuccess()) {
        setWaterData(recordsRes.data || []);
      } else {
        console.error("获取喝水记录失败:", recordsRes?.msg);
        setWaterData([]);
      }
      
      if (statsRes?.isSuccess()) {
        setStatistics(statsRes.data);
      } else {
        console.error("获取喝水统计数据失败:", statsRes?.msg);
        setStatistics(null);
      }
    } catch (error) {
      console.error("获取喝水数据出错:", error);
      setWaterData([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    waterData,
    statistics,
    isLoading,
    refreshData
  };
}; 