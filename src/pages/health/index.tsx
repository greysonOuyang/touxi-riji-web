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
    target: 1000,
    concentration: "1.5%",
    specification: "2000ml",
    currentSession: 1,
    totalSession: 4,
  };

  return (
    <View className="main-content">
      <ScrollView className="health-page" scrollY>
        {/* Fixed UltrafiltrationView */}
        <View className="cards-container">
          <UltrafiltrationView {...ultrafiltrationData} />
        </View>

        {/* Dynamic cards rendering */}
        <View className="cards-container">
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
    </View>
  );
};

export default HealthPage;
