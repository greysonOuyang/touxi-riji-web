import React from "react";
import { View, Text } from "@tarojs/components";
import "./AnalysisFramework.scss";

interface AnalysisFrameworkProps {
  title: string;
  viewMode: "day" | "week" | "month";
  onViewModeChange: (mode: "day" | "week" | "month") => void;
  currentDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  onReset: () => void;
  isLoading: boolean;
  hasData: boolean;
  onChartSwipe?: (direction: "left" | "right") => void;
  viewModeSelector: React.ReactNode;
  dateNavigator: React.ReactNode;
  chartIndicators: React.ReactNode;
  chart: React.ReactNode;
  abnormalValues?: React.ReactNode;
  statistics: React.ReactNode;
}

const AnalysisFramework: React.FC<AnalysisFrameworkProps> = ({
  title,
  viewMode,
  isLoading,
  hasData,
  onChartSwipe,
  viewModeSelector,
  dateNavigator,
  chartIndicators,
  chart,
  abnormalValues,
  statistics,
}) => {
  // 处理图表滑动
  const handleChartSwipe = (direction: "left" | "right") => {
    if (onChartSwipe) {
      onChartSwipe(direction);
    }
  };

  return (
    <View className="analysis-framework">
      <View className="header-container">
        <Text className="chart-title">{title}</Text>
        {viewModeSelector}
      </View>
      
      {dateNavigator}
      
      <View className="chart-section">
        <View className="chart-controls">
          {chartIndicators}
        </View>
        
        <View className="chart-container">
          {isLoading && (
            <View className="loading-container">
              <Text>加载中...</Text>
            </View>
          )}
          
          {!isLoading && hasData && chart}
          
          {!isLoading && !hasData && (
            <View className="empty-container">
              <Text>暂无数据</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* 异常值提醒 - 仅在日视图模式下显示 */}
      {!isLoading && hasData && viewMode === "day" && abnormalValues}
      
      {/* 统计分析 */}
      {!isLoading && hasData && statistics}
    </View>
  );
};

export default AnalysisFramework; 