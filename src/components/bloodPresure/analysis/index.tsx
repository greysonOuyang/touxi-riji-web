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

  // 获取日视图数据
  const fetchDailyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
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
        // 如果日视图没有数据，自动切换到周视图
        if (viewMode === "day") {
          setViewMode("week")
          fetchWeeklyBpData(date)
        } else {
          setIsLoading(false)
        }
        return false
      }
    } catch (error) {
      console.error("获取当日血压数据失败:", error)
      setDailyBpData([])
      setHasDailyData(false)
      setIsLoading(false)
      return false
    }
  }, [viewMode])

  // 获取周视图数据
  const fetchWeeklyBpData = useCallback(async (endDate: Date) => {
    setIsLoading(true)
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
        setIsLoading(false)
        return true
      } else {
        setBpData([])
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("获取血压周趋势数据失败:", error)
      Taro.showToast({
        title: "获取数据失败",
        icon: "error",
        duration: 2000
      })
      setBpData([])
      setIsLoading(false)
      return false
    }
  }, [])

  // 获取月视图数据
  const fetchMonthlyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
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
      return false
    }
  }, [])

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      const today = new Date()
      setCurrentEndDate(today)
      
      // 先尝试获取日视图数据
      const hasDailyData = await fetchDailyBpData(today)
      
      // 如果没有日视图数据，则获取周视图数据
      if (!hasDailyData) {
        await fetchWeeklyBpData(today)
      }
    }
    
    loadData()
  }, [fetchDailyBpData, fetchWeeklyBpData])

  // 切换视图模式
  const toggleViewMode = useCallback(async (mode: "day" | "week" | "month") => {
    setViewMode(mode)
    
    if (mode === "day") {
      await fetchDailyBpData(currentEndDate)
      if (!hasDailyData) {
        await fetchWeeklyBpData(currentEndDate)
      }
    } else if (mode === "week") {
      await fetchWeeklyBpData(currentEndDate)
    } else if (mode === "month") {
      await fetchMonthlyBpData(currentEndDate)
    }
  }, [currentEndDate, fetchDailyBpData, fetchWeeklyBpData, fetchMonthlyBpData, hasDailyData])

  // 处理日期变更
  const handleDateChange = useCallback(async (direction: 'prev' | 'next') => {
    let newDate = new Date(currentEndDate)
    
    if (viewMode === "day") {
      newDate = direction === 'prev' 
        ? subDays(currentEndDate, 1) 
        : addDays(currentEndDate, 1)
        
      // 不允许选择未来日期
      if (direction === 'next' && isToday(currentEndDate)) {
        return
      }
    } else if (viewMode === "week") {
      newDate = direction === 'prev' 
        ? subDays(currentEndDate, 7) 
        : addDays(currentEndDate, 7)
        
      // 不允许选择未来周
      if (direction === 'next' && new Date() < addDays(currentEndDate, 1)) {
        return
      }
    } else if (viewMode === "month") {
      newDate = direction === 'prev' 
        ? subMonths(currentEndDate, 1) 
        : addMonths(currentEndDate, 1)
        
      // 不允许选择未来月
      if (direction === 'next' && new Date() < addDays(endOfMonth(currentEndDate), 1)) {
        return
      }
    }
    
    setCurrentEndDate(newDate)
    
    if (viewMode === "day") {
      await fetchDailyBpData(newDate)
      if (!hasDailyData) {
        await fetchWeeklyBpData(newDate)
      }
    } else if (viewMode === "week") {
      await fetchWeeklyBpData(newDate)
    } else if (viewMode === "month") {
      await fetchMonthlyBpData(newDate)
    }
  }, [currentEndDate, viewMode, fetchDailyBpData, fetchWeeklyBpData, fetchMonthlyBpData, hasDailyData])

  // 处理触摸滑动
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartX
    
    // 滑动距离超过50像素才触发
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // 右滑，显示前一天/周/月
        handleDateChange('prev')
      } else {
        // 左滑，显示后一天/周/月
        handleDateChange('next')
      }
    }
    
    setTouchStartX(null)
  }

  // 格式化日期范围显示
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