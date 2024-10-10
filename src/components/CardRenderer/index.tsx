import React from 'react';
import { View } from '@tarojs/components';
import WeightCard from '@/components/WeightCard';
import UltrafiltrationCard from '@/components/UltrafiltrationCard';
// 如果有更多卡片，继续引入
// import AnotherCard from '@/components/AnotherCard';

const cardComponents = {
  weight: WeightCard,
  ultrafiltration: UltrafiltrationCard,
  // 更多卡片类型的映射
  // another: AnotherCard,
};

interface CardRendererProps {
  type: string;
  id: number;
  isFullWidth: boolean;
}

const CardRenderer: React.FC<CardRendererProps> = ({ type, id, isFullWidth }) => {
  const CardComponent = cardComponents[type];

  if (!CardComponent) {
    return null;
  }

  return (
    <View className={`health-card ${isFullWidth ? 'full-width' : 'half-width'}`} key={id}>
      <CardComponent />
    </View>
  );
};

export default CardRenderer;