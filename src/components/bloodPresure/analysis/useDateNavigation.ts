import { useState, useCallback } from "react"
import { format, subDays, addDays, subMonths, addMonths, isToday } from "date-fns"

type ViewMode = "day" | "week" | "month"

interface DateNavigationHook {
  currentEndDate: Date
  handleDateChange: (direction: 'prev' | 'next') => void
  handleTouchStart: (e: any) => void
  handleTouchEnd: (e: any) => void
  formatDateRange: () => string
  resetToCurrentDate: () => void
}

// 使用命名导出
export function useDateNavigation(
  viewMode: ViewMode,
  onDateChange: (date: Date) => void
): DateNavigationHook {
  const [currentEndDate, setCurrentEndDate] = useState<Date>(new Date())
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  // 处理日期变更
  const handleDateChange = useCallback((direction: 'prev' | 'next') => {
    let newDate = new Date(currentEndDate)
    
    if (viewMode === "day") {
      // 日视图，前后移动一天
      newDate = direction === 'prev' ? subDays(newDate, 1) : addDays(newDate, 1)
      
      // 限制不能超过今天
      const today = new Date()
      today.setHours(0, 0, 0, 0);
      if (direction === 'next' && newDate > today) {
        return
      }
    } else if (viewMode === "week") {
      // 周视图，前后移动一周
      newDate = direction === 'prev' ? subDays(newDate, 7) : addDays(newDate, 7)
      
      // 限制不能超过今天
      const today = new Date()
      if (direction === 'next' && newDate > today) {
        newDate = new Date(); // 设置为今天
      }
    } else {
      // 月视图，前后移动一个月
      newDate = direction === 'prev' ? subMonths(newDate, 1) : addMonths(newDate, 1)
      
      // 限制不能超过当前月
      const today = new Date()
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      if (direction === 'next' && 
          (newDate.getFullYear() > currentYear || 
          (newDate.getFullYear() === currentYear && newDate.getMonth() > currentMonth))) {
        newDate = new Date();
        newDate.setDate(1); // 设置为当月第一天
      }
    }
    
    setCurrentEndDate(newDate)
    onDateChange(newDate)
  }, [currentEndDate, viewMode, onDateChange])

  // 处理触摸开始
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX)
  }, [])
  
  // 处理触摸结束
  const handleTouchEnd = useCallback((e) => {
    if (touchStartX === null) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartX
    
    // 如果滑动距离超过50px，则切换日期
    if (Math.abs(diff) > 50) {
      handleDateChange(diff > 0 ? 'prev' : 'next')
    }
    
    setTouchStartX(null)
  }, [touchStartX, handleDateChange])

  // 格式化日期范围
  const formatDateRange = useCallback(() => {
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
  }, [currentEndDate, viewMode])

  // 重置日期为当前日期
  const resetToCurrentDate = useCallback(() => {
    setCurrentEndDate(new Date())
    onDateChange(new Date())
  }, [onDateChange])

  return {
    currentEndDate,
    handleDateChange,
    handleTouchStart,
    handleTouchEnd,
    formatDateRange,
    resetToCurrentDate
  }
} 