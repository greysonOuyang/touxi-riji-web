import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import LoginPrompt from "@/components/LoginPrompt";
import UltrafiltrationView from "@/components/pdPlan/UltrafiltrationView";
import WaterIntakeCard from "@/components/water/WaterIntakeCard";
import UrineVolumeCard from "@/components/urine/UrineVolumeCard";
import BloodPressureCard from "@/components/bloodPresure/BloodPressureCard";
import WeightCard from "@/components/weight/WeightCard";
import "./index.scss";
import CustomNavBar from "@/components/common/CustomNavBar";

const HealthPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!Taro.getStorageSync("token"));
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  const [refreshTriggers, setRefreshTriggers] = useState({
    bloodPressure: 0,
    waterIntake: 0,
    urineVolume: 0,
    weight: 0,
    ultrafiltration: 0,
  });

  useDidShow(() => {
    setIsLoggedIn(!!Taro.getStorageSync("token"));
    setRefreshTriggers((prev) => ({
      bloodPressure: prev.bloodPressure + 1,
      waterIntake: prev.waterIntake + 1,
      urineVolume: prev.urineVolume + 1,
      weight: prev.weight + 1,
      ultrafiltration: prev.ultrafiltration + 1,
    }));
  });

  return (
    <View className="page-container">
      <CustomNavBar title="健康概览" showBackButton={false} />
      <ScrollView className="health-page" scrollY={isScrollEnabled}>
        {!isLoggedIn && <LoginPrompt />}
        <View className="content-wrapper">
          <UltrafiltrationView />
          <Text className="large_text_semi_bold">健康概览</Text>
          <View className="health-grid">
            <View className="top-row">
              <View className="left-column">
                <WaterIntakeCard />
              </View>
              <View className="right-column">
                <UrineVolumeCard />
                <BloodPressureCard />
              </View>
            </View>
            <View className="full-width-card">
              <WeightCard />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HealthPage;
