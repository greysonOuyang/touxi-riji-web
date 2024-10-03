import React from 'react';
import { View, Text } from '@tarojs/components';
import UltrafiltrationBall from '../UltrafiltrationBall';
import './index.scss'

interface UltrafiltrationViewProps {
  date: string;
  value: number;
  target: number;
  concentration: string;
  specification: string;
  frequency: number;
}

const UltrafiltrationView: React.FC<UltrafiltrationViewProps> = ({
  date,
  value,
  target,
  concentration,
  specification,
  frequency,
}) => {
  return (
    <View className="ultrafiltration-view">
      <Text className="date">{date}</Text>
      <View className="ultrafiltration-header">
        <Text className="label">超滤量</Text>
        <Text className="value">{Math.round(value)}ml</Text>
      </View>
      <View className="ultrafiltration-main">
        <UltrafiltrationBall value={value} maxValue={target} />
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
          <Text className="detail-value">{frequency}</Text>
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;