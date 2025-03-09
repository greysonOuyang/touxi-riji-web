import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";
import BPAnalysis from "@/components/bloodPresure/analysis";
import PdAnalysis from "@/components/pdAnalysis";
import WeightAnalysis from "@/components/weightAnalysis";
import UrineAnalysis from "@/components/urineAnalysis";
import WaterAnalysis from "@/components/waterAnalysis";

const StatisticsReportPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  // 血压视图模式默认为日模式
  const [bpViewMode, setBpViewMode] = useState<"day" | "week" | "month">("day");
  // 体重视图模式默认为周模式
  const [weightViewMode, setWeightViewMode] = useState<"day" | "week" | "month">("week");
  // 喝水视图模式默认为日模式
  const [waterViewMode, setWaterViewMode] = useState<"day" | "week" | "month">("day");

  useDidShow(() => {
    // 检查本地存储中是否有当前tab的设置
    const storedTab = Taro.getStorageSync('statistics_current_tab');
    if (storedTab !== '' && !isNaN(Number(storedTab))) {
      const tabIndex = Number(storedTab);
      if (tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
        // 使用后清除存储，避免下次自动跳转
        Taro.removeStorageSync('statistics_current_tab');
      }
    }
    
    // 检查是否有传入的tab参数（兼容旧的跳转方式）
    const params = Taro.getCurrentInstance().router?.params;
    if (params && params.tab) {
      const tabIndex = parseInt(params.tab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
      }
    }
    
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
            <View className="tab-content">
              <PdAnalysis />
            </View>
          </AtTabsPane>

          <AtTabsPane current={current} index={1}>
            <View className="tab-content">
              <UrineAnalysis />
            </View>
          </AtTabsPane>

          <AtTabsPane current={current} index={2}>
            <View className="tab-content">
              <WaterAnalysis initialViewMode={waterViewMode} />
            </View>
          </AtTabsPane>

          <AtTabsPane current={current} index={3}>
            <View className="tab-content">
              <WeightAnalysis initialViewMode={weightViewMode} />
            </View>
          </AtTabsPane>

          <AtTabsPane current={current} index={4}>
            <View className="tab-content">
              <BPAnalysis initialViewMode={bpViewMode} />
            </View>
          </AtTabsPane>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsReportPage;
