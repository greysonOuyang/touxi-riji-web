import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";
import BPAnalysis from "@/components/bloodPresure/analysis";

const StatisticsReportPage: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useDidShow(() => {
    Taro.setNavigationBarTitle({
      title: "统计报告",
    });
  });

  const tabList = [
    { title: "腹透" },
    { title: "尿量" },
    { title: "喝水" },
    { title: "体重" },
    { title: "血压" },
  ];

  const handleClick = (value: number) => {
    setCurrent(value);
  };

  return (
    <View className="statistics-report-page">
      <ScrollView scrollY className="content-scroll">
        <View className="scrollable-area">
          <View className="content-wrapper">
            <AtTabsPane current={current} index={0}>
              <View className="tab-content">
                {/* <TrendAnalysis /> */}
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={1}>
              <View className="tab-content">
                <Text className="section-title">尿量统计</Text>
                <Text>这里是尿量统计的内容</Text>
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={2}>
              <View className="tab-content">
                <Text className="section-title">喝水统计</Text>
                <Text>这里是喝水统计的内容</Text>
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={3}>
              <View className="tab-content">
                <Text className="section-title">体重统计</Text>
                <Text>这里是体重统计的内容</Text>
              </View>
            </AtTabsPane>

            <AtTabsPane current={current} index={4}>
              <View className="tab-content">
                <BPAnalysis />
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

export default StatisticsReportPage;
