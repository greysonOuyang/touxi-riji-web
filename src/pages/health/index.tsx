import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import UltrafiltrationView from '@/components/UltrafiltrationView';
import WaterIntakeCard from '@/components/WaterIntakeCard';
import UrineVolumeCard from '@/components/UrineVolumeCard';
import BloodPressureCard from '@/components/BloodPressureCard';
import WeightCard from '@/components/WeightCard';
import './index.scss';
import '../../app.scss';
import { useDidShow } from '@tarojs/taro';

const HealthPage: React.FC = () => {

   // 为每个需要刷新的组件添加刷新触发器
   const [refreshTriggers, setRefreshTriggers] = useState({
    bloodPressure: 0,
    waterIntake: 0,
    urineVolume: 0,
    weight: 0,
    ultrafiltration: 0
  });

  // 页面显示时触发刷新
  useDidShow(() => {
    setRefreshTriggers(prev => ({
      bloodPressure: prev.bloodPressure + 1,
      waterIntake: prev.waterIntake + 1,
      urineVolume: prev.urineVolume + 1,
      weight: prev.weight + 1,
      ultrafiltration: prev.ultrafiltration + 1
    }));
  });

  // 模拟超滤数据
  const ultrafiltrationData = {
    value: -400,
    maxValue: 1000,
    concentration: "1.5%",
    currentSession: 1,
    totalSession: 4,
    updateTime: "3天前",
  };

  // 模拟卡片数据
  const cardData = {
    weight: {
      weight: 70.5,
      unit: "公斤",
      weightChange: 1.1,
      updateTime: "2024-10-16 14:30",
      relativeTime: "2小时前",
    },
    water: {
      maxIntake: 1000,
      currentIntake: 450,
      records: [
        { time: '18:40', amount: 600 },
        { time: '16:32', amount: 500 },
        { time: '13:11', amount: 1000 },
        { time: '11:40', amount: 700 },
        { time: '8:30', amount: 900 },
      ],
    },
    urine: {
      value: 1000,
      updateTime: "14:30",
    },
    blood: {
      high: 135,
      low: 59,
      updateTime: "12:11",
    },
  };

  return (
    <ScrollView className="health-page" scrollY>
  <View className="content-wrapper">
    {/* 超滤量卡片 */}
    <UltrafiltrationView {...ultrafiltrationData} />
    <Text className="large_text_semi_bold">健康概览</Text>

    {/* 固定布局的健康卡片 */}
    <View className="health-grid">
      <View className="top-row">
        {/* 左侧：喝水卡片 */}
        <View className="left-column">
          <WaterIntakeCard data={cardData.water} />
        </View>

        {/* 右侧：尿液卡片和血压卡片 */}
        <View className="right-column">
          <UrineVolumeCard data={cardData.urine} />
          <BloodPressureCard data={cardData.blood} />
        </View>
      </View>

      {/* 底部跨两列的体重卡片 */}
      <View className="full-width-card">
        <WeightCard data={cardData.weight} />
      </View>
    </View>
  </View>
</ScrollView>
  );
  
  
  
};

export default HealthPage;
