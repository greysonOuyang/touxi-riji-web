import React from "react";
import { View, Text } from "@tarojs/components";
import "./ChartIndicators.scss";

const ChartIndicators: React.FC = () => {
  return (
    <View className="chart-indicators">
      <View className="indicator-item">
        <View className="indicator-color ultrafiltration" />
        <Text className="indicator-label">超滤量</Text>
      </View>
      
      <View className="indicator-item">
        <View className="indicator-color drainage" />
        <Text className="indicator-label">引流量</Text>
      </View>
      
      <View className="indicator-item">
        <View className="indicator-color target" />
        <Text className="indicator-label">目标值</Text>
      </View>
    </View>
  );
};

export default ChartIndicators; 