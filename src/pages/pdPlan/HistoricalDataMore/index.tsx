import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  subDays,
} from "date-fns";
import {
  getPaginatedPdRecords,
  getPaginatedPdRecordsData,
  PdRecordDateVO,
  PdRecordData,
} from "@/api/pdRecordApi";
import Popup from "@/components/common/Popup";
import Calendar from "@/components/common/Calendar";
import "./index.scss";

const HistoricalDataMore: React.FC = () => {
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateData, setDateData] = useState<PdRecordDateVO[]>([]);
  const [detailedData, setDetailedData] = useState<PdRecordData[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
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
        direction === "prev" ? subDays(prev, 30) : subDays(prev, -30)
      );
    } else {
      setCurrentDate((prev) =>
        direction === "prev" ? subDays(prev, 365) : subDays(prev, -365)
      );
    }
    setSelectedDates([]);
  };

  const handleItemClick = (item: PdRecordDateVO) => {
    setSelectedItem(item);
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
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

  const handleViewModeChange = (mode: "month" | "year") => {
    setViewMode(mode);
    setSelectedDates([]);
  };

  return (
    <View className="historical-data-more">
      <Calendar
        viewMode={viewMode}
        currentDate={currentDate}
        selectedDates={selectedDates}
        onNavigate={handleNavigate}
        onDateClick={handleDateClick}
        onMonthClick={handleMonthClick}
        onViewModeChange={handleViewModeChange}
      />

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

      <Popup
        visible={isPopupVisible}
        onClose={closePopup}
        title={selectedItem ? selectedItem.date : ""}
      >
        <View className="popup-content-wrapper">
          {selectedItem && (
            <ScrollView scrollY className="popup-content">
              <View className="detail-records">
                {selectedItem.recordData.map((record, index) => (
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
                          浓度: {record.dialysateType} | 引流量:{" "}
                          {record.drainageVolume}ml
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Popup>
    </View>
  );
};

export default HistoricalDataMore;
