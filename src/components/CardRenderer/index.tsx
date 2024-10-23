import React from 'react';
import { View } from '@tarojs/components';
import WeightCard from '@/components/WeightCard';
import WaterIntakeCard from '../WaterIntakeCard';
// 如果有更多卡片，继续引入
import UrineVolumeCard from '../UrineVolumeCard';
import BloodPressureCard from '../BloodPressureCard';
// import './index.scss'

const cardComponents = {
  weight: WeightCard,
  water: WaterIntakeCard,
  urine: UrineVolumeCard,
  blood: BloodPressureCard,
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