"use client"

import React, { useState, useEffect } from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import { useBPData } from "./useBPData"
import { useDateNavigation } from "./useDateNavigation"
import ViewModeSelector from "./ViewModeSelector"
import DateNavigator from "./DateNavigator"
import ChartIndicators from "./ChartIndicators"
import AbnormalValues from "./AbnormalValues"
import BPChart from './BPChart'

const BPAnalysis: React.FC = () => {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [abnormalValues, setAbnormalValues] = useState<string[]>([])
  
  const {
    bpData,
    dailyBpData,
    hasDailyData,
    isLoading,
    fetchDailyBpData,
    fetchWeeklyBpData,
    fetchMonthlyBpData
  } = useBPData()
  
  const handleDateChanged = (date: Date) => {
    if (viewMode === "day") {
      fetchDailyBpData(date)
    } else if (viewMode === "week") {
      fetchWeeklyBpData(date)
    } else {
      fetchMonthlyBpData(date)
    }
  }
  
  const {
    currentEndDate,
    handleDateChange,
    handleTouchStart,
    handleTouchEnd,
    formatDateRange,
    resetToCurrentDate
  } = useDateNavigation(viewMode, handleDateChanged)

  // 切换视图模式
  const toggleViewMode = (mode: "day" | "week" | "month") => {
    if (mode === viewMode) return
    
    setViewMode(mode)
    // 视图模式变更时，重置日期为当前日期
    resetToCurrentDate()
  }

  // 初始加载
  useEffect(() => {
    // 默认加载周视图数据
    fetchWeeklyBpData(new Date())
  }, [fetchWeeklyBpData])

  return (
    <View className="bp-analysis">
      <View className="header-container">
        <Text className="chart-title">血压趋势</Text>
        
        <ViewModeSelector 
          viewMode={viewMode} 
          onViewModeChange={toggleViewMode} 
        />
      </View>
      
      <DateNavigator 
        dateRange={formatDateRange()} 
        onPrev={() => handleDateChange('prev')} 
        onNext={() => handleDateChange('next')} 
      />
      
      <ChartIndicators />
      
      <View 
        className="chart-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <View className="loading-overlay">
            <Text className="loading-text">加载中...</Text>
          </View>
        )}
        
        <BPChart 
          viewMode={viewMode}
          bpData={bpData}
          dailyBpData={dailyBpData}
          hasDailyData={hasDailyData}
        />
      </View>
      
      <AbnormalValues abnormalValues={abnormalValues} />
    </View>
  )
}

export default BPAnalysis