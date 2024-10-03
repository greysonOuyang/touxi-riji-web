import React, { useState, useEffect } from "react";
import { View } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import { UltrafiltrationData } from "types"; // 确保路径正确
import UltrafiltrationForm from '../UltrafiltrationForm';
import "./index.scss";

interface UltrafiltrationViewProps {
  value: number;
  target: number;
  concentration: string;
  specification: string;
  currentSession: number;
  totalSessions: number;
  onUpdate: (data: UltrafiltrationData) => void;
}

const UltrafiltrationView: React.FC<UltrafiltrationViewProps> = ({
  value,
  target,
  concentration,
  specification,
  currentSession,
  totalSessions,
  onUpdate,
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // 动画效果代码保持不变
  }, [value]);

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = (data: UltrafiltrationData) => {
    onUpdate(data);
    setIsFormOpen(false);
  };

  return (
    <View className="ultrafiltration-view">
      <View className="ultrafiltration-main">
        <UltrafiltrationBall value={currentValue} maxValue={target} />
        <View className="ultrafiltration-info">
          <View className="info-label">超滤量</View>
          <View className="info-value">{currentValue}ml</View>
        </View>
        <View className="add-button" onClick={handleAddClick}>
          <View className="plus-icon"></View>
        </View>
      </View>
      <View className="ultrafiltration-details">
        <View className="detail-item">
          <View className="detail-label">浓度</View>
          <View className="detail-value">{concentration}</View>
        </View>
        <View className="detail-item">
          <View className="detail-label">规格</View>
          <View className="detail-value">{specification}</View>
        </View>
        <View className="detail-item">
          <View className="detail-label">次数</View>
          <View className="detail-value">
            {currentSession}/{totalSessions}
          </View>
        </View>
      </View>
      <UltrafiltrationForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialConcentration={concentration}
      />
    </View>
  );
};

export default UltrafiltrationView;
