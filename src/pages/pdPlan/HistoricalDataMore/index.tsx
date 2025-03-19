import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import {
  format,
  startOfMonth,
  endOfMonth,
  isToday,
  isSameDay,
  subMonths,
  addMonths,
  getMonth,
  getYear,
} from "date-fns";
import {
  getPaginatedPdRecords,
  PdRecordDateVO,
  PdRecordData,
  getPdRecordsByDate,
} from "@/api/pdRecordApi";
import "./index.scss";

const HistoricalDataMore: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateData, setDateData] = useState<PdRecordDateVO[]>([]);
  const [detailedData, setDetailedData] = useState<PdRecordData[]>([]);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    fetchMonthData(new Date());
    fetchDayDetails(format(new Date(), "yyyy-MM-dd"));
  }, []);

  useDidShow(() => {
    const needRefresh = Taro.getStorageSync("refreshPdRecord");
    if (needRefresh) {
      fetchMonthData(currentDate);
      fetchDayDetails(format(selectedDate, "yyyy-MM-dd"));
      Taro.removeStorageSync("refreshPdRecord");
    }
  });

  const fetchMonthData = async (date: Date) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const startDate = format(start, "yyyy-MM-dd");
      const endDate = format(end, "yyyy-MM-dd");

      const response = await getPaginatedPdRecords(userId, 1, 100, startDate, endDate);
      if (response.isSuccess()) {
        setDateData(response.data.records);
      }
    } catch (err) {
      console.error("获取月度数据失败:", err);
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  };

  const fetchDayDetails = async (dateStr: string) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const response = await getPdRecordsByDate(userId, dateStr);
      if (response.isSuccess()) {
        setDetailedData(response.data.dateRecords || []);
      }
    } catch (err) {
      console.error("获取日详情失败:", err);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchDayDetails(format(date, "yyyy-MM-dd"));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentDate(newDate);
    fetchMonthData(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    if (getMonth(currentDate) !== getMonth(today) || getYear(currentDate) !== getYear(today)) {
      setCurrentDate(today);
      fetchMonthData(today);
    }
    setSelectedDate(today);
    fetchDayDetails(format(today, "yyyy-MM-dd"));
  };

  const goToAddRecord = () => {
    Taro.navigateTo({ url: "/pages/pdPlan/record/index" });
  };

  const getTimeOfDay = (timeStr: string) => {
    const hour = parseInt(timeStr.substring(0, 2), 10);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "evening";
  };

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const dateRange: Date[] = [];
    let current = monthStart;
    while (current <= monthEnd) {
      dateRange.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const startDay = monthStart.getDay();
    const blanks = Array(startDay).fill(null);

    return (
      <View className="calendar-grid">
        {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
          <View key={index} className="calendar-weekday">
            <Text>{day}</Text>
          </View>
        ))}
        {blanks.map((_, index) => (
          <View key={`blank-${index}`} className="calendar-day empty" />
        ))}
        {dateRange.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dateRecord = dateData.find((item) => item.date === dateStr);
          const hasRecord = !!dateRecord;
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);

          return (
            <View
              key={dateStr}
              className={`calendar-day ${hasRecord ? "has-record" : ""} ${isSelected ? "selected" : ""} ${isTodayDate ? "today" : ""}`}
              onClick={() => hasRecord && handleDateSelect(date)}
            >
              <Text className="day-number">{date.getDate()}</Text>
              {hasRecord && (
                <View
                  className={`record-indicator ${dateRecord.totalUltrafiltration < 0 ? "negative" : "positive"}`}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderContent = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const isSelectedToday = isToday(selectedDate);

    return (
      <View className="content-container">
        <View className="calendar-section">
          <View className="calendar-header">
            <View className="month-navigator">
              <View className="nav-button" onClick={() => handleMonthChange("prev")}>
                <View className="chevron-left" />
              </View>
              <Text className="current-month">{format(currentDate, "yyyy年MM月")}</Text>
              <View className="nav-button" onClick={() => handleMonthChange("next")}>
                <View className="chevron-right" />
              </View>
            </View>
            {!isSameDay(currentDate, new Date()) && (
              <View className="today-button" onClick={goToToday}>
                <View className="clock-icon" />
                <Text>返回今日</Text>
              </View>
            )}
          </View>
          <View className="calendar-container">{renderCalendarGrid()}</View>
        </View>

        <View className="records-section">
          <View className="records-header">
            <Text className="records-title">
              {format(selectedDate, "MM月dd日")}记录
              {isSelectedToday && <Text className="today-tag">今天</Text>}
            </Text>
            <View className="header-actions">
              <Text className="record-count">共 {detailedData.length} 条记录</Text>
              <View className="add-button" onClick={goToAddRecord}>
                <View className="plus-icon" />
                <Text>记录</Text>
              </View>
            </View>
          </View>

          {detailedData.length > 0 ? (
            <View className="records-list">
              {detailedData.map((record, index) => (
                <View key={index} className="record-item">
                  <View className="record-time-container">
                    <View className={`time-dot ${getTimeOfDay(record.recordTime)}`} />
                    <View className="time-line" />
                    <Text className="record-time">{record.recordTime.substring(0, 5)}</Text>
                  </View>
                  <View className="record-details">
                    <View className="record-main-info">
                      <Text className="record-label">超滤量</Text>
                      <Text className={`record-value ${(record.ultrafiltration || 0) < 0 ? "negative" : ""}`}>
                        {record.ultrafiltration || 0} ml
                      </Text>
                    </View>
                    <View className="record-secondary-info">
                      <View className="info-item">
                        <Text className="info-label">浓度</Text>
                        <Text className="info-value">{record.dialysateType}</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">引流量</Text>
                        <Text className="info-value">{record.drainageVolume} ml</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">注液量</Text>
                        <Text className="info-value">{record.infusionVolume} ml</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-records">
              <View className="calendar-icon" />
              <Text className="empty-text">暂无记录</Text>
              {!isSelectedToday && (
                <View
                  className="go-today-button"
                  onClick={() => {
                    setSelectedDate(new Date());
                    fetchDayDetails(format(new Date(), "yyyy-MM-dd"));
                  }}
                >
                  <Text>查看今日记录</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="historical-data-more">
      <ScrollView scrollY className="page-content">
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default HistoricalDataMore;