import React from "react";
import { View, Text } from "@tarojs/components";
import "./ChartIndicators.scss";

interface Indicator {
  label: string;
  color: string;
}

interface ChartIndicatorsProps {
  indicators: Indicator[];
}

const ChartIndicators: React.FC<ChartIndicatorsProps> = ({ indicators }) => {
  return (
    <View className="chart-indicators">
      {indicators.map((indicator, index) => (
        <View key={index} className="indicator-item">
          <View 
            className="indicator-color" 
            style={{ backgroundColor: indicator.color }} 
          />
          <Text className="indicator-label">{indicator.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default ChartIndicators; 