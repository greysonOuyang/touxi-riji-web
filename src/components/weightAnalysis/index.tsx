import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";
import useDateNavigation from "@/components/common/useDateNavigation";
import WeightChart from "./WeightChart";
import WeightStatistics from "./WeightStatistics";
import ChartIndicators from "./ChartIndicators";
import { useWeightData } from "./useWeightData";

interface WeightAnalysisProps {
  initialViewMode?: "day" | "week" | "month";
}

const WeightAnalysis: React.FC<WeightAnalysisProps> = ({ initialViewMode = "week" }) => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">(initialViewMode);
  
  // 使用自定义钩子获取体重数据
  const {
    weightData,
    statistics,
    bmiData,
    isLoading,
    refreshData
  } = useWeightData();
  
  // 使用自定义钩子管理日期导航
  const {
    currentEndDate,
    handleDateChange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, (date) => {
    refreshData(viewMode, date);
  });
  
  // 初始加载数据
  useEffect(() => {
    refreshData(viewMode, currentEndDate);
  }, [viewMode, currentEndDate, refreshData]);
  
  // 处理视图模式变更
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode);
    // 切换视图模式时重置为当天
    resetToCurrentDate();
  };
  
  // 处理图表滑动
  const handleChartSwipe = (direction: "left" | "right") => {
    handleDateChange(direction === "left" ? "next" : "prev");
  };

  // 图表指示器数据
  const chartIndicators = [
    { label: "体重", color: "#92A3FD" }
  ];
  
  return (
    <View className="weight-analysis">
      <View className="header-container">
        <Text className="chart-title">体重趋势</Text>
        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </View>
      
      <DateNavigator
        mode={viewMode}
        currentDate={currentEndDate}
        onNavigate={handleDateChange}
        onReset={resetToCurrentDate}
      />
      
      <View className="chart-section">
        <View className="chart-controls">
          <ChartIndicators indicators={chartIndicators} />
        </View>
        
        <View className="chart-container">
          <WeightChart
            viewMode={viewMode}
            weightData={weightData}
            onSwipe={handleChartSwipe}
            isLoading={isLoading}
          />
        </View>
      </View>
      
      {/* 体重统计分析 */}
      <WeightStatistics 
        viewMode={viewMode}
        weightData={weightData}
        statistics={statistics}
        bmiData={bmiData}
        isLoading={isLoading}
      />
    </View>
  );
};

export default WeightAnalysis; 