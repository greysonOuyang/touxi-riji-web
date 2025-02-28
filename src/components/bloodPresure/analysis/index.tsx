"use client"

import React, { useState, useEffect } from "react"
import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import "./index.scss"
import ViewModeSelector from "@/components/common/ViewModeSelector"
import DateNavigator from "@/components/common/DateNavigator"
import BPChart from "./BPChart"
import BPStatistics from "./BPStatistics"
import AbnormalValues from "./AbnormalValues"
import useDateNavigation from "@/components/common/useDateNavigation"
import { useBPData } from "./useBPData"
import ChartIndicators from "./ChartIndicators"

const BPAnalysis: React.FC = () => {
  // 视图模式状态
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  
  // 使用自定义钩子管理日期导航
  const {
    currentEndDate,
    handleDateChange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, (date) => {
    fetchData(viewMode, date);
  });
  
  // 使用自定义钩子获取血压数据
  const {
    bpData,
    metadata,
    isLoading,
    fetchData
  } = useBPData()

  // 当视图模式或日期变化时，重新获取数据
  useEffect(() => {
    fetchData(viewMode, currentEndDate)
  }, [viewMode, currentEndDate, fetchData])
  
  // 处理视图模式变更
  const handleViewModeChange = (mode: "day" | "week" | "month") => {
    setViewMode(mode)
    // 切换视图模式时重置为当天
    resetToCurrentDate()
  }
  
  // 处理图表滑动
  const handleChartSwipe = (direction: "left" | "right") => {
    handleDateChange(direction === "left" ? "next" : "prev")
  }

  // 图表指示器数据
  const chartIndicators = [
    { label: "收缩压", color: "#92A3FD" },
    { label: "舒张压", color: "#C58BF2" },
    { label: "心率", color: "#EEA4CE" }
  ]
  
  // === 渲染 ===
  return (
    <View className="bp-analysis">
      <View className="header-container">
        <Text className="chart-title">血压趋势</Text>
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
          <ChartIndicators />
        </View>
        
        <View className="chart-container">
          {isLoading && (
            <View className="loading-container">
              <Text>加载中...</Text>
            </View>
          )}
          
          {!isLoading && bpData && bpData.length > 0 && (
            <BPChart
              viewMode={viewMode}
              bpData={bpData}
              onSwipe={handleChartSwipe}
            />
          )}
          
          {!isLoading && (!bpData || bpData.length === 0) && (
            <View className="empty-container">
              <Text>暂无数据</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* 异常值提醒 - 仅在日视图模式下显示 */}
      {!isLoading && bpData && Array.isArray(bpData) && bpData.length > 0 && viewMode === "day" && (
        <AbnormalValues bpData={bpData} viewMode={viewMode} />
      )}
      
      {/* 血压统计分析 */}
      {!isLoading && bpData && Array.isArray(bpData) && bpData.length > 0 && (
        <BPStatistics 
          bpData={bpData}
          metadata={metadata}
          viewMode={viewMode}
        />
      )}
    </View>
  )
}

export default BPAnalysis