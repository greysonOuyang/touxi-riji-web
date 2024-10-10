import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss';

const WeightCard: React.FC = () => {
  return (
    <View className="weight-card">
      <Text className="title">体重记录</Text>
      <View className="content">
        <Text>最新体重: 70kg</Text>
        <Text>目标体重: 65kg</Text>
      </View>
    </View>
  );
};

export default WeightCard;