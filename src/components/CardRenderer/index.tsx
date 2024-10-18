import React from 'react';
import { View } from '@tarojs/components';
import WeightCard from '@/components/WeightCard';
import WaterIntakeCard from '../WaterIntakeCard';
// 如果有更多卡片，继续引入
import AnotherCard from '@/components/AnotherCard';
import './index.scss'

const cardComponents = {
  weight: WeightCard,
  // 更多卡片类型的映射
//   another: AnotherCard,
  water: WaterIntakeCard
};

interface CardRendererProps {
  type: string;
  id: number;
  isFullWidth: boolean;
  data: any;  // 传递卡片数据
}

const CardRenderer: React.FC<CardRendererProps> = ({ type, id, isFullWidth, data }) => {
  const CardComponent = cardComponents[type];

  if (!CardComponent) {
    return null;
  }

  return (
    <View className={`health-card ${isFullWidth ? 'full-width' : 'half-width'}`} key={id}>
      <CardComponent data={data} />
    </View>
  );
};

export default CardRenderer;