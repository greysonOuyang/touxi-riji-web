import { useState, useCallback } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import Taro from "@tarojs/taro";
import { getWeightRecords, getWeightStatistics, getBmiData } from "@/api/weightApi";

// 体重数据点类型
export interface WeightDataPoint {
  date: string; // 日期，格式：YYYY-MM-DD
  timestamp: string; // 时间戳，格式：YYYY-MM-DD HH:mm:ss
  weight: number; // 体重值
  bodyWaterPercentage?: number; // 身体水分比例（可选）
  note?: string; // 备注信息（可选）
  scaleType: string; // 称重方式
  hasMeasurement: boolean; // 是否有测量数据
  formattedDate?: string; // 格式化后的日期，如"周一"、"1月1日"等
}

// 体重统计数据类型
export interface WeightStatisticsVO {
  averageWeight: number; // 平均体重
  maxWeight: number; // 最高体重
  minWeight: number; // 最低体重
  weightChange: number; // 体重变化（最后一次记录与第一次记录的差值）
  standardWeight: number; // 标准体重（根据身高计算）
  weightFluctuation: number; // 体重波动（最大值与最小值的差）
  dataCoverage: number; // 数据覆盖率（0-1之间的值）
  totalMeasurements: number; // 总测量次数
  abnormalCount: number; // 异常记录次数
}

// BMI数据类型
export interface BmiDataVO {
  bmiValue: number; // BMI值
  bmiCategory: string; // BMI分类（偏瘦/正常/超重/肥胖）
  height: number; // 身高（厘米）
  weight: number; // 当前体重（公斤）
  idealWeightMin: number; // 理想体重范围最小值
  idealWeightMax: number; // 理想体重范围最大值
  bmiPercentile: number; // BMI在刻度上的百分比位置（0-100）
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

export const useWeightData = () => {
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [statistics, setStatistics] = useState<WeightStatisticsVO | null>(null);
  const [bmiData, setBmiData] = useState<BmiDataVO | null>(null);
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
      const [recordsRes, statsRes, bmiRes] = await Promise.all([
        getWeightRecords(userId, startDate, formattedEndDate, viewMode),
        getWeightStatistics(userId, startDate, formattedEndDate, viewMode),
        getBmiData(userId)
      ]);
      
      if (recordsRes?.isSuccess()) {
        setWeightData(recordsRes.data || []);
      } else {
        console.error("获取体重记录失败:", recordsRes?.msg);
        setWeightData([]);
      }
      
      if (statsRes?.isSuccess()) {
        setStatistics(statsRes.data);
      } else {
        console.error("获取体重统计数据失败:", statsRes?.msg);
        setStatistics(null);
      }
      
      if (bmiRes?.isSuccess()) {
        setBmiData(bmiRes.data);
      } else {
        console.error("获取BMI数据失败:", bmiRes?.msg);
        setBmiData(null);
      }
    } catch (error) {
      console.error("获取体重数据出错:", error);
      setWeightData([]);
      setStatistics(null);
      setBmiData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    weightData,
    statistics,
    bmiData,
    isLoading,
    refreshData
  };
}; 