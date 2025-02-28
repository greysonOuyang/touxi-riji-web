import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { format } from "date-fns";
import Taro from "@tarojs/taro";
import "./index.scss";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";
import useDateNavigation from "@/components/common/useDateNavigation";
import usePdData from "./usePdData";

// 临时模拟组件
const PdChart: React.FC<any> = ({ viewMode, pdData, onSwipe }) => {
  return (
    <View className="pd-chart-placeholder" style={{ height: '200px', background: '#f5f7fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Text>腹透数据图表 ({viewMode}模式，{pdData.length}条数据)</Text>
    </View>
  );
};

const PdStatistics: React.FC<any> = ({ pdData, metadata, viewMode }) => {
  return (
    <View className="pd-statistics-placeholder" style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <View style={{ marginBottom: '8px', fontWeight: 'bold' }}>腹透数据统计</View>
      <View>平均超滤量: {metadata?.averageUltrafiltration || 0} ml</View>
      <View>最大超滤量: {metadata?.maxUltrafiltration || 0} ml</View>
      <View>最小超滤量: {metadata?.minUltrafiltration || 0} ml</View>
    </View>
  );
};

const AbnormalValues: React.FC<any> = ({ pdData, viewMode }) => {
  return (
    <View className="abnormal-values-placeholder" style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px' }}>
      <View style={{ marginBottom: '8px', fontWeight: 'bold' }}>异常值提醒</View>
      <View>今日有 {pdData.filter(d => d.ultrafiltration < 200 || d.ultrafiltration > 800).length} 条异常记录</View>
    </View>
  );
};

// 图表指示器组件
const ChartIndicators: React.FC<{indicators: {label: string, color: string}[]}> = ({ indicators }) => {
  return (
    <View className="chart-indicators" style={{ display: 'flex', marginBottom: '12px' }}>
      {indicators.map((indicator, index) => (
        <View key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <View style={{ width: '8px', height: '8px', borderRadius: '50%', background: indicator.color, marginRight: '4px' }} />
          <Text style={{ fontSize: '12px', color: '#666' }}>{indicator.label}</Text>
        </View>
      ))}
      <Text style={{ fontSize: '12px', color: '#999', marginLeft: 'auto' }}>单位：ml</Text>
    </View>
  );
};

const PdAnalysis: React.FC = () => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  
  // 使用自定义钩子管理日期导航
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
    isLoading,
    refreshData
  } = usePdData();
  
  // 当视图模式或日期变化时，重新获取数据
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
    { label: "超滤量", color: "#92A3FD" },
    { label: "引流量", color: "#C58BF2" },
    { label: "目标值", color: "#EEA4CE" }
  ];
  
  // === 渲染 ===
  return (
    <View className="pd-analysis">
      <View className="header-container">
        <Text className="chart-title">超滤量趋势</Text>
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
          {isLoading && (
            <View className="loading-container">
              <Text>加载中...</Text>
            </View>
          )}
          
          {!isLoading && pdData && pdData.length > 0 && (
            <PdChart
              viewMode={viewMode}
              pdData={pdData}
              onSwipe={handleChartSwipe}
            />
          )}
          
          {!isLoading && (!pdData || pdData.length === 0) && (
            <View className="empty-container">
              <Text>暂无数据</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* 异常值提醒 - 仅在日视图模式下显示 */}
      {!isLoading && pdData && Array.isArray(pdData) && pdData.length > 0 && viewMode === "day" && (
        <AbnormalValues pdData={pdData} viewMode={viewMode} />
      )}
      
      {/* 腹透统计分析 */}
      {!isLoading && pdData && Array.isArray(pdData) && pdData.length > 0 && (
        <PdStatistics 
          pdData={pdData}
          metadata={metadata}
          viewMode={viewMode}
        />
      )}
    </View>
  );
};

export default PdAnalysis; 