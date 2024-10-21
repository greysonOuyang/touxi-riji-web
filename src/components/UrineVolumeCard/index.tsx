import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import AddButton from '../AddButton'; // 假设有通用的AddButton组件
import './index.scss';

const UrineVolumeCard = ({data }) => {

    const onAddClick = () => {
      console.log("onAddClick");
    }

  return (
    <View className="urine-volume-card">
      <View className="header">
        <Text className="title">尿量</Text>
        <Text className="update-time">{data.updateTime}更新</Text>
      </View>
      <View className="add-button" >
      <AddButton size={24} onClick={onAddClick}/>
      </View>
      <View className="content">
        <Text className="value">{data.value}</Text>
        <Text className="unit">毫升</Text>
        <View className="icon">
          {/* 这里可以放置尿量图标 */}
          <Image src="../../assets/images/water_bottle.png" className="urine-icon" />
        </View>
      </View>
    </View>
  );
};

export default UrineVolumeCard;
