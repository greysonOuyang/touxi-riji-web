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
    
    // 设置导航栏背景色，确保与页面背景一致
    Taro.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#f5f7fa',
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

  // 渲染其他统计模块的内容
  const renderOtherTabContent = (title: string) => {
    return (
      <View className="tab-content">
        <View className="statistics-placeholder-card">
          <Text className="section-title">{title}统计</Text>
          <View className="placeholder-content">
            <Text className="placeholder-text">这里是{title}统计的内容</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="statistics-report-page">
      <View className="fixed-tabs">
        <AtTabs
          current={current}
          tabList={tabList}
          onClick={handleClick}
          className="custom-tabs"
        />
      </View>
      
      <ScrollView scrollY className="content-scroll">
        <View className="content-wrapper">
          <AtTabsPane current={current} index={0}>
            {renderOtherTabContent("腹透")}
          </AtTabsPane>

          <AtTabsPane current={current} index={1}>
            {renderOtherTabContent("尿量")}
          </AtTabsPane>

          <AtTabsPane current={current} index={2}>
            {renderOtherTabContent("喝水")}
          </AtTabsPane>

          <AtTabsPane current={current} index={3}>
            {renderOtherTabContent("体重")}
          </AtTabsPane>

          <AtTabsPane current={current} index={4}>
            <View className="tab-content">
              <BPAnalysis />
            </View>
          </AtTabsPane>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsReportPage;
