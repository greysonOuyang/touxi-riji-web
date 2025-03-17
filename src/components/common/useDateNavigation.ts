import { useState, useCallback } from "react";
import {
  format,
  subDays,
  addDays,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  subWeeks,
  addWeeks,
} from "date-fns";

type ViewMode = "day" | "week" | "month";

interface DateNavigationHook {
  currentDate: Date;
  dateRange: { start: Date; end: Date };
  handleDateChange: (direction: 'prev' | 'next') => void;
  handleTouchStart: (e: any) => void;
  handleTouchEnd: (e: any) => void;
  formatDateRange: () => string;
  resetToCurrentDate: () => void;
  isToday: () => boolean;
}

// 使用命名导出
export default function useDateNavigation(
  viewMode: ViewMode,
  onDateChange?: (date: Date) => void
): DateNavigationHook {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // 更新日期范围
  const updateDateRange = useCallback((date: Date) => {
    let start: Date;
    let end: Date;

    if (viewMode === "day") {
      start = date;
      end = date;
    } else if (viewMode === "week") {
      start = startOfWeek(date, { weekStartsOn: 1 });
      end = endOfWeek(date, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(date);
      end = endOfMonth(date);
    }

    setDateRange({ start, end });
  }, [viewMode]);

  // 处理日期变更
  const handleDateChange = useCallback((direction: 'prev' | 'next') => {
    let newDate = new Date(currentDate);
    
    if (viewMode === "day") {
      newDate = direction === 'prev' ? subDays(newDate, 1) : addDays(newDate, 1);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (direction === 'next' && newDate > today) {
        newDate = today;
      }
    } else if (viewMode === "week") {
      newDate = direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
      
      const today = new Date();
      if (direction === 'next' && newDate > today) {
        newDate = new Date();
      }
    } else {
      newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
      
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      if (direction === 'next' && 
          (newDate.getFullYear() > currentYear || 
          (newDate.getFullYear() === currentYear && newDate.getMonth() > currentMonth))) {
        newDate = new Date();
        newDate.setDate(1);
      }
    }
    
    setCurrentDate(newDate);
    updateDateRange(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  }, [currentDate, viewMode, onDateChange, updateDateRange]);

  // 处理触摸开始
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);
  
  // 处理触摸结束
  const handleTouchEnd = useCallback((e) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) > 50) {
      handleDateChange(diff > 0 ? 'prev' : 'next');
    }
    
    setTouchStartX(null);
  }, [touchStartX, handleDateChange]);

  // 格式化日期范围
  const formatDateRange = useCallback(() => {
    if (viewMode === "day") {
      return currentDate.toString();
    } else if (viewMode === "week") {
      return `${dateRange.start.toString()} - ${dateRange.end.toString()}`;
    } else {
      return currentDate.toString();
    }
  }, [currentDate, viewMode, dateRange]);

  // 重置日期为当前日期
  const resetToCurrentDate = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    updateDateRange(today);
    if (onDateChange) {
      onDateChange(today);
    }
  }, [onDateChange, updateDateRange]);

  // 检查是否是今天
  const isToday = useCallback(() => {
    return isSameDay(currentDate, new Date());
  }, [currentDate]);

  return {
    currentDate,
    dateRange,
    handleDateChange,
    handleTouchStart,
    handleTouchEnd,
    formatDateRange,
    resetToCurrentDate,
    isToday,
  };
} 