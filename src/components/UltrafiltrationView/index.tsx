import React, { useState } from 'react';
import { View, Text, Button } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import AddButton from '@/components/AddButton';
import "./index.scss";
import "../../app.scss";

const UltrafiltrationView = ({
  value,
  maxValue,
  concentration,
  currentSession,
  totalSession,
  updateTime,
}) => {
  const [animate, setAnimate] = useState(false); // 将 useState 移动到组件内部

  const onAddClick = () => {
    console.log("onAddClick");
  };

  const onViewClick = () => {
    console.log("onViewClick");
  };

  const toggleAnimation = () => {
    setAnimate(prev => !prev);
  };

  return (
    <View className="ultrafiltration-view">
      <Text className="large_text_semi_bold">超滤量</Text>
      <View className="ultrafiltration-card">
        <Text className="session-info">
          {currentSession} / {totalSession}次
        </Text>
        <View className="ball">
          <UltrafiltrationBall value={value} maxValue={maxValue} animate={animate} />
        </View>
        <Text className="concentration">浓度 {concentration}</Text>
        <Text className="ultrafiltration-update-time">更新于 {updateTime}</Text>
        <AddButton size={32} className="ultrafiltration-add-button" onClick={onAddClick} />
        <View className="view-button" onClick={onViewClick}>
          更多
        </View>
        <Button onClick={toggleAnimation}>
          {animate ? 'Stop Animation' : 'Start Animation'}
        </Button>
      </View>
    </View>
  );
};

export default UltrafiltrationView;