import React, { useState } from "react";

import { View } from "@tarojs/components";

import "./index.scss";
import UltrafiltrationView from "@/components/UltrafiltrationView";
import HealthCard from "@/components/HealthCard";
import { cardLayout } from "@/data/healthData";

interface HealthData {
  // Define the structure of your health data here
  ultrafiltration: {
    value: number;
    target: number;
    concentration: string;
    specification: string;
    currentSession: number;
    totalSession: number;
  };
  // Add other health data fields as needed
}

const HealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData>({
    ultrafiltration: {
      value: 500,
      target: 1000,
      concentration: "1.5%",
      specification: "2000ml",
      currentSession: 1,
      totalSession: 4,
    },
    // Initialize other health data fields here
  });

  return (
    <View className="main-content">
      <View className="health-page">
        <View className="cards-container">
          <UltrafiltrationView
            value={healthData.ultrafiltration.value}
            target={healthData.ultrafiltration.target}
            concentration={healthData.ultrafiltration.concentration}
            specification={healthData.ultrafiltration.specification}
            currentSession={healthData.ultrafiltration.currentSession}
            totalSession={healthData.ultrafiltration.totalSession}
          />
        </View>

        <View className="health-grid">
          {cardLayout.map((data) => (
            <HealthCard key={data.id} data={data} />
          ))}
        </View>
      </View>
    </View>
);

};

export default HealthPage;
