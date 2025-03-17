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
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  
  // 使用 currentDate 替换 currentEndDate
  const { 
    currentDate = new Date(), // 默认值
    handleDateChange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, () => {});

  const { 
    pdData, 
    metadata, 
    refreshData, 
    isLoading, 
    error 
  } = usePdData();

  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode);
    resetToCurrentDate();
  };

  useEffect(() => {
    if (currentDate && !isNaN(new Date(currentDate).getTime())) {
      refreshData(viewMode, currentDate);
    } else {
      console.error("Invalid currentDate:", currentDate);
    }
  }, [viewMode, currentDate, refreshData]);

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: "腹透分析" });
  }, []);

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

  if (isLoading || !currentDate) {
    return (
      <View className="pd-analysis">
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <View className="pd-analysis">
      <View className="header-container">
        <Text className="chart-title">腹透趋势</Text>
        <ViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </View>
      
      <DateNavigator 
        mode={viewMode}
        currentDate={currentDate} // 使用 currentDate
        onNavigate={handleDateChange}
        onReset={resetToCurrentDate}
      />
      
      <View className="chart-section">
        <View className="chart-container">
          {pdData && pdData.length > 0 ? (
            <PdChart 
              key={`chart-${viewMode}`} 
              viewMode={viewMode} 
              pdData={pdData} 
              isLoading={false}
            />
          ) : (
            <View className="empty-container">
              <Text>暂无数据</Text>
            </View>
          )}
        </View>
      </View>
      
      {pdData && Array.isArray(pdData) && pdData.length > 0 && viewMode === "day" && (
        <AbnormalValues 
          pdData={pdData} 
          viewMode={viewMode}
          isLoading={false}
        />
      )}
      
      {pdData && Array.isArray(pdData) && pdData.length > 0 && (
        <PdStatistics 
          key={`stats-${viewMode}`} 
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