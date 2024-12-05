// components/WeightCard/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import dayjs from "dayjs";
import AddButton from "@/components/common/AddButton";
import WeightInputPopup from "../WeightInputPopup";
import { getLatestWeight, WeightComparisonVO } from "@/api/weightApi";
import arrowUpGreen from "@/assets/icons/arrow_up_green.jpg";
import arrowDownGreen from "@/assets/icons/arrow_down_green.jpg";
import arrowUpRed from "@/assets/icons/arrow_up_red.jpg";
import arrowDownRed from "@/assets/icons/arrow_down_red.jpg";
import "./index.scss";
import Taro from "@tarojs/taro";

const WeightCard: React.FC = () => {
  const [weightData, setWeightData] = useState<WeightComparisonVO | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetchLatestWeight();
  }, []);

  const fetchLatestWeight = async () => {
    const userId = Taro.getStorageSync("userId");
    const res = await getLatestWeight(userId);
    if (res?.isSuccess()) {
      setWeightData(res.data);
      console.log("获取体重数据成功:", res.data);
    } else {
      console.error("获取体重数据失败:", res.msg);
      setWeightData(null);
    }
  };

  const handleAddClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // 弹窗关闭后刷新数据
  const handlePopupAfterSubmit = () => {
    setIsPopupOpen(false);
    fetchLatestWeight();
  };

  // 获取显示数据
  const displayData = {
    weight: weightData?.latestWeight || 0.0,
    change: weightData?.weightChange || 0,
    measureTime: weightData?.latestMeasureTime || "",
    comparisonInfo: weightData?.comparisonInfo || "",
  };

  const [integerPart, decimalPart] = displayData.weight.toFixed(1).split(".");
  const isWeightIncreased = displayData.change > 0;
  const isSignificantChange = Math.abs(displayData.change) >= 1;

  const getArrowIcon = () => {
    if (isWeightIncreased) {
      return isSignificantChange ? arrowUpRed : arrowUpGreen;
    }
    return isSignificantChange ? arrowDownRed : arrowDownGreen;
  };

  return (
    <View className="weight-card">
      <View className="small-card-header">
        <Text className="small-card-title">体重</Text>
        <AddButton
          size={32}
          className="weight-card-add-button"
          onClick={handleAddClick}
        />
      </View>

      <View className="weight-container">
        <View className="weight-value">
          <Text className="weight-integer">{integerPart}</Text>
          <Text className="weight-decimal">.{decimalPart}</Text>
          <Text className="weight-unit">公斤</Text>
        </View>
        {displayData.measureTime && (
          <Text className="weight-update-time">
            {dayjs(displayData.measureTime).format("M月D日 HH:mm")}
          </Text>
        )}
      </View>

      <View className="weight-change-container">
        <View className="weight-change-row">
          <Text className="weight-change">
            {Math.abs(displayData.change).toFixed(1)}
          </Text>
          {displayData.change !== 0 && (
            <Image
              className={`weight-change-icon-${
                isWeightIncreased ? "up" : "down"
              }`}
              src={getArrowIcon()}
              mode="aspectFit"
            />
          )}
        </View>
        {displayData.comparisonInfo && (
          <Text className="weight-relative-time">
            {displayData.comparisonInfo}
          </Text>
        )}
      </View>

      <WeightInputPopup
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        onAfterSubmit={handlePopupAfterSubmit}
      />
    </View>
  );
};

export default WeightCard;
