import React, { useState, useEffect } from "react";
import { View, Text, Picker } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import {
  getPdRecordsByDate,
  PdRecordVO,
  TodayPdRecordDTO,
} from "@/api/pdRecordApi";
import { format, parse } from "date-fns";
import "./index.scss";

export const DialysisData: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pdRecord, setPdRecord] = useState<PdRecordVO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPdRecords();
  }, [selectedDate]);

  const fetchPdRecords = async () => {
    setIsLoading(true);
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) {
        console.error("用户ID不存在");
        return;
      }
      const date = format(selectedDate, "yyyy-MM-dd");
      const response = await getPdRecordsByDate(userId, date);
      if (response.isSuccess()) {
        setPdRecord(response.data);
      } else {
        console.error("获取数据失败:", response.msg);
        setPdRecord(null);
      }
    } catch (err) {
      console.error("获取数据时发生错误:", err);
      setPdRecord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = parse(e.detail.value, "yyyy-MM-dd", new Date());
    setSelectedDate(newDate);
  };

  if (isLoading) {
    return <View className="loading-view">加载中...</View>;
  }

  if (!pdRecord) {
    return <View className="empty-view">暂无数据</View>;
  }

  const isNegativeUltrafiltration = pdRecord.totalUltrafiltration < 0;
  const progressPercentage = Math.min(
    Math.abs((pdRecord.totalUltrafiltration / 1000) * 100),
    100
  );

  return (
    <View className="dialysis-data">
      <View className="header">
        <Text className="title">腹透数据</Text>
        <Picker
          mode="date"
          onChange={handleDateChange}
          value={format(selectedDate, "yyyy-MM-dd")}
          end={format(new Date(), "yyyy-MM-dd")}
        >
          <View className="date-picker">
            {format(selectedDate, "yyyy-MM-dd")}
            <AtIcon value="chevron-down" size="10" color="#666" />
          </View>
        </Picker>
      </View>

      <View className="total-section">
        <View className="total-info">
          <Text className="total-label">
            超滤量{" "}
            <Text
              className={`total-value ${
                isNegativeUltrafiltration ? "negative" : ""
              }`}
            >
              {pdRecord.totalUltrafiltration} ml
            </Text>
          </Text>
          <Text className="count-info">
            {pdRecord.totalCount} / {pdRecord.dailyFrequency}次
          </Text>
        </View>
        <View className="progress-bar">
          <View
            className={`progress-fill ${
              isNegativeUltrafiltration ? "negative" : "positive"
            }`}
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </View>
      </View>

      {isNegativeUltrafiltration && (
        <View className="warning-section">
          <AtIcon value="alert-circle" size="10" color="#FFA500" />
          <Text className="warning-text">
            当前超滤量为负值，请及时关注，必要时咨询医生。
          </Text>
        </View>
      )}

      <View className="timeline">
        {pdRecord.dateRecords &&
          pdRecord.dateRecords.map(
            (record: TodayPdRecordDTO, index: number) => (
              <View key={index} className="timeline-item">
                <View className="time-content">
                  <Text className="time">
                    {record.recordTime.substring(0, 5)}
                  </Text>
                  <Text className="details">
                    浓度: {record.dialysateType} | 引流量:{" "}
                    {record.drainageVolume}ml
                  </Text>
                </View>
                <Text className="ultrafiltration">
                  {record.ultrafiltration || 0} ml
                </Text>
              </View>
            )
          )}
      </View>

      {format(selectedDate, "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd") && (
        <View
          className="add-record"
          onClick={() =>
            Taro.navigateTo({
              url: "/pages/pdPlan/record/index",
            })
          }
        >
          <AtIcon value="add" size="10" color="#666" />
          <Text className="add-text">添加记录</Text>
        </View>
      )}
    </View>
  );
};

export default DialysisData;
