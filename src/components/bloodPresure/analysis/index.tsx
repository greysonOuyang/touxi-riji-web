"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import { useBPData } from "./useBPData"
import ViewModeSelector from "./ViewModeSelector"
import DateNavigator from "./DateNavigator"
import ChartIndicators from "./ChartIndicators"
import AbnormalValues from "./AbnormalValues"
import BPChart from './BPChart'
import { format } from "date-fns"
import Taro from "@tarojs/taro"

// 视图模式类型
type ViewMode = "day" | "week" | "month"

const BPAnalysis: React.FC = () => {
  // === 状态管理 ===
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const requestIdRef = useRef<number>(0) // 请求ID用于防止竞态条件
  
  // === useBPData 钩子 ===
  const {
    bpData,
    hasDailyData,
    isLoading,
    fetchData,
    clearData
  } = useBPData()
  
  // === 日期操作函数 ===
  
  // 日期导航 - 前后切换
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = calculateNewDate(currentDate, viewMode, direction)
    setCurrentDate(newDate)
  }, [currentDate, viewMode])
  
  // 重置到今天
  const resetToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])
  
  // 处理图表滑动
  const handleChartSwipe = useCallback((direction: 'left' | 'right') => {
    // 左滑 -> 下一页
    if (direction === 'left') {
      navigateDate('next');
    } 
    // 右滑 -> 上一页
    else if (direction === 'right') {
      navigateDate('prev');
    }
  }, [navigateDate]);
  
  // === 视图切换函数 ===
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    if (newMode === viewMode) return
    
    setViewMode(newMode)
    setCurrentDate(getInitialDateForMode(newMode))
    clearData(newMode)
  }, [viewMode, clearData])
  
  // === 数据加载副作用 ===
  useEffect(() => {
    const currentRequestId = ++requestIdRef.current
    
    const loadData = async () => {
      try {
        const success = await fetchData(viewMode, currentDate)
        if (!success && currentRequestId === requestIdRef.current) {
          clearData(viewMode)
        }
      } catch (error) {
        console.error("数据加载失败:", error)
        if (currentRequestId === requestIdRef.current) {
          clearData(viewMode)
        }
      }
    }

    loadData()

    return () => {
      // 取消未完成的请求
      if (currentRequestId === requestIdRef.current) {
        clearData('soft') // 软清除保留loading状态
      }
    }
  }, [viewMode, currentDate, fetchData, clearData])
  
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
        currentDate={currentDate}
        onNavigate={navigateDate}
        onReset={resetToToday}
      />
      
      <ChartIndicators />
      
      <View className="chart-container">
        {isLoading && (
          <View className="loading-overlay">
            <Text className="loading-text">加载中...</Text>
          </View>
        )}
        
        <BPChart
          viewMode={viewMode}
          bpData={bpData}
          onSwipe={handleChartSwipe}
        />
      </View>
      
      <AbnormalValues data={bpData} />
    </View>
  )
}

// 辅助函数
const calculateNewDate = (date: Date, mode: ViewMode, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(date)
  const today = new Date()

  switch (mode) {
    case 'day':
      newDate.setDate(date.getDate() + (direction === 'prev' ? -1 : 1))
      return newDate > today ? today : newDate
    case 'week':
      // 获取当前日期是星期几 (0是周日，1是周一，以此类推)
      const day = date.getDay()
      
      // 计算本周的周六
      const currentWeekEnd = new Date(date)
      currentWeekEnd.setDate(date.getDate() - day + 6) // 设置为本周周六
      
      // 计算上一周/下一周的周六
      if (direction === 'prev') {
        currentWeekEnd.setDate(currentWeekEnd.getDate() - 7)
      } else {
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 7)
      }
      
      return currentWeekEnd > today ? today : currentWeekEnd
    case 'month':
      newDate.setMonth(date.getMonth() + (direction === 'prev' ? -1 : 1))
      return newDate > today ? today : newDate
    default:
      return newDate
  }
}

const getInitialDateForMode = (mode: ViewMode): Date => {
  const today = new Date()
  return mode === 'month' ? new Date(today.getFullYear(), today.getMonth(), 1) : today
}

export default BPAnalysis