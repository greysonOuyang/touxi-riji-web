import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import { AtSegmentedControl } from "taro-ui";
import { format, subDays, subWeeks, subMonths } from "date-fns";
import WaterChart from "./WaterChart";
import WaterStatistics from "./WaterStatistics";
import ChartIndicators from "./ChartIndicators";
import { useWaterData } from "./useWaterData";
import "./index.scss";

const WaterAnalysis: React.FC = () => {
  // 视图模式：日/周/月
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  // 当前日期
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // 使用自定义Hook获取水分摄入数据
  const { waterData, statistics, isLoading, refreshData } = useWaterData(viewMode, currentDate);
  
  // 处理视图模式切换
  const handleViewModeChange = (index: number) => {
    const modes: ("day" | "week" | "month")[] = ["day", "week", "month"];
    setViewMode(modes[index]);
  };
  
  // 处理日期导航
  const handleDateNavigation = (direction: "left" | "right") => {
    let newDate = new Date(currentDate);
    
    if (direction === "left") {
      // 向左滑动，日期增加
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else {
      // 向右滑动，日期减少
      if (viewMode === "day") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
    }
    
    // 不允许选择未来日期
    if (newDate > new Date()) {
      newDate = new Date();
    }
    
    setCurrentDate(newDate);
  };
  
  // 获取日期显示文本
  const getDateDisplayText = () => {
    if (viewMode === "day") {
      return format(currentDate, "yyyy年MM月dd日");
    } else if (viewMode === "week") {
      const weekStart = subDays(currentDate, 6);
      return `${format(weekStart, "MM月dd日")} - ${format(currentDate, "MM月dd日")}`;
    } else {
      return format(currentDate, "yyyy年MM月");
    }
  };
  
  // 图表指示器数据
  const chartIndicators = [
    { label: "喝水量", color: "#92A3FD" }
  ];
  
  return (
    <View className="water-analysis">
      {/* 标题 */}
      <View className="header">
        <Text className="title">喝水分析</Text>
      </View>
      
      {/* 视图模式选择器 */}
      <AtSegmentedControl
        values={["日", "周", "月"]}
        onClick={handleViewModeChange}
        current={["day", "week", "month"].indexOf(viewMode)}
        className="view-mode-selector"
      />
      
      {/* 日期导航 */}
      <View className="date-navigation">
        <View className="date-display">
          <Text>{getDateDisplayText()}</Text>
        </View>
      </View>
      
      {/* 图表 */}
      <WaterChart
        viewMode={viewMode}
        waterData={waterData}
        onSwipe={handleDateNavigation}
        isLoading={isLoading}
      />
      
      {/* 图表指示器 */}
      <ChartIndicators indicators={chartIndicators} />
      
      {/* 统计数据 */}
      <WaterStatistics
        statistics={statistics}
        isLoading={isLoading}
      />
    </View>
  );
};

export default WaterAnalysis;