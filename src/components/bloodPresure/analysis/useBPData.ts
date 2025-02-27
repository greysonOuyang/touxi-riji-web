import { useState, useCallback, useRef } from "react"
import Taro from "@tarojs/taro"
import { format } from "date-fns"
import { 
  fetchBpTrendWeekly, 
  fetchBpRecordDaily, 
  fetchBpTrendMonthly,
  BpTrendData,
  BpTrendMetadata 
} from "@/api/bloodPressureApi"

// 视图模式类型
type ViewMode = "day" | "week" | "month"
type ChartType = "line" | "column"

// 计算新日期的辅助函数
const calculateNewDate = (current: Date, mode: ViewMode, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(current)
  
  if (mode === 'day') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
  } else if (mode === 'week') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
  } else if (mode === 'month') {
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
  }
  
  return newDate
}

// 获取视图模式的初始日期
const getInitialDateForMode = (mode: ViewMode): Date => {
  const now = new Date()
  return now
}

export const useBPData = () => {
  // 状态管理
  const [bpData, setBpData] = useState<BpTrendData[]>([])
  const [metadata, setMetadata] = useState<BpTrendMetadata | null>(null)
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
    setBpData([])
    setMetadata(null)
  }, [])
  
  // 数据处理 - 确保所有必要字段都存在
  const processResponseData = (responseData: any[]): BpTrendData[] => {
    return responseData.map(item => ({
      systolic: Math.round(item.systolic || 0),
      diastolic: Math.round(item.diastolic || 0),
      heartRate: Math.round(item.heartRate ?? 0),
      timestamp: item.timestamp,
      // 新增字段 - 如果后端未返回，使用默认值
      measureCount: item.measureCount || 1,
      hasMeasurement: item.hasMeasurement !== false, // 默认为true
      maxSystolic: Math.round(item.maxSystolic || item.systolic || 0),
      minSystolic: Math.round(item.minSystolic || item.systolic || 0),
      maxDiastolic: Math.round(item.maxDiastolic || item.diastolic || 0),
      minDiastolic: Math.round(item.minDiastolic || item.diastolic || 0)
    })).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }
  
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
      
      if (response?.data && response.data.data && response.data.data.length > 0) {
        // 处理数据点
        const sortedData = processResponseData(response.data.data)
        setBpData(sortedData)
        
        // 处理元数据
        if (response.data.metadata) {
          setMetadata(response.data.metadata)
        } else {
          // 如果后端未返回元数据，前端计算简单元数据
          const validData = sortedData.filter(item => item.hasMeasurement)
          if (validData.length > 0) {
            setMetadata({
              dataCoverage: 1, // 日视图默认为1
              totalDays: 1,
              daysWithData: 1,
              avgSystolic: Math.round(validData.reduce((sum, item) => sum + item.systolic, 0) / validData.length),
              avgDiastolic: Math.round(validData.reduce((sum, item) => sum + item.diastolic, 0) / validData.length),
              avgHeartRate: Math.round(validData.reduce((sum, item) => sum + (item.heartRate || 0), 0) / 
                validData.filter(item => item.heartRate).length || 0)
            })
          }
        }
        
        setIsLoading(false)
        return true
      } else {
        setBpData([])
        setMetadata(null)
        setIsLoading(false)
        showToast(`${format(date, 'MM月dd日')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取当日血压数据失败:", error)
      setBpData([])
      setMetadata(null)
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
      const day = endDate.getDay()
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
      
      if (response?.data && response.data.data && response.data.data.length > 0) {
        // 处理数据点
        const sortedData = processResponseData(response.data.data)
        setBpData(sortedData)
        
        // 处理元数据
        if (response.data.metadata) {
          setMetadata(response.data.metadata)
        }
        
        setIsLoading(false)
        console.log("周视图数据加载成功，条数:", sortedData.length)
        return true
      } else {
        setBpData([])
        setMetadata(null)
        setIsLoading(false)
        showToast(`${format(startDate, 'MM/dd')}-${format(actualEndDate, 'MM/dd')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压周趋势数据失败:", error)
      setBpData([])
      setMetadata(null)
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
      
      if (response?.data && response.data.data && response.data.data.length > 0) {
        // 处理数据点
        const sortedData = processResponseData(response.data.data)
        setBpData(sortedData)
        
        // 处理元数据
        if (response.data.metadata) {
          setMetadata(response.data.metadata)
        }
        
        setIsLoading(false)
        console.log("月视图数据加载成功，条数:", sortedData.length)
        return true
      } else {
        setBpData([])
        setMetadata(null)
        setIsLoading(false)
        showToast(`${format(date, 'yyyy年MM月')}暂无数据记录`)
        return false
      }
    } catch (error) {
      console.error("获取血压月趋势数据失败:", error)
      setBpData([])
      setMetadata(null)
      setIsLoading(false)
      showToast("数据加载失败，请稍后再试")
      return false
    }
  }, [clearData])
  
  // 统一的数据获取函数
  const fetchData = useCallback((mode: ViewMode, date: Date) => {
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
    metadata,
    isLoading,
    fetchData,
    clearData
  }
}

export type { ViewMode, ChartType }
export { calculateNewDate, getInitialDateForMode } 