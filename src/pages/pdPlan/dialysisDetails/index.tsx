import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import { DialysisData } from "@/components/pdPlan/DialysisData";
import HistoricalData from "@/components/pdPlan/HistoricalData";
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
    { title: "趋势" },
    { title: "报告" },
    { title: "对比" },
  ];

  const handleClick = (value: number) => {
    setCurrent(value);
  };

  return (
    <View className="dialysis-details-page">
      <ScrollView scrollY className="content-scroll">
        <View className="scrollable-area">
          <View className="content-wrapper">
            <AtTabsPane current={current} index={0}>
              <View className="tab-content">
                <DialysisData />
                <HistoricalData />
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={1}>
              <View className="tab-content">
                <Text className="section-title">趋势分析</Text>
                <Text>这里是趋势分析的内容</Text>
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={2}>
              <View className="tab-content">
                <Text className="section-title">数据报告</Text>
                <Text>这里是数据报告的内容</Text>
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={3}>
              <View className="tab-content">
                <Text className="section-title">对比分析</Text>
                <Text>这里是对比分析的内容</Text>
              </View>
            </AtTabsPane>
          </View>
        </View>
      </ScrollView>

      <View className="fixed-tabs">
        <AtTabs
          current={current}
          tabList={tabList}
          onClick={handleClick}
          className="custom-tabs"
        />
      </View>
    </View>
  );
};

export default DialysisDetailsPage;
