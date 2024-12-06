import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtIcon, AtTabs, AtTabsPane, AtFloatLayout } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  subDays,
} from "date-fns";
import {
  getPaginatedPdRecords,
  getPaginatedPdRecordsData,
  PdRecordDateVO,
  PdRecordData,
} from "@/api/pdRecordApi";
import "./index.scss";

const HistoricalDataMore: React.FC = () => {
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateData, setDateData] = useState<PdRecordDateVO[]>([]);
  const [detailedData, setDetailedData] = useState<PdRecordData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PdRecordDateVO | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  useDidShow(() => {
    Taro.setNavigationBarTitle({ title: "历史数据" });
    fetchData();
  });

  const fetchData = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");

      if (showDetailedView) {
        const response = await getPaginatedPdRecordsData(
          userId,
          1,
          100,
          startDate,
          endDate
        );
        if (response.isSuccess()) {
          setDetailedData(response.data.records);
        }
      } else {
        const response = await getPaginatedPdRecords(
          userId,
          1,
          100,
          startDate,
          endDate
        );
        if (response.isSuccess()) {
          setDateData(response.data.records);
        }
      }
    } catch (err) {
      console.error("获取数据失败:", err);
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  };

  const fetchDataForRange = async (startDate: Date, endDate: Date) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      if (showDetailedView) {
        const response = await getPaginatedPdRecordsData(
          userId,
          1,
          100,
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
        );
        if (response.isSuccess()) {
          setDetailedData(response.data.records);
        }
      } else {
        const response = await getPaginatedPdRecords(
          userId,
          1,
          100,
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
        );
        if (response.isSuccess()) {
          setDateData(response.data.records);
        }
      }
    } catch (err) {
      console.error("获取日期范围数据失败:", err);
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate((prev) =>
        direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)
      );
    } else {
      setCurrentDate((prev) =>
        direction === "prev" ? subYears(prev, 1) : addYears(prev, 1)
      );
    }
    setSelectedDates([]);
  };

  const handleItemClick = (item: PdRecordDateVO) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const toggleView = () => {
    setShowDetailedView(!showDetailedView);
    fetchData();
  };

  const handleDateClick = (date: Date) => {
    if (viewMode === "month") {
      if (selectedDates.length === 2) {
        setSelectedDates([date]);
      } else if (selectedDates.length === 1) {
        const newDates = [selectedDates[0], date].sort(
          (a, b) => a.getTime() - b.getTime()
        );
        if (isSameMonth(newDates[0], newDates[1])) {
          setSelectedDates(newDates);
          fetchDataForRange(newDates[0], newDates[1]);
        } else {
          Taro.showToast({ title: "请选择同一个月内的日期", icon: "none" });
        }
      } else {
        setSelectedDates([date]);
      }
    }
  };

  const handleMonthClick = (month: number) => {
    const startDate = startOfMonth(
      new Date(currentDate.getFullYear(), month - 1)
    );
    const endDate = endOfMonth(startDate);
    setSelectedDates([startDate, endDate]);
    fetchDataForRange(startDate, endDate);
  };

  const renderMonthView = () => {
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
    const days = [];

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
          onClick={() => handleDateClick(date)}
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
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push(
        <View
          key={month}
          className="month-cell"
          onClick={() => handleMonthClick(month)}
        >
          <Text className="month-name">{month}月</Text>
        </View>
      );
    }
    return <View className="year-grid">{months}</View>;
  };

  const renderDetailRecords = (records: any[]) => (
    <View className="detail-records">
      {records.map((record, index) => (
        <View key={index} className="detail-item">
          <View className="time-line">
            <View className="time-dot"></View>
          </View>
          <View className="record-content">
            <View className="record-row">
              <Text className="time">{record.recordTime}</Text>
              <Text className="ultrafiltration">
                {record.ultrafiltration} ml
              </Text>
            </View>
            <View className="record-row">
              <Text className="details">
                浓度: {record.dialysateType} | 引流量: {record.drainageVolume}ml
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View className="historical-data-more">
      <View className="calendar-header">
        <View className="view-modes">
          <View
            className={`view-mode ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            月
          </View>
          <View
            className={`view-mode ${viewMode === "year" ? "active" : ""}`}
            onClick={() => setViewMode("year")}
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
          onClick={() => handleNavigate("prev")}
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
          onClick={() => handleNavigate("next")}
        />
      </View>

      {viewMode === "month" ? renderMonthView() : renderYearView()}

      <View className="data-view-toggle">
        <Text
          className={`toggle-option ${!showDetailedView ? "active" : ""}`}
          onClick={() => setShowDetailedView(false)}
        >
          日期数据
        </Text>
        <Text
          className={`toggle-option ${showDetailedView ? "active" : ""}`}
          onClick={() => setShowDetailedView(true)}
        >
          腹透详细数据
        </Text>
      </View>

      <ScrollView scrollY className="data-list">
        {showDetailedView
          ? detailedData.map((record, index) => (
              <View key={index} className="data-item">
                <Text className="date">{`${record.recordDate} ${record.recordTime}`}</Text>
                <Text className="value">{record.ultrafiltration} ml</Text>
              </View>
            ))
          : dateData.map((record, index) => (
              <View
                key={index}
                className="data-item"
                onClick={() => handleItemClick(record)}
              >
                <Text className="date">{record.date}</Text>
                <View className="value-container">
                  <Text className="value">
                    {record.totalUltrafiltration} ml
                  </Text>
                  <AtIcon value="chevron-right" size="14" color="#666" />
                </View>
              </View>
            ))}
      </ScrollView>

      <AtFloatLayout isOpened={isModalOpen} onClose={closeModal}>
        <View className="modal-header">
          <Text className="modal-title">
            {selectedItem ? selectedItem.date : ""}
          </Text>
          <View className="close-button" onClick={closeModal}>
            ×
          </View>
        </View>
        <ScrollView scrollY className="modal-content">
          {selectedItem && renderDetailRecords(selectedItem.recordData)}
        </ScrollView>
      </AtFloatLayout>
    </View>
  );
};

export default HistoricalDataMore;
