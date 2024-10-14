import React from "react";
import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import "./index.scss";

interface UltrafiltrationCardProps {
  value: number;
  target: number;
  currentSession: number;
  totalSession: number;
  concentration: string;
  updateTime: string;
}

const onAddClick = () => {
  console.log("add");
};

const UltrafiltrationView: React.FC<UltrafiltrationCardProps> = ({
  value,
  target,
  currentSession,
  totalSession,
  concentration,
  updateTime,
}) => {
  const percentage = (value / target) * 100;

  return (
    <View className="ultrafiltration-view">
      <Text className="ultrafiltration-view__title">超滤量</Text>
      <View className="ultrafiltration-card">
        <View className="card-content">
          <View className="ball-container">
            <View className="ultrafiltration-ball">
              <View
                className="ball-progress"
                style={{ height: `${percentage}%` }}
              />
              <Text className="ball-value">{value} ml</Text>
            </View>
          </View>
          <View className="info-container">
            <Text className="session-info">
              {currentSession} / {totalSession}次
            </Text>
            <Text className="concentration">浓度{concentration}</Text>
            <Text className="update-time">更新于{updateTime}</Text>
          </View>
          <Button className="add-button" onClick={onAddClick}>
            <View className="plus-icon" />
          </Button>
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;
