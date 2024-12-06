import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtIcon, AtFloatLayout } from "taro-ui";
import Taro from "@tarojs/taro";
import {
  getPaginatedPdRecords,
  getPaginatedPdRecordsData,
  PaginatedPdRecordDateVO,
  PaginatedPdRecordDataVO,
  PdRecordDateVO,
  PdRecordData,
} from "@/api/pdRecordApi";
import { format, parse, subDays } from "date-fns";
import "./index.scss";

const HistoricalData: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [dateData, setDateData] = useState<PaginatedPdRecordDateVO | null>(
    null
  );
  const [detailedData, setDetailedData] =
    useState<PaginatedPdRecordDataVO | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<PdRecordDateVO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, showDetailedView]);

  const fetchData = async () => {
    setError(null);
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(subDays(new Date(), 9), "yyyy-MM-dd");
      if (showDetailedView) {
        const response = await getPaginatedPdRecordsData(
          userId,
          currentPage,
          pageSize,
          startDate,
          endDate
        );
        if (response.isSuccess()) {
          setDetailedData(response.data);
        } else {
          throw new Error(response.msg);
        }
      } else {
        const response = await getPaginatedPdRecords(
          userId,
          currentPage,
          pageSize,
          startDate,
          endDate
        );
        if (response.isSuccess()) {
          setDateData(response.data);
        } else {
          throw new Error(response.msg);
        }
      }
    } catch (err) {
      setError(err.message);
    }
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
    setCurrentPage(1); // Reset to first page when switching views
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

  if (error) {
    return <View className="error-message">错误: {error}</View>;
  }

  return (
    <View className="historical-data">
      <View className="header">
        <Text className="title">历史数据</Text>
        <View className="header-buttons">
          <View className="toggle-view-btn" onClick={toggleView}>
            {showDetailedView ? "日期视图" : "详细视图"}
          </View>
          <View
            className="view-more-btn"
            onClick={() =>
              Taro.navigateTo({ url: "/pages/pdPlan/historicalDataMore/index" })
            }
          >
            更多
            <AtIcon value="chevron-right" size="12" color="#666" />
          </View>
        </View>
      </View>
      {showDetailedView ? (
        detailedData && detailedData.records.length > 0 ? (
          <View className="history-list">
            {detailedData.records.map((record: PdRecordData, index) => (
              <View key={index} className="history-item">
                <Text className="date">
                  {format(
                    parse(
                      `${record.recordDate} ${record.recordTime}`,
                      "yyyy-MM-dd HH:mm:ss",
                      new Date()
                    ),
                    "yyyy-MM-dd HH:mm"
                  )}
                </Text>
                <Text className="value">{record.ultrafiltration} ml</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="no-data">暂无详细数据</View>
        )
      ) : dateData && dateData.records.length > 0 ? (
        <View className="history-list">
          {dateData.records.map((record: PdRecordDateVO) => (
            <View
              key={record.date}
              className="history-item"
              onClick={() => handleItemClick(record)}
            >
              <Text className="date">
                {format(new Date(record.date), "yyyy-MM-dd")}
              </Text>
              <View className="value-container">
                <Text className="value">{record.totalUltrafiltration} ml</Text>
                <AtIcon value="chevron-right" size="12" color="#666" />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="no-data">暂无历史数据</View>
      )}

      <AtFloatLayout isOpened={isModalOpen} onClose={closeModal}>
        <View className="modal-header">
          <Text className="modal-title">
            {selectedItem
              ? format(new Date(selectedItem.date), "yyyy-MM-dd")
              : ""}
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

export default HistoricalData;
