import React, { useState } from "react";
import { View, Text, Picker } from "@tarojs/components";
import { AtButton, AtProgress } from "taro-ui";
import "./index.scss";

export const DialysisData: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("2023-06-15");

  const dialysisData = [
    {
      time: "06:00",
      concentration: "1.5%",
      drainageVolume: 2000,
      ultrafiltrationVolume: 500,
    },
    {
      time: "12:00",
      concentration: "2.5%",
      drainageVolume: 2200,
      ultrafiltrationVolume: 600,
    },
    {
      time: "18:00",
      concentration: "1.5%",
      drainageVolume: 2100,
      ultrafiltrationVolume: 550,
    },
    {
      time: "22:00",
      concentration: "2.5%",
      drainageVolume: 2300,
      ultrafiltrationVolume: 650,
    },
  ];

  const totalExchanges = 4;
  const completedExchanges = dialysisData.length;
  const totalUltrafiltration = dialysisData.reduce(
    (sum, data) => sum + data.ultrafiltrationVolume,
    0
  );

  const onDateChange = (e) => {
    setSelectedDate(e.detail.value);
  };

  return (
    <View className="dialysis-data">
      <View className="date-picker">
        <Picker mode="date" onChange={onDateChange} value={selectedDate}>
          <AtButton>{selectedDate}</AtButton>
        </Picker>
      </View>
      <View className="summary">
        <Text className="ultrafiltration">
          超滤量: {totalUltrafiltration} ml
        </Text>
        <Text className="exchanges">
          {completedExchanges} / {totalExchanges}次
        </Text>
      </View>
      <AtProgress
        percent={(completedExchanges / totalExchanges) * 100}
        isHidePercent
      />
      <View className="timeline">
        {dialysisData.map((data, index) => (
          <View key={index} className="timeline-item">
            <View className="time">{data.time}</View>
            <View className="details">
              <Text>
                浓度: {data.concentration} | 引流量: {data.drainageVolume}ml
              </Text>
              <Text className="ultrafiltration">
                {data.ultrafiltrationVolume}ml
              </Text>
            </View>
          </View>
        ))}
      </View>
      <AtButton className="add-record" type="secondary" full>
        添加记录
      </AtButton>
    </View>
  );
};
