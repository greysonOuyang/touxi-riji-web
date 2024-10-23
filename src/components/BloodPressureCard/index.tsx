import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import AddButton from '../AddButton';
import './index.scss';

const BloodPressureCard = ({ data }) => {
  const onAddClick = () => {
    console.log("onAddClick");
  };

  return (
    <View className="blood-pressure-card">
      <View className="header">
        <Text className="title">血压</Text>
        <Text className="update-time">{data.updateTime}更新</Text>
        <AddButton size={32} className="add-button" onClick={onAddClick} />
      </View>
      <View className="content">
        <View className="value-container">
          <Text className="value">{data.value}</Text>
          <Text className="unit">mmHg</Text>
        </View>
        <Image src="../../assets/images/heart_icon.png" className="heart-icon" />
      </View>
    </View>
  );
};

export default BloodPressureCard;
