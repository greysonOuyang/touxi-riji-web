import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import useUrineData from "./useUrineData";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";
import useDateNavigation from "@/components/common/useDateNavigation";
import UrineChart from "./UrineChart";
import UrineStatistics from "./UrineStatistics";
import UrineVolumeDistribution from "./AbnormalValues";
import UrineRecentRecords from "./UrineRecentRecords";
import "./index.scss";

const UrineAnalysis: React.FC = () => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  
  // 使用公共的日期导航钩子
  const { 
    currentEndDate,
    handleDateChange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, (date) => {
    // 日期变化时的回调，这里不需要主动调用refreshData
    // 因为useEffect会监听currentEndDate的变化
  });
  
  // 使用自定义钩子获取尿量数据
  const { 
    urineData, 
    metadata, 
    refreshData, 
    isLoading, 
    error,
    timeDistribution
  } = useUrineData();

  // 视图模式变化处理
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    if (mode !== viewMode) {
      setViewMode(mode);
      
      // 重置为当前日期
      resetToCurrentDate();
    }
  };

  // 当视图模式或日期变化时刷新数据
  useEffect(() => {
    refreshData(viewMode, currentEndDate);
  }, [viewMode, currentEndDate, refreshData]);

  // 在UrineAnalysis组件中添加onSwipe处理函数
  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      // 向左滑动，显示下一天/周/月
      handleDateChange("next");
    } else {
      // 向右滑动，显示上一天/周/月
      handleDateChange("prev");
    }
  };

 

  return (
    <View className="urine-analysis">
      <View className="content-wrapper">
        {/* 头部容器 */}
        <View className="header-container">
          <Text className="chart-title">尿量趋势</Text>
          <ViewModeSelector 
            viewMode={viewMode} 
            onViewModeChange={handleViewModeChange} 
          />
        </View>
        
        {/* 日期导航器 */}
        <View className="navigator-wrapper">
          <DateNavigator 
            mode={viewMode}
            currentDate={currentEndDate}
            onNavigate={handleDateChange}
            onReset={resetToCurrentDate}
          />
        </View>
        
        {/* 图表区域 */}
        <View className="chart-section">
          <View className="chart-container">
            
            
            {!isLoading && urineData && urineData.length > 0 && (
              <UrineChart 
                key={`chart-${viewMode}`}
                viewMode={viewMode} 
                urineData={urineData} 
                isLoading={false}
                onSwipe={handleSwipe}
              />
            )}
            
            {!isLoading && (!urineData || urineData.length === 0) && (
              <View className="empty-container">
                <Text>暂无数据</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* 尿量统计分析 - 优先显示 */}
        {!isLoading && urineData && Array.isArray(urineData) && urineData.length > 0 && (
          <UrineStatistics 
            key={`stats-${viewMode}`}
            urineData={urineData} 
            metadata={metadata} 
            timeDistribution={timeDistribution}
            viewMode={viewMode}
            isLoading={false}
          />
        )}
        
        {/* 异常值分析 */}
        {!isLoading && urineData && Array.isArray(urineData) && urineData.length > 0 && (
          <UrineVolumeDistribution 
            urineData={urineData} 
            viewMode={viewMode}
            baselineVolume={metadata?.baselineVolume}
            isLoading={false}
          />
        )}
        
        {/* 最近尿量记录 */}
        <UrineRecentRecords 
          limit={5}
          onViewMore={() => Taro.navigateTo({ url: '/pages/urineHistory/index' })}
        />
      </View>
    </View>
  );
};

export default UrineAnalysis; 