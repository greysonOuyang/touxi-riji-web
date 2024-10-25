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
      {/* 头部：标题和添加按钮 */}
      <View className="small-card-header">
        <Text className="small-card-title">血压</Text>
        <AddButton size={24} className="small-card-add-button" onClick={onAddClick} />
      </View>
      
      {/* 内容部分 */}
      <View className="content">
        <View className="value-container">
          {/* 判断高压和低压是否有值，如果没有显示 --/-- */}
          {data.high && data.low ? (
            <>
              <Text
                className={`global-value ${data.high > 130 ? 'high-red' : data.high < 90 ? 'high-green' : ''}`}
              >
                {data.high}
              </Text>
              <Text className="global-value">/</Text>
              <Text
                className={`global-value ${data.low > 80 ? 'low-red' : data.low < 60 ? 'low-green' : ''}`}
              >
                {data.low}
              </Text>
            </>
          ) : (
            <>
              <Text className="global-value">--</Text>
              <Text className="global-value">/</Text>
              <Text className="global-value">--</Text>
            </>
          )}
        </View>
        
        {/* 单位 mmHg */}
        <Text className="global-unit blood-unit">mmHg</Text>
      </View>
      
      {/* 底部的更新时间 */}
      <Text className="update-time">{data.updateTime ? `${data.updateTime} 更新` : '-- 更新'}</Text>
      
      {/* 心脏图标 */}
      <Image src="../../assets/images/heart_icon.png" className="heart-icon" />
    </View>
  );
  
  
  
};

export default BloodPressureCard;
