import React from "react";
import { View, Text } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import "./index.scss";

const HistoricalData: React.FC = () => {
  const historicalData = [
    { date: "2023-06-10", avgUltrafiltration: 550 },
    { date: "2023-06-09", avgUltrafiltration: 520 },
    { date: "2023-06-08", avgUltrafiltration: 580 },
    { date: "2023-06-07", avgUltrafiltration: 540 },
    { date: "2023-06-06", avgUltrafiltration: 560 },
  ];

  return (
    <View className="historical-data">
      <View className="header">
        <Text className="title">历史数据</Text>
        <Text className="more">更多</Text>
      </View>
      <AtList>
        {historicalData.map((data, index) => (
          <AtListItem
            key={index}
            title={data.date}
            extraText={`${data.avgUltrafiltration} ml`}
          />
        ))}
      </AtList>
    </View>
  );
};

export default HistoricalData;
