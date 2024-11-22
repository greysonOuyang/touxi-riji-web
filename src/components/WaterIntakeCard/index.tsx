import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import {
  getLatestWaterIntakes,
  addWaterIntakeRecord,
  WaterIntakeVO,
} from "../../api/waterIntakeApi";
import WaterInputPopup from "../WaterInputPopup";
import "./index.scss";
import Taro from "@tarojs/taro";

const WaterIntakeCard: React.FC = () => {
  const [data, setData] = useState<{
    totalAmount: number;
    maxAmount: number;
    records: WaterIntakeVO[];
  }>({
    totalAmount: 0,
    maxAmount: 1500,
    records: [],
  });

  const [isPopupOpened, setIsPopupOpened] = useState(false);

  const getDisplayRecords = () => {
    const displayRecords = [...data.records];
    const remainingCount = 5 - displayRecords.length;

    if (remainingCount > 0) {
      const placeholders = Array(remainingCount).fill({
        timeFormatted: "--:--",
        amount: 0,
      });
      displayRecords.push(...placeholders);
    }

    return displayRecords.slice(0, 5);
  };

  const fetchWaterIntakeData = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getLatestWaterIntakes(userId);

      if (response && response.data) {
        setData({
          maxAmount: response.data.maxAmount || 2000,
          totalAmount: response.data.totalAmount || 0,
          records: response.data.waterIntakeRecords || [],
        });
      }
    } catch (error) {
      console.error("获取喝水数据失败:", error);
    }
  };

  useEffect(() => {
    fetchWaterIntakeData();
  }, []);

  const progressPercentage = (data.totalAmount / data.maxAmount) * 100;

  return (
    <View className="water-card">
      <View className="water-progress-container">
        <View
          className="water-progress"
          style={{ height: `${progressPercentage}%` }}
        ></View>
      </View>
      <View className="water-info-container">
        <View className="water-header">
          <Text className="water-title">今日喝水</Text>
          {/* <Text className="water-amount">{data.totalAmount}ml</Text> */}
          <Text className="water-tip"> {data.totalAmount}ml</Text>
        </View>
        <View className="water-records">
          {getDisplayRecords().map((record, index) => (
            <View
              key={index}
              className={`water-record ${
                !record.amount ? "water-record-placeholder" : ""
              }`}
            >
              <View className="water-record-dot"></View>
              <View className="water-record-info">
                <View className="water-record-time">
                  {record.timeFormatted || "--:--"}
                </View>
                <Text className="water-record-amount">
                  {record.amount ? `${record.amount}ml` : "--"}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="drink-button" onClick={() => setIsPopupOpened(true)}>
          喝一口
        </View>
      </View>

      <WaterInputPopup
        isOpened={isPopupOpened}
        onClose={() => setIsPopupOpened(false)}
        onSuccess={fetchWaterIntakeData}
      />
    </View>
  );
};

export default WaterIntakeCard;
