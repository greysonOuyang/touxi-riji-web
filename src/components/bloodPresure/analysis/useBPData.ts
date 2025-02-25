import { useState, useCallback } from "react"
import Taro from "@tarojs/taro"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { fetchBpTrendWeekly, fetchBpRecordDaily, fetchBpTrendMonthly } from "@/api/bloodPressureApi"

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

export const useBPData = () => {
  const [bpData, setBpData] = useState<BPDataPoint[]>([])
  const [dailyBpData, setDailyBpData] = useState<DailyBPDataPoint[]>([])
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

      
      const params = {
        userId: Taro.getStorageSync("userId"),
        yearMonth: format(date, 'yyyy-MM')
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

  return {
    bpData,
    dailyBpData,
    hasDailyData,
    isLoading,
    fetchDailyBpData,
    fetchWeeklyBpData,
    fetchMonthlyBpData
  }
} 