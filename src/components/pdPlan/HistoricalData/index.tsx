import React from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

interface HistoryDataItem {
  date: string;
  value: number;
}

interface HistoricalDataProps {
  data: HistoryDataItem[];
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ data }) => {
  return (
    <View className="historical-data">
      <Text className="section-title">历史数据</Text>
      <View className="history-list">
        {data.map((item, index) => (
          <View key={index} className="history-item">
            <Text className="date">{item.date}</Text>
            <Text className="value">{item.value} ml</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default HistoricalData;
