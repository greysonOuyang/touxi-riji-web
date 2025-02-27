"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { View, Text } from "@tarojs/components"
import Taro from "@tarojs/taro"
import "./index.scss"
import { useBPData, ViewMode, ChartType, calculateNewDate, getInitialDateForMode } from "./useBPData"
import ViewModeSelector from "./ViewModeSelector"
import DateNavigator from "./DateNavigator"
import ChartIndicators from "./ChartIndicators"
import AbnormalValues from "./AbnormalValues"
import BPChart from './BPChart'
import BPStatistics from './BPStatistics'

const BPAnalysis: React.FC = () => {
  // === 状态管理 ===
  const pageActive = useRef(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const requestIdRef = useRef<number>(0) // 请求ID用于防止竞态条件
  
  // === useBPData 钩子 ===
  const {
    bpData,
    metadata,  // 添加元数据
    isLoading,
    fetchData,
    clearData
  } = useBPData()
  
  // === 日期操作函数 ===
  
  // 在组件挂载和卸载时设置页面状态
  useEffect(() => {
    pageActive.current = true;
    
    return () => {
      pageActive.current = false;
    }
  }, []);
  
  // 安全的请求数据方法
  const safelyFetchData = useCallback((mode: ViewMode, date: Date) => {
    if (pageActive.current) {
      fetchData(mode, date);
    }
  }, [fetchData]);
  
  // 日期导航 - 前后切换
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    if (!pageActive.current) return;
    
    const newDate = calculateNewDate(currentDate, viewMode, direction)
    setCurrentDate(newDate)
    
    // 使用安全的数据请求方法
    safelyFetchData(viewMode, newDate)
  }, [currentDate, viewMode, safelyFetchData])
  
  // 重置到今天
  const resetToToday = useCallback(() => {
    if (!pageActive.current) return;
    
    const today = new Date()
    setCurrentDate(today)
    
    // 使用安全的数据请求方法
    safelyFetchData(viewMode, today)
  }, [viewMode, safelyFetchData])
  
  // 处理图表滑动
  const handleChartSwipe = useCallback((direction: 'left' | 'right') => {
    if (!pageActive.current) return;
    
    if (direction === 'left') {
      navigateDate('next');
    } else if (direction === 'right') {
      navigateDate('prev');
    }
  }, [navigateDate])
  
  // === 视图切换函数 ===
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    if (!pageActive.current) return;
    
    // 清除当前数据，避免闪烁
    clearData();
    
    // 设置新的视图模式
    setViewMode(mode);
    
    // 根据新的视图模式获取初始日期
    const initialDate = getInitialDateForMode(mode);
    setCurrentDate(initialDate);
    
    // 请求新的数据
    safelyFetchData(mode, initialDate);
  }, [clearData, safelyFetchData])
  
  // 初始数据加载
  useEffect(() => {
    if (pageActive.current) {
      safelyFetchData(viewMode, currentDate);
    }
    
    // 添加错误处理
    Taro.onError((err) => {
      console.error("Taro error:", err);
    });
    
    return () => {
      Taro.offError();
    }
  }, [])
  
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
      
      {/* 异常值提醒 - 确保与其他卡片对齐 */}
      {!isLoading && bpData && Array.isArray(bpData) && bpData.length > 0 && (
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