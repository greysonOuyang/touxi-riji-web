import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import usePdData from "./usePdData";
import useDateNavigation from "./useDateNavigation";
import ViewModeSelector from "./ViewModeSelector";
import DateNavigator from "./DateNavigator";
import PdChart from "./PdChart";
import PdStatistics from "./PdStatistics";
import AbnormalValues from "./AbnormalValues";
import ChartIndicators from "./ChartIndicators";
import "./index.scss";

const PdAnalysis: React.FC = () => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  
  // 使用自定义钩子获取腹透数据和日期导航
  const { 
    pdData, 
    metadata, 
    refreshData, 
    isLoading, 
    error 
  } = usePdData();
  
  const { 
    currentDate, 
    navigateDate, 
    formatDateRange,
    resetToCurrentDate
  } = useDateNavigation(viewMode);

  // 处理视图模式变化
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode);
  };

  // 处理日期导航
  const handleDateChange = (direction: "prev" | "next") => {
    navigateDate(direction);
  };

  // 处理图表滑动
  const handleChartSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      navigateDate("next");
    } else {
      navigateDate("prev");
    }
  };

  // 当视图模式或日期变化时刷新数据
  useEffect(() => {
    refreshData(viewMode, currentDate);
  }, [viewMode, currentDate, refreshData]);

  // 设置页面标题
  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: "腹透分析"
    });
  }, []);

  // 渲染图表指示器
  const renderChartIndicators = () => {
    return (
      <ChartIndicators 
        indicators={[
          { label: "超滤量", color: "#92A3FD" },
          { label: "引流量", color: "#C58BF2" },
          { label: "注入量", color: "#EEA4CE" }
        ]} 
      />
    );
  };

  // 如果发生错误，显示错误信息
  if (error) {
    return (
      <View className="pd-analysis error">
        <Text className="error-text">加载数据时出错</Text>
        <Text className="error-message">{error}</Text>
        <View 
          className="retry-button"
          onClick={() => refreshData(viewMode, currentDate)}
        >
          <Text className="retry-text">重试</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="pd-analysis">
      {/* 头部区域 */}
      <View className="pd-header">
        <Text className="pd-title">腹透分析</Text>
        <Text className="pd-subtitle">查看您的腹透数据统计和趋势</Text>
      </View>
      
      {/* 视图模式选择器 */}
      <ViewModeSelector 
        viewMode={viewMode} 
        onViewModeChange={handleViewModeChange} 
      />
      
      {/* 日期导航器 */}
      <DateNavigator 
        currentDate={currentDate}
        mode={viewMode}
        onNavigate={handleDateChange}
        onReset={resetToCurrentDate}
      />
      
      {/* 图表区域 */}
      <View className="chart-section">
        <PdChart 
          viewMode={viewMode} 
          pdData={pdData} 
          onSwipe={handleChartSwipe}
          isLoading={isLoading}
        />
        {renderChartIndicators()}
      </View>
      
      {/* 统计区域 */}
      <PdStatistics 
        pdData={pdData} 
        metadata={metadata} 
        viewMode={viewMode}
        isLoading={isLoading}
      />
      
      {/* 异常值区域 */}
      <AbnormalValues 
        pdData={pdData} 
        viewMode={viewMode}
        isLoading={isLoading}
      />
    </View>
  );
};

export default PdAnalysis; 