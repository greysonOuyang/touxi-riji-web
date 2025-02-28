import { useState, useEffect } from "react";
import {
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";

/**
 * 日期导航自定义钩子
 * 根据不同的视图模式（日/周/月）提供日期导航功能
 */
const useDateNavigation = (viewMode: "day" | "week" | "month") => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // 当视图模式变化时，重新计算日期范围
  useEffect(() => {
    updateDateRange(currentDate);
  }, [viewMode, currentDate]);

  // 更新日期范围
  const updateDateRange = (date: Date) => {
    let start: Date;
    let end: Date;

    if (viewMode === "day") {
      start = date;
      end = date;
    } else if (viewMode === "week") {
      start = startOfWeek(date, { weekStartsOn: 1 }); // 周一开始
      end = endOfWeek(date, { weekStartsOn: 1 }); // 周日结束
    } else {
      // 月视图
      start = startOfMonth(date);
      end = endOfMonth(date);
    }

    setDateRange({ start, end });
  };

  // 导航到前一个时间段
  const navigateToPrevious = () => {
    let newDate: Date;

    if (viewMode === "day") {
      newDate = subDays(currentDate, 1);
    } else if (viewMode === "week") {
      newDate = subWeeks(currentDate, 1);
    } else {
      // 月视图
      newDate = subMonths(currentDate, 1);
    }

    setCurrentDate(newDate);
  };

  // 导航到后一个时间段
  const navigateToNext = () => {
    let newDate: Date;

    if (viewMode === "day") {
      newDate = addDays(currentDate, 1);
    } else if (viewMode === "week") {
      newDate = addWeeks(currentDate, 1);
    } else {
      // 月视图
      newDate = addMonths(currentDate, 1);
    }

    setCurrentDate(newDate);
  };

  // 导航（前进/后退）
  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      navigateToPrevious();
    } else {
      navigateToNext();
    }
  };

  // 重置到今天
  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // 检查是否是今天
  const isToday = isSameDay(currentDate, new Date());

  return {
    currentDate,
    dateRange,
    navigateDate,
    resetToToday,
    isToday,
  };
};

export default useDateNavigation; 