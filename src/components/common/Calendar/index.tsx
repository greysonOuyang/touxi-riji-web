import React, { ReactNode } from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isSameDay,
} from "date-fns";
import "./index.scss";

interface CalendarProps {
  viewMode: "month" | "year";
  currentDate: Date;
  selectedDates: Date[];
  onNavigate: (direction: "prev" | "next") => void;
  onDateClick: (date: Date) => void;
  onMonthClick: (month: number) => void;
  onViewModeChange: (mode: "month" | "year") => void;
}

const Calendar: React.FC<CalendarProps> = ({
  viewMode,
  currentDate,
  selectedDates,
  onNavigate,
  onDateClick,
  onMonthClick,
  onViewModeChange,
}) => {
  const renderMonthView = () => {
    const days: ReactNode[] = [];
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="calendar-day empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isSelected = selectedDates.some((selectedDate) =>
        isSameDay(selectedDate, date)
      );
      const isInRange =
        selectedDates.length === 2 &&
        date >= selectedDates[0] &&
        date <= selectedDates[1];

      days.push(
        <View
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isInRange ? "in-range" : ""
          }`}
          onClick={() => onDateClick(date)}
        >
          {day}
        </View>
      );
    }

    return (
      <View className="calendar-grid">
        <View className="calendar-weekdays">
          {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
            <View key={day} className="weekday">
              {day}
            </View>
          ))}
        </View>
        <View className="calendar-days">{days}</View>
      </View>
    );
  };

  const renderYearView = () => {
    const months: ReactNode[] = [];
    for (let month = 1; month <= 12; month++) {
      months.push(
        <View
          key={month}
          className="month-cell"
          onClick={() => onMonthClick(month)}
        >
          <Text className="month-name">{month}月</Text>
        </View>
      );
    }
    return <View className="year-grid">{months}</View>;
  };

  return (
    <View className="calendar">
      <View className="calendar-header">
        <View className="view-modes">
          <View
            className={`view-mode ${viewMode === "month" ? "active" : ""}`}
            onClick={() => onViewModeChange("month")}
          >
            月
          </View>
          <View
            className={`view-mode ${viewMode === "year" ? "active" : ""}`}
            onClick={() => onViewModeChange("year")}
          >
            年
          </View>
        </View>
      </View>

      <View className="calendar-navigation">
        <AtIcon
          value="chevron-left"
          size="20"
          color="#666"
          onClick={() => onNavigate("prev")}
        />
        <Text className="current-date">
          {viewMode === "month"
            ? format(currentDate, "yyyy年MM月")
            : `${currentDate.getFullYear()}年`}
        </Text>
        <AtIcon
          value="chevron-right"
          size="20"
          color="#666"
          onClick={() => onNavigate("next")}
        />
      </View>

      {viewMode === "month" ? renderMonthView() : renderYearView()}
    </View>
  );
};

export default Calendar;
