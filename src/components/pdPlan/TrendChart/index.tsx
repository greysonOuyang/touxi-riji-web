import React, { useState } from "react";
import { View, Text, Picker } from "@tarojs/components";
import { AtButton } from "taro-ui";
import { LineChart } from "@antv/f2-react";
import "./index.scss";

export const TrendChart: React.FC = () => {
  const [period, setPeriod] = useState("week");
  const [startDate, setStartDate] = useState("2023-06-01");
  const [endDate, setEndDate] = useState("2023-06-07");

  const data = [
    { date: "周一", 超滤量: 400 },
    { date: "周二", 超滤量: 380 },
    { date: "周三", 超滤量: 450 },
    { date: "周四", 超滤量: 420 },
    { date: "周五", 超滤量: 390 },
    { date: "周六", 超滤量: 430 },
    { date: "周日", 超滤量: 410 },
  ];

  const handlePeriodChange = (e) => {
    setPeriod(e.detail.value);
  };

  const handleDateChange = (e) => {
    setStartDate(e.detail.value);
    // 这里应该根据选择的开始日期和周期来设置结束日期
  };

  return (
    <View className="trend-chart">
      <View className="header">
        <Text className="title">超滤量趋势</Text>
        <View className="controls">
          <Picker
            mode="selector"
            range={["周", "月", "年"]}
            onChange={handlePeriodChange}
          >
            <AtButton size="small">
              {period === "week" ? "周" : period === "month" ? "月" : "年"}
            </AtButton>
          </Picker>
          <Picker mode="date" onChange={handleDateChange}>
            <AtButton size="small">
              {startDate} 至 {endDate}
            </AtButton>
          </Picker>
        </View>
      </View>
      <LineChart
        data={data}
        width={300}
        height={200}
        xField="date"
        yField="超滤量"
      />
    </View>
  );
};
