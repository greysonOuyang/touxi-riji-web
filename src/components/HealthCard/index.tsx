import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.scss';

interface HealthCardProps {
  data: {
    id: string;
    title: string;
    value: string;
    unit?: string;
    isFullWidth: boolean;
  };
}

const HealthCard: React.FC<HealthCardProps> = ({ data }) => {
  return (
    <View className={`health-card ${data.isFullWidth ? 'full-width' : 'half-width'}`}>
      <Text className="card-title">{data.title}</Text>
      <View className="card-content">
        <Text className="card-value">{data.value}</Text>
        {data.unit && <Text className="card-unit">{data.unit}</Text>}
      </View>
    </View>
  );
};

export default HealthCard;