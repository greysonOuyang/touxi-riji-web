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
    value: 500,
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
        { time: '18:40', amount: 600 },
        { time: '16:32', amount: 500 },
        { time: '13:11', amount: 1000 },
        { time: '11:40', amount: 700 },
        { time: '8:30', amount: 900 },
      ]
    },
    urine: {
      value: 500,
      updateTime: "14:30",
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