import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import AddButton from '../AddButton';
import './index.scss';

interface UrineVolumeCardProps {
  data: {
    updateTime: string;
    value: number;
  };
}

const UrineVolumeCard: React.FC<UrineVolumeCardProps> = ({ data }) => {
  const onAddClick = () => {
    console.log("onAddClick");
  };

  return (
    <View className="urine-volume-card">
      <View className="header">
        <Text className="title">尿量</Text>
        <AddButton size={32} className="add-button" onClick={onAddClick} />
      </View>
      <View className="content">
        <View className="value-container">
          <Text className="value">{data.value}</Text>
          <Text className="unit">毫升</Text>
        </View>
        <Image src="../../assets/images/water_bottle.png" className="urine-icon" />
      </View>
    </View>
  );
};

export default UrineVolumeCard;