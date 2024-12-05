import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtIcon } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import { DialysisData } from "@/components/pdPlan/DialysisData";
import "./index.scss";

const DialysisDetailsPage: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useDidShow(() => {
    Taro.setNavigationBarTitle({
      title: "腹透详情",
    });
  });

  const tabList = [
    { title: "数据" },
    { title: "历史" },
    { title: "趋势" },
    { title: "报告" },
    { title: "对比" },
  ];

  const historyData = [
    { date: "2023-06-10", value: 550 },
    { date: "2023-06-09", value: 520 },
    { date: "2023-06-08", value: 580 },
  ];

  const handleClick = (value: number) => {
    setCurrent(value);
  };

  return (
    <View className="dialysis-details-page">
      <AtTabs
        current={current}
        tabList={tabList}
        onClick={handleClick}
        className="custom-tabs"
      >
        <AtTabsPane current={current} index={0}>
          <View className="tab-content">
            <DialysisData />
          </View>
        </AtTabsPane>

        <AtTabsPane current={current} index={1}>
          <View className="tab-content">
            <Text className="section-title">历史数据</Text>
            <View className="history-list">
              {historyData.map((item, index) => (
                <View key={index} className="history-item">
                  <Text className="date">{item.date}</Text>
                  <Text className="value">{item.value} ml</Text>
                </View>
              ))}
            </View>
          </View>
        </AtTabsPane>

        <AtTabsPane current={current} index={2}>
          <View className="tab-content">
            <Text className="section-title">趋势分析</Text>
            <Text>这里是趋势分析的内容</Text>
          </View>
        </AtTabsPane>

        <AtTabsPane current={current} index={3}>
          <View className="tab-content">
            <Text className="section-title">数据报告</Text>
            <Text>这里是数据报告的内容</Text>
          </View>
        </AtTabsPane>

        <AtTabsPane current={current} index={4}>
          <View className="tab-content">
            <Text className="section-title">对比分析</Text>
            <Text>这里是对比分析的内容</Text>
          </View>
        </AtTabsPane>
      </AtTabs>
    </View>
  );
};

export default DialysisDetailsPage;
