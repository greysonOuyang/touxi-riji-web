import React from "react";
import { View, Text } from "@tarojs/components";
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
  startOfYear,
  endOfYear,
} from "date-fns";
import "./index.scss";

interface CalendarProps {
  viewMode: "month" | "year";
  currentDate: Date;
  selectedDates: Date[];
  onNavigate: (direction: "prev" | "next") => void;
  onDateClick: (date: Date) => void;
  onMonthSelect: (date: Date) => void;
  dateData: Array<{ date: string; totalUltrafiltration: number }>;
}

const Calendar: React.FC<CalendarProps> = ({
  viewMode,
  currentDate,
  selectedDates,
  onNavigate,
  onDateClick,
  onMonthSelect,
  dateData,
}): JSX.Element => {
  const today = new Date();

  const handleNavigate = (direction: "prev" | "next") => {
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
      onNavigate(direction);
    }
  };

  const renderMonthView = (): JSX.Element => {
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
  };

  const renderYearView = (): JSX.Element => {
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
          <Text className="month-name">{format(date, "M")}月</Text>
        </View>
      );
    }
    return <View className="year-grid">{months}</View>;
  };

  return (
    <View className="calendar">
      <View className="calendar-header">
        <View className="calendar-navigation">
          <View
            className="nav-button prev"
            onClick={() => handleNavigate("prev")}
          ></View>
          <Text className="current-date">
            {viewMode === "month" ? (
              format(currentDate, "yyyy年MM月")
            ) : (
              <Text>{currentDate.getFullYear()}年</Text>
            )}
          </Text>
          <View
            className="nav-button next"
            onClick={() => handleNavigate("next")}
          ></View>
        </View>
      </View>
      <View className="calendar-body">
        {viewMode === "month" ? renderMonthView() : renderYearView()}
      </View>
    </View>
  );
};

export default Calendar;
