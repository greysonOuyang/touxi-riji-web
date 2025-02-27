import { useState, useCallback, useRef } from "react"
import Taro from "@tarojs/taro"
import { format } from "date-fns"
import { fetchBpTrendWeekly, fetchBpRecordDaily, fetchBpTrendMonthly } from "@/api/bloodPressureApi"

// 视图模式类型
type ViewMode = "day" | "week" | "month"

// 数据类型定义 - 现在统一使用一种数据类型
interface TrendDataPoint {
  systolic: number
  diastolic: number
  heartRate: number
  timestamp: string
}

export const useBPData = () => {
  // 状态管理
  const [bpData, setBpData] = useState<TrendDataPoint[]>([])
  const [hasDailyData, setHasDailyData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 请求控制
  const activeRequestRef = useRef<string | null>(null)
  
  // 显示提示
  const showToast = (message: string) => {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
  
  // 清空所有数据
  const clearData = useCallback((mode?: ViewMode) => {
    console.log(`清空数据，模式: ${mode || '全部'}`)
    
    if (!mode || mode === 'day') {
      setHasDailyData(false)
    }
    
    setBpData([])
  }, [])
  
  // 获取日视图数据
  const fetchDailyData = useCallback(async (date: Date) => {
    const requestId = `daily-${Date.now()}`
    activeRequestRef.current = requestId
    
    setIsLoading(true)
    clearData('day')
    
    try {
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        date: format(date, 'yyyy-MM-dd')
      }
      
      console.log("日视图请求参数:", params)
      const response = await fetchBpRecordDaily(params)
      
      // 检查请求是否已被取消
      if (activeRequestRef.current !== requestId) {
        console.log("日视图请求已被取消")
        return false
      }
      
      if (response?.data && response.data.length > 0) {
        const sortedData = response.data.map(item => ({
          systolic: Math.round(item.systolic || 0),
          diastolic: Math.round(item.diastolic || 0),
          heartRate: Math.round(item.heartRate ?? 0),
          timestamp: item.timestamp
        })).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setBpData(sortedData)
        setHasDailyData(true)
        setIsLoading(false)
        return true
      } else {
        setBpData([])
        setHasDailyData(false)
        setIsLoading(false)
        showToast(`${format(date, 'MM月dd日')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取当日血压数据失败:", error)
      setBpData([])
      setHasDailyData(false)
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      return false
    }
  }, [clearData])
  
  // 获取周视图数据
  const fetchWeeklyData = useCallback(async (endDate: Date) => {
    const requestId = `weekly-${Date.now()}`
    activeRequestRef.current = requestId
    
    setIsLoading(true)
    clearData('week')
    
    try {
      // 计算自然周的开始日期和结束日期
      // 获取当前日期是星期几 (0是周日，1是周一，以此类推)
      const day = endDate.getDay()
      
      // 计算本周的开始日期（周日）和结束日期（周六）
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - day) // 设置为本周周日
      
      const endDateOfWeek = new Date(startDate)
      endDateOfWeek.setDate(startDate.getDate() + 6) // 周日+6天=周六
      
      // 如果计算出的结束日期超过了当前日期，则使用当前日期作为结束日期
      const today = new Date()
      const actualEndDate = endDateOfWeek > today ? today : endDateOfWeek
      
      console.log("开始获取周视图数据，周日:", format(startDate, 'yyyy-MM-dd'), "周六:", format(actualEndDate, 'yyyy-MM-dd'))
      
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(actualEndDate, 'yyyy-MM-dd')
      }
      
      console.log("周视图请求参数:", params)
      const response = await fetchBpTrendWeekly(params)
      
      // 检查请求是否已被取消
      if (activeRequestRef.current !== requestId) {
        console.log("周视图请求已被取消")
        return false
      }
      
      if (response?.data && response.data.length > 0) {
        const newData = response.data.map((item) => ({
          systolic: Math.round(item.systolic || 0),
          diastolic: Math.round(item.diastolic || 0),
          heartRate: Math.round(item.heartRate ?? 0),
          timestamp: item.timestamp,
        }))
        
        const sortedData = newData.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setBpData(sortedData)
        setIsLoading(false)
        console.log("周视图数据加载成功，条数:", sortedData.length)
        return true
      } else {
        setBpData([])
        setIsLoading(false)
        showToast(`${format(startDate, 'MM/dd')}-${format(actualEndDate, 'MM/dd')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压周趋势数据失败:", error)
      setBpData([])
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      return false
    }
  }, [clearData])
  
  // 获取月视图数据
  const fetchMonthlyData = useCallback(async (date: Date) => {
    const requestId = `monthly-${Date.now()}`
    activeRequestRef.current = requestId
    
    setIsLoading(true)
    clearData('month')
    
    try {
      console.log("开始获取月视图数据:", format(date, 'yyyy-MM'))
      
      const params = {
        userId: Taro.getStorageSync("userId") || 1,
        yearMonth: format(date, 'yyyy-MM')
      }
      
      console.log("月视图请求参数:", params)
      const response = await fetchBpTrendMonthly(params)
      
      // 检查请求是否已被取消
      if (activeRequestRef.current !== requestId) {
        console.log("月视图请求已被取消")
        return false
      }
      
      if (response?.data && response.data.length > 0) {
        const newData = response.data.map((item) => ({
          systolic: Math.round(item.systolic || 0),
          diastolic: Math.round(item.diastolic || 0),
          heartRate: Math.round(item.heartRate ?? 0),
          timestamp: item.timestamp,
        }))
        
        const sortedData = newData.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setBpData(sortedData)
        setIsLoading(false)
        console.log("月视图数据加载成功，条数:", sortedData.length)
        return true
      } else {
        setBpData([])
        setIsLoading(false)
        showToast(`${format(date, 'yyyy年MM月')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压月趋势数据失败:", error)
      setBpData([])
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      return false
    }
  }, [clearData])
  
  // 统一数据获取入口
  const fetchData = useCallback((mode: ViewMode, date: Date) => {
    console.log(`fetchData 调用: 模式=${mode}, 日期=${format(date, 'yyyy-MM-dd')}`)
    
    if (mode === 'day') {
      return fetchDailyData(date)
    } else if (mode === 'week') {
      return fetchWeeklyData(date)
    } else {
      return fetchMonthlyData(date)
    }
  }, [fetchDailyData, fetchWeeklyData, fetchMonthlyData])
  
  return {
    bpData,
    hasDailyData,
    isLoading,
    fetchData,
    clearData,
    // 为了兼容性，保留原有API
    fetchDailyBpData: fetchDailyData,
    fetchWeeklyBpData: fetchWeeklyData,
    fetchMonthlyBpData: fetchMonthlyData
  }
} 