import React, { useState, useCallback } from "react";
import { View, Text, ITouchEvent } from "@tarojs/components";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from "date-fns";
import "./index.scss";
import Taro from "@tarojs/taro";

interface CalendarProps {
  viewMode: "month" | "year";
  currentDate: Date;
  selectedDates: Date[];
  onNavigate: (direction: "prev" | "next") => void;
  onDateClick: (date: Date) => void;
  onMonthSelect: (date: Date) => void;
  dateData: Array<{ date: string; totalUltrafiltration: number }>;
  onViewModeChange: (mode: "month" | "year") => void;
}

const Calendar: React.FC<CalendarProps> = ({
  viewMode,
  currentDate,
  selectedDates,
  onNavigate,
  onDateClick,
  onMonthSelect,
  dateData,
  onViewModeChange,
}): JSX.Element => {
  const today = new Date();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      const newDate =
        viewMode === "month"
          ? direction === "next"
            ? addMonths(currentDate, 1)
            : subMonths(currentDate, 1)
          : direction === "next"
          ? addYears(currentDate, 1)
          : subYears(currentDate, 1);

      // Prevent navigation to future years
      if (newDate.getFullYear() <= today.getFullYear()) {
        if (
          viewMode === "month" &&
          newDate.getFullYear() === today.getFullYear() &&
          newDate.getMonth() > today.getMonth()
        ) {
          Taro.showToast({
            title: "没有更多未来日期可选",
            icon: "none",
            duration: 2000,
          });
        } else if (
          viewMode === "year" &&
          newDate.getFullYear() > today.getFullYear()
        ) {
          Taro.showToast({
            title: "没有更多未来年份可选",
            icon: "none",
            duration: 2000,
          });
        } else {
          onNavigate(direction);
        }
      } else {
        Taro.showToast({
          title: "没有更多未来年份可选",
          icon: "none",
          duration: 2000,
        });
      }
    },
    [viewMode, currentDate, onNavigate, today]
  );

  const handleTouchStart = useCallback((e: ITouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: ITouchEvent) => {
      if (touchStartX === null) return;

      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;

      if (Math.abs(diff) > 50) {
        // Threshold for swipe detection
        const newMode = viewMode === "month" ? "year" : "month";
        onViewModeChange(newMode);
      }

      setTouchStartX(null);
    },
    [touchStartX, viewMode, onViewModeChange]
  );

  const renderMonthView = useCallback((): JSX.Element => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <View className="calendar-grid">
        <View className="calendar-weekdays">
          {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
            <View key={day} className="weekday">
              {day}
            </View>
          ))}
        </View>
        <View className="calendar-days">
          {days.map((day) => {
            const dateString = format(day, "yyyy-MM-dd");
            const dayData = dateData.find((d) => d.date === dateString);
            const isSelected = selectedDates.some((selectedDate) =>
              isSameDay(selectedDate, day)
            );
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isFuture = isAfter(day, today);

            return (
              <View
                key={dateString}
                className={`calendar-day ${isSelected ? "selected" : ""} ${
                  !isCurrentMonth ? "other-month" : ""
                } ${isFuture ? "future" : ""}`}
                onClick={() => !isFuture && onDateClick(day)}
              >
                <Text className="day-number">{format(day, "d")}</Text>
                {dayData && (
                  <Text
                    className={`ultrafiltration-value ${
                      dayData.totalUltrafiltration > 0 ? "positive" : "negative"
                    }`}
                  >
                    {dayData.totalUltrafiltration}ml
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }, [currentDate, dateData, onDateClick, selectedDates, today]);

  const renderYearView = useCallback((): JSX.Element => {
    const months: JSX.Element[] = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentDate.getFullYear(), month, 1);
      const isFuture = isAfter(date, today);
      months.push(
        <View
          key={month}
          className={`month-cell ${isFuture ? "future" : ""}`}
          onClick={() => !isFuture && onMonthSelect(date)}
        >
          <Text className="month-name">{format(date, "M月")}</Text>
        </View>
      );
    }
    return <View className="year-grid">{months}</View>;
  }, [currentDate, onMonthSelect, today]);

  return (
    <View
      className="calendar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      catchMove
    >
      <View className="calendar-header">
        <View className="calendar-navigation">
          <View
            className="nav-button-wrapper prev"
            onClick={() => handleNavigate("prev")}
          >
            <View className="nav-button prev"></View>
          </View>
          <Text className="current-date">
            {viewMode === "month" ? (
              format(currentDate, "yyyy年MM月")
            ) : (
              <Text>{currentDate.getFullYear()}年</Text>
            )}
          </Text>
          <View
            className="nav-button-wrapper next"
            onClick={() => handleNavigate("next")}
          >
            <View className="nav-button next"></View>
          </View>
        </View>
      </View>
      <View className="calendar-body">
        {viewMode === "month" ? renderMonthView() : renderYearView()}
      </View>
    </View>
  );
};

export default Calendar;
