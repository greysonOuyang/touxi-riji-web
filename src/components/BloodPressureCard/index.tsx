// BloodPressureCard.js
import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import AddButton from '../AddButton';
import { fetchLatestBloodPressure } from '@/api';
import './index.scss'
const BloodPressureCard = ({ data }) => {
  const [bpData, setBpData] = useState(data || { systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchLatestBloodPressure();
        if (response?.isSuccess() && response.data) {
          setBpData(response.data);
        } else {
          setBpData({ systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });
        }
      } catch (error) {
        console.error('获取血压数据时出错:', error);
        setBpData({ systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });
      }
    };
    fetchData();
  }, []);

  const onAddClick = () => {
    Taro.navigateTo({ url: '/pages/BloodPressureInputPage/index' }); // 新增的页面路径
  };

  return (
    <View className="blood-pressure-card">
      {/* 头部：标题和添加按钮 */}
      <View className="small-card-header">
        <Text className="small-card-title">血压</Text>
        <AddButton size={24} className="small-card-add-button" onClick={onAddClick} />
      </View>

      {/* 血压和心率内容 */}
      <View className="content">
        <View className="value-container">
          <View className="values">
            <Text className={`systolic-value ${bpData.systolic > 130 ? 'high-red' : bpData.systolic < 90 ? 'high-green' : ''}`}>
              {bpData.systolic}
            </Text>
            <Text className="separator">/</Text>
            <Text className={`diastolic-value ${bpData.diastolic > 80 ? 'low-red' : bpData.diastolic < 60 ? 'low-green' : ''}`}>
              {bpData.diastolic}
            </Text>
            <Text className="blood-unit">mmHg</Text>
          </View>
          <View className="heart-rate-row">
            <Text className={`heart-rate-value ${bpData.heartRate > 100 ? 'high-red' : bpData.heartRate < 60 ? 'low-green' : ''}`}>
              {bpData.heartRate} 
            </Text>
            <Text className="heart-rate-unit">BPM</Text>
          </View>
        </View>
      </View>

      <Text className="update-time">{bpData.formattedMeasurementTime || '暂无数据'}</Text>
      <Image src="../../assets/images/heart_icon.png" className="heart-icon" />
    </View>
  );
};

export default BloodPressureCard;
