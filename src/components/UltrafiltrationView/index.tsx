import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import { UltrafiltrationData } from "types";
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
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      <View className="ultrafiltration-header">
        <Text className="date">2024/10/3</Text>
        <Text className="value">{Math.round(value)}ml</Text>
      </View>
      <View className="ultrafiltration-main">
        <UltrafiltrationBall value={value} maxValue={target} />
        <View className="add-button" onClick={handleAddClick}>
          <View className="plus-icon" />
        </View>
      </View>
      <View className="ultrafiltration-details">
        <View className="detail-item">
          <Text className="detail-label">浓度</Text>
          <Text className="detail-value">{concentration}</Text>
        </View>
        <View className="detail-item">
          <Text className="detail-label">规格</Text>
          <Text className="detail-value">{specification}</Text>
        </View>
        <View className="detail-item">
          <Text className="detail-label">次数</Text>
          <Text className="detail-value">{currentSession}/{totalSessions}</Text>
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