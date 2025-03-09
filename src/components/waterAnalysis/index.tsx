import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import WaterChart from "./WaterChart";
import WaterStatistics from "./WaterStatistics";
import WaterTimeDistribution from "./WaterTimeDistribution";
import WaterHabitAnalysis from "./WaterHabitAnalysis";
import { useWaterData } from "./useWaterData";
import { getWaterIntakeTimeDistribution, getWaterIntakeHabitAnalysis, WaterIntakeTimeDistributionVO, WaterIntakeHabitVO } from "@/api/waterIntakeApi";
import "./index.scss";

interface WaterAnalysisProps {
  viewMode: "day" | "week" | "month";
  onViewModeChange: (viewMode: "day" | "week" | "month") => void;
}

const WaterAnalysis: React.FC<WaterAnalysisProps> = ({ viewMode, onViewModeChange }) => {
  const [endDate, setEndDate] = useState(new Date());
  const { waterData, statistics, isLoading, refreshData } = useWaterData();
  const [timeDistribution, setTimeDistribution] = useState<WaterIntakeTimeDistributionVO | undefined>(undefined);
  const [habitAnalysis, setHabitAnalysis] = useState<WaterIntakeHabitVO | undefined>(undefined);
  const [isTimeDistLoading, setIsTimeDistLoading] = useState(false);
  const [isHabitLoading, setIsHabitLoading] = useState(false);

  // 初始化数据
  useEffect(() => {
    refreshData(viewMode, endDate);
    fetchTimeDistribution();
    fetchHabitAnalysis();
  }, [viewMode, endDate, refreshData]);

  // 获取时间分布数据
  const fetchTimeDistribution = async () => {
    setIsTimeDistLoading(true);
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        console.error("用户ID不存在");
        setIsTimeDistLoading(false);
        return;
      }
      
      const { startDate, endDate: formattedEndDate } = getDateRange(viewMode, endDate);
      
      const response = await getWaterIntakeTimeDistribution(
        userId, 
        startDate, 
        formattedEndDate
      );
      
      if (response.isSuccess()) {
        setTimeDistribution(response.data);
      } else {
        console.error("获取时间分布失败:", response.msg);
      }
    } catch (error) {
      console.error("获取时间分布出错:", error);
    } finally {
      setIsTimeDistLoading(false);
    }
  };

  // 获取习惯分析数据
  const fetchHabitAnalysis = async () => {
    setIsHabitLoading(true);
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        console.error("用户ID不存在");
        setIsHabitLoading(false);
        return;
      }
      
      const response = await getWaterIntakeHabitAnalysis(userId, 30); // 分析最近30天
      
      if (response.isSuccess()) {
        setHabitAnalysis(response.data);
      } else {
        console.error("获取习惯分析失败:", response.msg);
      }
    } catch (error) {
      console.error("获取习惯分析出错:", error);
    } finally {
      setIsHabitLoading(false);
    }
  };

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

  // 切换视图模式
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    onViewModeChange(mode);
    fetchTimeDistribution();
  };

  // 切换日期
  const handleDateChange = (newEndDate: Date) => {
    setEndDate(newEndDate);
    fetchTimeDistribution();
  };

  return (
    <ScrollView className="water-analysis" scrollY>
      <View className="section">
        <WaterChart 
          waterData={waterData} 
          viewMode={viewMode}
          endDate={endDate}
          onViewModeChange={handleViewModeChange}
          onDateChange={handleDateChange}
        />
      </View>
      
      <View className="section">
        <WaterStatistics 
          statistics={statistics} 
          isLoading={isLoading} 
        />
      </View>
      
      <View className="section">
        <WaterTimeDistribution 
          distribution={timeDistribution} 
          isLoading={isTimeDistLoading} 
        />
      </View>
      
      <View className="section">
        <WaterHabitAnalysis 
          habitAnalysis={habitAnalysis} 
          isLoading={isHabitLoading} 
        />
      </View>
    </ScrollView>
  );
};

export default WaterAnalysis;