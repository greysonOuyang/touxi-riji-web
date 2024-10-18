import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import UltrafiltrationView from '@/components/UltrafiltrationView';
import CardRenderer from '@/components/CardRenderer';
import { cardConfig } from '@/data/cardConfig';
import './index.scss';
import '../../app.scss'


const HealthPage: React.FC = () => {
  // Simulated ultrafiltration data
  const ultrafiltrationData = {
    value: -600,
    maxValue: 1000,
    concentration: "1.5%",
    currentSession: 1,
    totalSession: 4,
    updateTime: "3天前"
  };

  // Simulated card data
  const cardData = {
    weight: {
      weight: 70.5,
      unit: "公斤",
      weightChange: 1.1,
      updateTime: "2024-10-16 14:30",
      relativeTime: "2小时前"
    },
    water: {
      maxIntake: 1000, // 最大值
      currentIntake: 450, // 当前喝水总量
      records: [
        { time: '6am - 8am', amount: 600 },
        { time: '9am - 11am', amount: 500 },
        { time: '11am - 2pm', amount: 1000 },
        { time: '2pm - 4pm', amount: 700 },
        { time: '4pm - now', amount: 900 },
      ]
    }
    // 其他卡片类型的数据
    // another: { ... }
  };

  return (
    <ScrollView className="health-page" scrollY>
      <View className="content-wrapper">
        <UltrafiltrationView {...ultrafiltrationData} />
        <Text className="large_text_semi_bold">健康概览</Text>
        {/* Dynamic cards rendering */}
        <View className="health-grid">
          {cardConfig.length > 0 ? (
            cardConfig.map((card) => (
              <CardRenderer
                key={card.id}
                type={card.type}
                id={card.id}
                isFullWidth={card.isFullWidth}
                data={cardData[card.type]}  // 传递对应卡片的数据
              />
            ))
          ) : (
            <View>No cards available</View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default HealthPage;