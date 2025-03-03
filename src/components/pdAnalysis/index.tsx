import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import usePdData from "./usePdData";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";
import useDateNavigation from "@/components/common/useDateNavigation";
import PdChart from "./PdChart";
import PdStatistics from "./PdStatistics";
import AbnormalValues from "./AbnormalValues";
import "./index.scss";

const PdAnalysis: React.FC = () => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  
  // 使用公共的日期导航钩子
  const { 
    currentEndDate,
    handleDateChange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, (date) => {
    refreshData(viewMode, date);
  });
  
  // 使用自定义钩子获取腹透数据
  const { 
    pdData, 
    metadata, 
    refreshData, 
    isLoading, 
    error 
  } = usePdData();

  // 处理视图模式变化
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode);
    // 切换视图模式时重置为当天
    resetToCurrentDate();
  };

  // 当视图模式或日期变化时刷新数据
  useEffect(() => {
    refreshData(viewMode, currentEndDate);
  }, [viewMode, currentEndDate, refreshData]);

  // 设置页面标题
  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: "腹透分析"
    });
  }, []);

  // 如果发生错误，显示错误信息
  if (error) {
    return (
      <View className="pd-analysis error">
        <Text className="error-text">加载数据时出错</Text>
        <Text className="error-message">{error}</Text>
        <View 
          className="retry-button"
          onClick={() => refreshData(viewMode, currentEndDate)}
        >
          <Text className="retry-text">重试</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="pd-analysis">
      {/* 头部容器 - 与血压分析保持一致 */}
      <View className="header-container">
        <Text className="chart-title">腹透趋势</Text>
        <ViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </View>
      
      {/* 日期导航器 */}
      <DateNavigator 
        mode={viewMode}
        currentDate={currentEndDate}
        onNavigate={handleDateChange}
        onReset={resetToCurrentDate}
      />
      
      {/* 图表区域 */}
      <View className="chart-section">
        <View className="chart-container">
          {isLoading && (
            <View className="loading-container">
              <Text>加载中...</Text>
            </View>
          )}
          
          {!isLoading && pdData && pdData.length > 0 && (
            <PdChart 
              viewMode={viewMode} 
              pdData={pdData} 
              isLoading={false}
            />
          )}
          
          {!isLoading && (!pdData || pdData.length === 0) && (
            <View className="empty-container">
              <Text>暂无数据</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* 异常值分析 - 仅在日视图模式下显示 */}
      {!isLoading && pdData && Array.isArray(pdData) && pdData.length > 0 && viewMode === "day" && (
        <AbnormalValues 
          pdData={pdData} 
          viewMode={viewMode}
          isLoading={false}
        />
      )}
      
      {/* 腹透统计分析 */}
      {!isLoading && pdData && Array.isArray(pdData) && pdData.length > 0 && (
        <PdStatistics 
          pdData={pdData} 
          metadata={metadata} 
          viewMode={viewMode}
          isLoading={false}
        />
      )}
    </View>
  );
};

export default PdAnalysis;