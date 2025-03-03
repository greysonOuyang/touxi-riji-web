import React from "react";
import { View, Text } from "@tarojs/components";
import "./ChartIndicators.scss";

const ChartIndicators: React.FC = () => {
  return (
    <View className="chart-indicators">
      <View className="indicators-group">
        <View className="indicator-item">
          <View className="indicator-dot" style={{ background: "#92A3FD" }} />
          <Text className="indicator-text">超滤量</Text>
        </View>
        <View className="indicator-item">
          <View className="indicator-dot" style={{ background: "#C58BF2" }} />
          <Text className="indicator-text">引流量</Text>
        </View>
        <View className="indicator-item">
          <View className="indicator-dot" style={{ background: "#EEA4CE" }} />
          <Text className="indicator-text">注入量</Text>
        </View>
      </View>
      <Text className="chart-unit">单位：ml</Text>
    </View>
  );
};

export default ChartIndicators; 