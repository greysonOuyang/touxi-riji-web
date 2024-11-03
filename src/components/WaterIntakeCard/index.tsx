import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import './index.scss';

const WaterIntakeCard = ({ data }) => {
  // 计算进度百分比
  const progressPercentage = (data.currentIntake / data.maxIntake) * 100;
  console.log('Current Intake:', data.currentIntake);
  console.log('Max Intake:', data.maxIntake);
  console.log('Progress Percentage:', progressPercentage);

  return (
    <View className="water-card">
      <View className="water-progress-container">
        <View className="water-progress" style={{ height: `${progressPercentage}%` }}></View>
      </View>
      <View className="water-info-container">
        <View className="water-header">
          <Text className="water-title">今日喝水</Text>
          <Text className="water-tip">不宜超过{data.maxIntake}ml</Text>
        </View>
        <View className="water-records">
          {data.records.map((record, index) => (
            <View key={index} className="water-record">
              <View className="water-record-dot"></View>
              <View className="water-record-info">
                <View className="water-record-time">{record.time}</View>
                <Text className="water-record-amount">{record.amount}ml</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="drink-button">喝水</View>
      </View>
    </View>
  );
};

export default WaterIntakeCard;