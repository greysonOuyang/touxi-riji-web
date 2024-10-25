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
      <View className="small-card-header">
        <Text className="small-card-title">血压</Text>
        <AddButton size={24} className="small-card-add-button" onClick={onAddClick} />
      </View>
      
      <View className="content">
        <View className="value-container">
          <Text className="global-value">{data.high}</Text>
          <Text className="global-value">/</Text>
          <Text className="global-value">{data.low}</Text>
        </View>
        
        <Text className="global-unit blood-unit">mmHg</Text>
      </View>
      
      <Text className="update-time">{data.updateTime} 更新</Text>
      
      <Image src="../../assets/images/heart_icon.png" className="heart-icon" />
    </View>
  );
  
  
};

export default BloodPressureCard;
