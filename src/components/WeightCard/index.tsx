// components/WeightCard/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import dayjs from "dayjs";
import AddButton from "../AddButton";
import { getLatestWeight, WeightComparisonVO } from '@/api/weightApi';
import arrowUpGreen from '../../assets/icons/arrow_up_green.jpg'
import arrowDownGreen from "../../assets/icons/arrow_down_green.jpg";
import arrowUpRed from '../../assets/icons/arrow_up_red.jpg'
import arrowDownRed from "../../assets/icons/arrow_down_red.jpg";
import "./index.scss";

const WeightCard: React.FC = () => {
  const [weightData, setWeightData] = useState<WeightComparisonVO | null>(null);

  useEffect(() => {
    fetchLatestWeight();
  }, []);

  const fetchLatestWeight = async () => {
    try {
      const res = await getLatestWeight();
      if (res.data) {
        setWeightData(res.data);
      }
    } catch (error) {
      console.error("获取体重数据失败:", error);
    }
  };

  const handleAddClick = () => {
    // 处理添加按钮点击事件
    console.log('添加体重记录');
  };

  // 使用模拟数据进行测试
  const mockData: WeightComparisonVO = {
    latestWeight: 66.5,
    weightChange: -0.6,
    latestMeasureTime: "2024-03-18 08:28",
    comparisonInfo: "相比于3日前"
  };

  const data = weightData || mockData;
  const [integerPart, decimalPart] = data.latestWeight.toFixed(1).split(".");
  const isWeightIncreased = data.weightChange > 0;
  const isSignificantChange = Math.abs(data.weightChange) >= 1;

  // 根据变化量和方向选择对应的箭头图标
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
        <AddButton size={32} className="weight-card-add-button" onClick={handleAddClick} />
      </View>

      <View className="weight-container">
        <View className="weight-value">
          <Text className="weight-integer">{integerPart}</Text>
          <Text className="weight-decimal">.{decimalPart}</Text>
          <Text className="weight-unit">公斤</Text>
        </View>
        <Text className="weight-update-time">
          {dayjs(data.latestMeasureTime).format('M月D日 HH:mm')}
        </Text>
      </View>

      <View className="weight-change-container">
        <View className="weight-change-row">
          <Text className="weight-change">
            {Math.abs(data.weightChange).toFixed(1)}
          </Text>
          <Image
            className={`weight-change-icon-${isWeightIncreased ? 'up' : 'down'}`}
            src={getArrowIcon()}
            mode="aspectFit"
          />
        </View>
        <Text className="weight-relative-time">{data.comparisonInfo}</Text>
      </View>
    </View>
  );
};

export default WeightCard;
