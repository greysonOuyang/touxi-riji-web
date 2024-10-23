import React from "react";
import { View, Text, Button } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import AddButton from '@/components/AddButton';
import "./index.scss";
import "../../app.scss"

const onAddClick = () => {
  console.log("onAddClick");
};

const onViewClick = () => {
  console.log("onViewClick");
};

const UltrafiltrationView = ({
  value,
  maxValue,
  concentration,
  currentSession,
  totalSession,
  updateTime,
}) => {
  return (
    <View className="ultrafiltration-view">
      <Text className="large_text_semi_bold">超滤量</Text>
      <View className="ultrafiltration-card">
        <Text className="session-info">
          {currentSession} / {totalSession}次
        </Text>
        <View className="ball">
          <UltrafiltrationBall value={value} maxValue={maxValue} />
        </View>
        <Text className="concentration">浓度 {concentration}</Text>
        <Text className="update-time">更新于 {updateTime}</Text>
        <AddButton size={32} className="add-button" onClick={onAddClick} />
        <View className="view-button" onClick={onViewClick}>
          更多
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;
