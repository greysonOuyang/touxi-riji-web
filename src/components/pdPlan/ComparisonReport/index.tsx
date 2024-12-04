import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import { AtButton } from "taro-ui";
import { BarChart } from "@antv/f2-react";
import "./index.scss";

export const ComparisonReport: React.FC = () => {
  const [isWeekly, setIsWeekly] = useState(true);

  const weeklyData = [
    { name: "超滤量", 本周: 450, 上周: 420 },
    { name: "治疗完成率", 本周: 95, 上周: 90 },
    { name: "液体滞留时间方差", 本周: 0.5, 上周: 0.7 },
  ];

  const monthlyData = [
    { name: "超滤量", 本月: 440, 上月: 410 },
    { name: "治疗完成率", 本月: 93, 上月: 88 },
    { name: "液体滞留时间方差", 本月: 0.6, 上月: 0.8 },
  ];

  const data = isWeekly ? weeklyData : monthlyData;
  const period1 = isWeekly ? "本周" : "本月";
  const period2 = isWeekly ? "上周" : "上月";

  return (
    <View className="comparison-report">
      <View className="header">
        <Text className="title">对比报告</Text>
        <AtButton size="small" onClick={() => setIsWeekly(!isWeekly)}>
          {isWeekly ? "切换到月度对比" : "切换到周度对比"}
        </AtButton>
      </View>
      <BarChart
        data={data}
        width={300}
        height={200}
        xField="name"
        yField={[period1, period2]}
      />
      <Text className="summary">
        与{period2}相比，{period1}的超滤量提高了
        {isWeekly ? "7.1%" : "7.3%"}，治疗完成率提高了
        {isWeekly ? "5.6%" : "5.7%"}。 液体滞留时间方差减少了
        {isWeekly ? "28.6%" : "25%"}， 显示整体治疗效果和稳定性正在稳步提升。
      </Text>
    </View>
  );
};
