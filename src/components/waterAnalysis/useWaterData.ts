import { useState, useCallback, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isValid } from "date-fns";
import Taro from "@tarojs/taro";
import { getWaterIntakeRecords, getWaterStatistics, WaterIntakeVO, WaterStatisticsVO } from "@/api/waterIntakeApi";

// 计算日期范围
const getDateRange = (viewMode: "day" | "week" | "month", endDate: Date) => {
  // 确保endDate是有效的日期对象
  if (!isValid(endDate)) {
    endDate = new Date(); // 如果无效，使用当前日期
    console.warn("提供了无效的日期，使用当前日期代替");
  }
  
  let startDate: Date;
  
  try {
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
      default:
        startDate = endDate;
    }
    
    // 确保日期有效
    if (!isValid(startDate)) startDate = new Date();
    if (!isValid(endDate)) endDate = new Date();
    
    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd")
    };
  } catch (error) {
    console.error("日期范围计算错误:", error);
    // 出错时返回今天的日期
    const today = new Date();
    return {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd")
    };
  }
};

// 默认建议饮水上限（毫升/天）- 尿毒症患者
const DEFAULT_RECOMMENDED_LIMIT = 1000;

export const useWaterData = () => {
  const [waterData, setWaterData] = useState<WaterIntakeVO[]>([]);
  const [statistics, setStatistics] = useState<WaterStatisticsVO | null>(null);
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
      
      // 确保endDate是有效的日期对象
      if (!isValid(endDate)) {
        endDate = new Date();
        console.warn("提供了无效的日期，使用当前日期代替");
      }
      
      const { startDate, endDate: formattedEndDate } = getDateRange(viewMode, endDate);
      
      // 并行请求数据
      const [recordsRes, statsRes] = await Promise.all([
        getWaterIntakeRecords(userId, startDate, formattedEndDate, viewMode),
        getWaterStatistics(userId, startDate, formattedEndDate, viewMode)
      ]);
      
      if (recordsRes?.isSuccess()) {
        setWaterData(recordsRes.data || []);
      } else {
        console.error("获取喝水记录失败:", recordsRes?.msg);
        setWaterData([]);
      }
      
      if (statsRes?.isSuccess()) {
        // 设置统计数据
        setStatistics(statsRes.data);
      } else {
        console.error("获取喝水统计数据失败:", statsRes?.msg);
        
        // 如果API失败但存在记录数据，创建一个基本的统计信息
        if (recordsRes?.isSuccess() && recordsRes.data && recordsRes.data.length > 0) {
          const records = recordsRes.data;
          const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
          const maxAmount = Math.max(...records.map(record => record.amount));
          const averageAmount = Math.round(totalAmount / records.length);
          
          // 计算达标率 (不超过建议上限的比例)
          const isWithinLimit = totalAmount <= DEFAULT_RECOMMENDED_LIMIT ? 1 : 0;
          
          setStatistics({
            totalAmount,
            recommendedLimit: DEFAULT_RECOMMENDED_LIMIT,
            averageAmount,
            maxAmount,
            recordDays: 1,
            completionRate: isWithinLimit * 100
          });
        } else {
          setStatistics(null);
        }
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