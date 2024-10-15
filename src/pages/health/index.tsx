import React from 'react';
import { View, ScrollView } from '@tarojs/components';
import UltrafiltrationView from '@/components/UltrafiltrationView';
import CardRenderer from '@/components/CardRenderer';
import { cardConfig } from '@/data/cardConfig';
import './index.scss';

const HealthPage: React.FC = () => {
  // Simulated ultrafiltration data
  const ultrafiltrationData = {
    value: 800,
    maxValue: 1000,
    concentration: "1.5%",
    currentSession: 1,
    totalSession: 4,
    updateTime: "3天前"
  };

  return (
    <ScrollView className="health-page" scrollY>
      <View className="content-wrapper">
        <UltrafiltrationView {...ultrafiltrationData} />
        
        {/* Dynamic cards rendering */}
        <View className="health-grid">
          {cardConfig.length > 0 ? (
            cardConfig.map((card) => (
              <CardRenderer
                key={card.id}
                type={card.type}
                id={card.id}
                isFullWidth={card.isFullWidth}
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