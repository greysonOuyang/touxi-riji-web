import React from "react";
import { View, Text } from "@tarojs/components";
import { AtProgress } from "taro-ui";
import "./index.scss";

const DataReport: React.FC = () => {
  return (
    <View className="data-report">
      <Text className="title">本周数据报告</Text>
      <View className="report-item">
        <View className="item-header">
          <Text>平均每日超滤量</Text>
          <Text>450ml</Text>
        </View>
        <AtProgress percent={75} isHidePercent />
      </View>
      <View className="report-item">
        <View className="item-header">
          <Text>治疗完成率</Text>
          <Text>95%</Text>
        </View>
        <AtProgress percent={95} isHidePercent />
      </View>
      <View className="report-item">
        <View className="item-header">
          <Text>液体滞留时间方差</Text>
          <Text>0.5小时</Text>
        </View>
        <AtProgress percent={50} isHidePercent />
      </View>
      <Text className="summary">
        本周表现良好，超滤量达标。液体滞留时间的方差较小，表明治疗时间安排较为稳定。建议保持规律的治疗时间，有助于提高治疗效果。
      </Text>
    </View>
  );
};

export default DataReport;
