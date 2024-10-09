import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import UltrafiltrationBall from '../UltrafiltrationBall';
import './index.scss';

interface UltrafiltrationViewProps {
  value: number;
  target: number;
  concentration: string;
  specification: string;
  currentSession: number;
  totalSession: number;
}

const UltrafiltrationView: React.FC<UltrafiltrationViewProps> = ({
  value,
  target,
  concentration,
  specification,
  currentSession,
  totalSession,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const handleOpenForm = () => setIsFormVisible(true);
  const handleCloseForm = () => setIsFormVisible(false);
  const handleSaveForm = (newData) => {
    console.log('New data:', newData);
    setIsFormVisible(false);
  };

  return (
    <View className="ultrafiltration-view">
      <View className="ultrafiltration-header">
        <Text className="label">超滤量</Text>
        <Text className="date">{currentDate}</Text>
      </View>
      <View className="ultrafiltration-main">
        <View className="ball-container">
          <UltrafiltrationBall value={value} maxValue={target} />
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
          <Text className="detail-value">{currentSession}/{totalSession}</Text>
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;
