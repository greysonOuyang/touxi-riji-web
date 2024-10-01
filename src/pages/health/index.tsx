import React from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";
import UltrafiltrationView from "@/components/UltrafiltrationView";
import HealthCard from "@/components/HealthCard";
import { cardLayout } from "@/data/healthData";

const HealthPage: React.FC = () => {
  const ultrafiltrationValue = 800;
  const ultrafiltrationTarget = 2000;

  return (
    <View className="page-container">
      <View className="main-content">
        <View className="health-page">
          <Text className="date-title">{new Date().toLocaleDateString()}</Text>

          <View className="cards-container">
            <UltrafiltrationView
              value={500}
              target={1000}
              concentration="1.5%"
              specification="2000ml"
              currentSession={2}
              totalSessions={3}
            />
          </View>

          <View className="health-grid">
            {cardLayout.map((data) => (
              <HealthCard key={data.id} data={data} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HealthPage;
