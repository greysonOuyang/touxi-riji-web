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

  // 显示自动消失的提示
  const showToast = (message: string) => {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }

  // 获取日视图数据
  const fetchDailyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
    // 清空周/月视图数据，确保日视图下不会显示周视图数据
    setBpData([])
    
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
        setIsLoading(false)
        // 使用自动消失的提示
        showToast(`${format(date, 'MM月dd日')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取当日血压数据失败:", error)
      setDailyBpData([])
      setHasDailyData(false)
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      return false
    }
  }, [])

  // 获取周视图数据
  const fetchWeeklyBpData = useCallback(async (endDate: Date, showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    
    // 清空日视图数据，确保周视图下不会显示日视图数据
    setDailyBpData([])
    setHasDailyData(false)
    
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
          showToast(`${format(startDate, 'MM/dd')}-${format(endDate, 'MM/dd')}暂无数据记录`)
        }
        return false
      }
    } catch (error) {
      console.error("获取血压周趋势数据失败:", error)
      if (showLoading) {
        setIsLoading(false)
        showToast("数据加载失败，请稍后再试")
      }
      setBpData([])
      return false
    }
  }, [])

  // 获取月视图数据
  const fetchMonthlyBpData = useCallback(async (date: Date) => {
    setIsLoading(true)
    
    // 清空日视图数据，确保月视图下不会显示日视图数据
    setDailyBpData([])
    setHasDailyData(false)
    
    try {
      const firstDay = startOfMonth(date)
      const lastDay = endOfMonth(date)
      
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        timeSpan: "month",
        startDate: format(firstDay, 'yyyy-MM-dd'),
        endDate: format(lastDay, 'yyyy-MM-dd'),
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
        showToast(`${format(date, 'yyyy年MM月')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压月趋势数据失败:", error)
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      setBpData([])
      return false
    }
  }, [])

  // 切换视图模式
  const toggleViewMode = (mode: "day" | "week" | "month") => {
    if (mode === viewMode) return
    
    setViewMode(mode)
    // 视图模式变更时，重置日期为当前日期
    setCurrentEndDate(new Date())
  }

  // 处理日期变更
  const handleDateChange = (direction: 'prev' | 'next') => {
    let newDate = new Date(currentEndDate)
    
    if (viewMode === "day") {
      // 日视图，前后移动一天
      newDate = direction === 'prev' ? subDays(newDate, 1) : addDays(newDate, 1)
      
      // 限制不能超过今天
      if (direction === 'next' && isToday(newDate)) {
        return
      }
    } else if (viewMode === "week") {
      // 周视图，前后移动一周
      newDate = direction === 'prev' ? subDays(newDate, 7) : addDays(newDate, 7)
      
      // 限制不能超过今天
      if (direction === 'next' && newDate > new Date()) {
        return
      }
    } else {
      // 月视图，前后移动一个月
      newDate = direction === 'prev' ? subMonths(newDate, 1) : addMonths(newDate, 1)
      
      // 限制不能超过当前月
      if (direction === 'next' && 
          newDate.getMonth() === new Date().getMonth() && 
          newDate.getFullYear() === new Date().getFullYear()) {
        return
      }
    }
    
    setCurrentEndDate(newDate)
  }

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

  // 初始加载
  useEffect(() => {
    // 默认加载周视图数据
    fetchWeeklyBpData(new Date())
  }, [fetchWeeklyBpData])

  // 日期变更时重新加载数据
  useEffect(() => {
    if (viewMode === "day") {
      fetchDailyBpData(currentEndDate)
    } else if (viewMode === "week") {
      fetchWeeklyBpData(currentEndDate)
    } else {
      fetchMonthlyBpData(currentEndDate)
    }
  }, [currentEndDate, viewMode, fetchDailyBpData, fetchWeeklyBpData, fetchMonthlyBpData])

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