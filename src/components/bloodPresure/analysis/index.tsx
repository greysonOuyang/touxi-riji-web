"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import Taro from "@tarojs/taro"
import { fetchBpTrendWeekly, fetchBpRecordDaily, fetchBpTrendMonthly } from "@/api/bloodPressureApi"
import { format, subDays, addDays, startOfMonth, endOfMonth, subMonths, addMonths, isToday } from "date-fns"
import { AtIcon } from 'taro-ui'
import BPChart from './BPChart'

interface BPDataPoint {
  systolic: number
  diastolic: number
  heartRate: number
  timestamp: string
}

interface DailyBPDataPoint {
  id: number
  userId: number
  systolic: number
  diastolic: number
  heartRate: number
  measurementTime: string
  notes: string
}

const BPAnalysis: React.FC = () => {
  const [bpData, setBpData] = useState<BPDataPoint[]>([])
  const [dailyBpData, setDailyBpData] = useState<DailyBPDataPoint[]>([])
  const [abnormalValues, setAbnormalValues] = useState<string[]>([])
  const [currentEndDate, setCurrentEndDate] = useState<Date>(new Date())
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const [hasDailyData, setHasDailyData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNoDataTip, setShowNoDataTip] = useState(false)
  const [noDataMessage, setNoDataMessage] = useState("")

  // 获取日视图数据
  const fetchDailyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
    setShowNoDataTip(false)
    try {
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        date: format(date, 'yyyy-MM-dd')
      }

      const response = await fetchBpRecordDaily(params)
      if (response?.data && response.data.length > 0) {
        const sortedData = response.data.map(item => ({
          ...item,
          heartRate: item.heartRate ?? 0
        })).sort(
          (a, b) => new Date(a.measurementTime).getTime() - new Date(b.measurementTime).getTime()
        )
        setDailyBpData(sortedData)
        setHasDailyData(true)
        setIsLoading(false)
        return true
      } else {
        setDailyBpData([])
        setHasDailyData(false)
        setShowNoDataTip(true)
        setNoDataMessage(`${format(date, 'MM月dd日')}暂无数据记录`)
        
        // 当没有日视图数据时，同时加载周视图数据作为备用
        fetchWeeklyBpData(date, false)
        
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("获取当日血压数据失败:", error)
      setDailyBpData([])
      setHasDailyData(false)
      setShowNoDataTip(true)
      setNoDataMessage("数据加载失败，请稍后再试")
      setIsLoading(false)
      return false
    }
  }, [])

  // 获取周视图数据
  const fetchWeeklyBpData = useCallback(async (endDate: Date, showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
      setShowNoDataTip(false)
    }
    
    try {
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 6)
      
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        timeSpan: "week",
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      }

      const response = await fetchBpTrendWeekly(params)
      if (response?.data && response.data.length > 0) {
        const newData = response.data.map((item) => ({
          systolic: Math.round(item.systolic || 0),
          diastolic: Math.round(item.diastolic || 0),
          heartRate: Math.round(item.heartRate ?? 0),
          timestamp: item.timestamp,
        }))

        const sortedData = newData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setBpData(sortedData)
        if (showLoading) {
          setIsLoading(false)
        }
        return true
      } else {
        setBpData([])
        if (showLoading) {
          setIsLoading(false)
          setShowNoDataTip(true)
          setNoDataMessage(`${format(startDate, 'MM/dd')}-${format(endDate, 'MM/dd')}暂无数据记录`)
        }
        return false
      }
    } catch (error) {
      console.error("获取血压周趋势数据失败:", error)
      if (showLoading) {
        setIsLoading(false)
        setShowNoDataTip(true)
        setNoDataMessage("数据加载失败，请稍后再试")
      }
      setBpData([])
      return false
    }
  }, [])

  // 获取月视图数据
  const fetchMonthlyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
    setShowNoDataTip(false)
    try {
      const yearMonth = format(date, 'yyyy-MM')
      
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        yearMonth: yearMonth
      }

      const response = await fetchBpTrendMonthly(params)
      if (response?.data && response.data.length > 0) {
        const newData = response.data.map((item) => ({
          systolic: Math.round(item.systolic || 0),
          diastolic: Math.round(item.diastolic || 0),
          heartRate: Math.round(item.heartRate ?? 0),
          timestamp: item.timestamp,
        }))

        const sortedData = newData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setBpData(sortedData)
        setIsLoading(false)
        return true
      } else {
        setBpData([])
        setIsLoading(false)
        setShowNoDataTip(true)
        setNoDataMessage(`${format(date, 'yyyy年MM月')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压月趋势数据失败:", error)
      Taro.showToast({
        title: "获取数据失败",
        icon: "error",
        duration: 2000
      })
      setBpData([])
      setIsLoading(false)
      setShowNoDataTip(true)
      setNoDataMessage("数据加载失败，请稍后再试")
      return false
    }
  }, [])

  // 初始化数据
  useEffect(() => {
    fetchWeeklyBpData(new Date())
  }, [fetchWeeklyBpData])

  // 当日期或视图模式变化时，重新获取数据
  useEffect(() => {
    if (viewMode === "day") {
      fetchDailyBpData(currentEndDate)
    } else if (viewMode === "week") {
      fetchWeeklyBpData(currentEndDate)
    } else if (viewMode === "month") {
      fetchMonthlyBpData(currentEndDate)
    }
  }, [viewMode, currentEndDate, fetchDailyBpData, fetchWeeklyBpData, fetchMonthlyBpData])

  // 切换视图模式
  const toggleViewMode = useCallback((mode: "day" | "week" | "month") => {
    if (mode === viewMode) return
    
    setViewMode(mode)
    // 重置为当前日期
    setCurrentEndDate(new Date())
  }, [viewMode])

  // 处理日期变更
  const handleDateChange = useCallback((direction: 'prev' | 'next') => {
    let newDate = new Date(currentEndDate)
    
    if (viewMode === "day") {
      newDate = direction === 'prev' ? subDays(newDate, 1) : addDays(newDate, 1)
      
      // 限制不能超过今天
      if (newDate > new Date()) {
        newDate = new Date()
      }
    } else if (viewMode === "week") {
      newDate = direction === 'prev' ? subDays(newDate, 7) : addDays(newDate, 7)
      
      // 限制不能超过今天
      if (newDate > new Date()) {
        newDate = new Date()
      }
    } else if (viewMode === "month") {
      newDate = direction === 'prev' ? subMonths(newDate, 1) : addMonths(newDate, 1)
      
      // 限制不能超过当前月
      const today = new Date()
      if (newDate.getFullYear() > today.getFullYear() || 
          (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() > today.getMonth())) {
        newDate = new Date(today.getFullYear(), today.getMonth(), 1)
      }
    }
    
    setCurrentEndDate(newDate)
  }, [currentEndDate, viewMode])

  // 处理触摸开始
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  // 处理触摸结束
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartX
    
    // 如果滑动距离超过50px，则切换日期
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 向右滑动，显示前一天/周/月
        handleDateChange('prev')
      } else {
        // 向左滑动，显示后一天/周/月
        handleDateChange('next')
      }
    }
    
    setTouchStartX(null)
  }

  // 格式化日期范围
  const formatDateRange = () => {
    if (viewMode === "day") {
      return format(currentEndDate, 'yyyy年MM月dd日')
    } else if (viewMode === "week") {
      const endDate = new Date(currentEndDate)
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 6)
      return `${format(startDate, 'MM/dd')} - ${format(endDate, 'MM/dd')}`
    } else {
      return format(currentEndDate, 'yyyy年MM月')
    }
  }

  return (
    <View className="bp-analysis">
      <View className="header-container">
        <Text className="chart-title">血压趋势</Text>
        
        <View className="view-type-selector">
          <View 
            className={`selector-item ${viewMode === "day" ? "active" : ""}`}
            onClick={() => toggleViewMode("day")}
          >
            日视图
          </View>
          <View 
            className={`selector-item ${viewMode === "week" ? "active" : ""}`}
            onClick={() => toggleViewMode("week")}
          >
            周视图
          </View>
          <View 
            className={`selector-item ${viewMode === "month" ? "active" : ""}`}
            onClick={() => toggleViewMode("month")}
          >
            月视图
          </View>
        </View>
      </View>
      
      <View className="date-navigation">
        <View className="nav-button" onClick={() => handleDateChange('prev')}></View>
        <View className="date-range-container">
          <AtIcon value='calendar' size='14' color='#92A3FD' className="calendar-icon"></AtIcon>
          <Text className="date-range">{formatDateRange()}</Text>
        </View>
        <View className="nav-button" onClick={() => handleDateChange('next')}></View>
      </View>
      
      <View className="chart-header">
        <View className="indicators">
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#FF8A8A" }} />
            <Text className="indicator-text">收缩压</Text>
          </View>
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#92A3FD" }} />
            <Text className="indicator-text">舒张压</Text>
          </View>
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#4CAF50" }} />
            <Text className="indicator-text">心率</Text>
          </View>
        </View>
        <Text className="chart-unit">单位：mmHg</Text>
      </View>
      
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
        
        {showNoDataTip && !isLoading && (
          <View className="no-data-overlay">
            <Text className="no-data-text">{noDataMessage}</Text>
          </View>
        )}
        
        <BPChart 
          viewMode={viewMode}
          bpData={bpData}
          dailyBpData={dailyBpData}
          hasDailyData={hasDailyData}
        />
      </View>
      
      {abnormalValues.length > 0 && (
        <View className="abnormal-values-container">
          <Text className="abnormal-title">异常值提醒</Text>
          <View className="abnormal-list">
            {abnormalValues.map((message, index) => (
              <Text key={index} className="abnormal-item">{message}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default BPAnalysis