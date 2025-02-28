import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import Taro, { usePageScroll } from "@tarojs/taro";
import {
  format,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  addMonths,
  subYears,
  addYears,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  getPaginatedPdRecords,
  getPaginatedPdRecordsData,
  PdRecordDateVO,
  PdRecordData,
  getPdRecordsStatistics,
  PdRecordStatistics,
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
  const [isDataExpanded, setIsDataExpanded] = useState(true);
  const [statistics, setStatistics] = useState<PdRecordStatistics | null>(null);
  const [navOpacity, setNavOpacity] = useState(0);
  usePageScroll(({ scrollTop }) => {
    const newOpacity = Math.min(scrollTop / 50, 0.9);
    setNavOpacity(newOpacity);
  });

  useEffect(() => {
    fetchData(startOfMonth(currentDate), endOfMonth(currentDate));
  }, [currentDate]);

  usePageScroll(({ scrollTop }) => {
    const newOpacity = Math.min(scrollTop / 100, 1);
    setNavOpacity(newOpacity);
  });

  const fetchData = async (start?: Date, end?: Date) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const endDate = end
        ? format(end, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      const startDate = start
        ? format(start, "yyyy-MM-dd")
        : format(subDays(new Date(), 30), "yyyy-MM-dd");

      const responseStatistics = await getPdRecordsStatistics(
        userId,
        startDate,
        endDate
      );
      setStatistics(responseStatistics);

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

      const detailedResponse = await getPaginatedPdRecordsData(
        userId,
        1,
        100,
        startDate,
        endDate
      );
      if (detailedResponse.isSuccess()) {
        setDetailedData(detailedResponse.data.records);
      }
    } catch (err) {
      console.error("获取数据失败:", err);
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    let newDate;
    if (viewMode === "month") {
      newDate =
        direction === "prev"
          ? subMonths(currentDate, 1)
          : addMonths(currentDate, 1);
      setCurrentDate(newDate);
      setSelectedDates([]);
      fetchData(startOfMonth(newDate), endOfMonth(newDate));
    } else {
      newDate =
        direction === "prev"
          ? subYears(currentDate, 1)
          : addYears(currentDate, 1);
      setCurrentDate(newDate);
    }
  };

  const handleItemClick = (item: PdRecordDateVO) => {
    setSelectedItem(item);
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setSelectedItem(null);
  };

  const handleDateClick = (date: Date) => {
    if (dateData.length > 0) {
      const clickedItem = dateData.find(
        (item) => item.date === format(date, "yyyy-MM-dd")
      );
      if (clickedItem) {
        handleItemClick(clickedItem);
      }
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleViewModeChange = (mode: "month" | "year") => {
    setViewMode(mode);
    setSelectedDates([]);
    if (mode === "year") {
      setCurrentDate(new Date(currentDate.getFullYear(), 0, 1));
    } else {
      const now = new Date();
      setCurrentDate(now);
      fetchData(startOfMonth(now), endOfMonth(now));
    }
  };

  const handleMonthSelect = (date: Date) => {
    setCurrentDate(date);
    setViewMode("month");
    setSelectedDates([]);
    fetchData(startOfMonth(date), endOfMonth(date));
  };

  return (
    <View className="historical-data-more">
      <View className="custom-nav">
        <View className="nav-content">
          <View className="back-button" onClick={handleBack}>
            <AtIcon value="chevron-left" size="14" color="#666"></AtIcon>
          </View>
          <View className="view-modes">
            <View
              className={`view-mode ${viewMode === "month" ? "active" : ""}`}
              onClick={() => handleViewModeChange("month")}
            >
              月
            </View>
            <View
              className={`view-mode ${viewMode === "year" ? "active" : ""}`}
              onClick={() => handleViewModeChange("year")}
            >
              年
            </View>
          </View>
          <View className="placeholder"></View>
        </View>
      </View>

      <View className="calendar">
        <Calendar
          viewMode={viewMode}
          currentDate={currentDate}
          selectedDates={selectedDates}
          onNavigate={handleNavigate}
          onDateClick={handleDateClick}
          onMonthSelect={handleMonthSelect}
          dateData={dateData}
          onViewModeChange={handleViewModeChange}
        />
      </View>

      <View className="statistics-card">
        <View className="card-header">
          <Text className="card-title">本月数据统计</Text>
        </View>
        <View className="statistics-grid">
          <View className="stat-item">
            <Text className="stat-label">平均超滤量</Text>
            <Text className="stat-value">
              {statistics?.averageUltrafiltration} ml
            </Text>
          </View>
          <View className="stat-item">
            <Text className="stat-label">最大超滤量</Text>
            <Text className="stat-value highlight-max">
              {statistics?.maxUltrafiltration} ml
            </Text>
          </View>
          <View className="stat-item">
            <Text className="stat-label">最小超滤量</Text>
            <Text className="stat-value highlight-min">
              {statistics?.minUltrafiltration} ml
            </Text>
          </View>
        </View>
        
        <View 
          className="view-more-stats" 
          onClick={() => Taro.navigateTo({ url: "/pages/statistics/index?tab=0" })}
        >
          <Text className="view-more-text">查看更多统计分析</Text>
          <AtIcon value="chevron-right" size="14" color="#92A3FD" />
        </View>
      </View>

      <View className={`data-list card ${!isDataExpanded ? "collapsed" : ""}`}>
        <View
          className="card-header"
          onClick={() => setIsDataExpanded(!isDataExpanded)}
        >
          <View className="title-container">
            <Text className="card-title">
              {isDataExpanded ? "收起全部数据" : "查看全部数据"}
            </Text>
            <AtIcon
              value={isDataExpanded ? "chevron-up" : "chevron-down"}
              size="14"
              color="#92A3FD"
            />
          </View>
        </View>

        {isDataExpanded && (
          <>
            <View className="column-headers">
              <Text className="header-ultrafiltration">超滤量</Text>
              <Text className="header-time">时间</Text>
            </View>
            <View className="data-records">
              {detailedData.map((record, index) => (
                <View key={index} className="data-item">
                  <Text className="ultrafiltration">
                    {record.ultrafiltration} ml
                  </Text>
                  <View className="time-info">
                    <Text className="date">
                      {format(new Date(record.recordDate), "MM/dd")}
                    </Text>
                    <Text className="time">
                      {record.recordTime.substring(0, 5)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      <Popup
        visible={isPopupVisible}
        onClose={closePopup}
        title={selectedItem ? selectedItem.date : ""}
      >
        <View className="popup-content-wrapper">
          {selectedItem && (
            <ScrollView scrollY className="popup-content-scroll">
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
