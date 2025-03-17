import React, { useState } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";
import PdAnalysis from "@/components/pdAnalysis";

interface TabContentProps {
  current: number;
  index: number;
  children: React.ReactNode;
}

const CommonTabContent: React.FC<TabContentProps> = ({ current, index, children }) => {
  if (current !== index) return null;
  try {
    return <View className="tab-content">{children}</View>;
  } catch (error) {
    console.error(`Error in Tab ${index}:`, error);
    return (
      <View className="tab-content">
        <Text>加载失败，请稍后重试</Text>
      </View>
    );
  }
};

const StatisticsReportPage: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useDidShow(() => {
    const storedTab = Taro.getStorageSync('statistics_current_tab');
    console.log("Stored tab:", storedTab);
    if (storedTab !== '' && !isNaN(Number(storedTab))) {
      const tabIndex = Number(storedTab);
      if (tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
        Taro.removeStorageSync('statistics_current_tab');
      }
    }

    const params = Taro.getCurrentInstance().router?.params;
    console.log("Router params:", params);
    if (params && params.tab) {
      const tabIndex = parseInt(params.tab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
      }
    }

    Taro.setNavigationBarTitle({ title: "统计报告" });
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

  return (
    <View className="statistics-report-page">
      <View className="fixed-tabs">
        <View className="custom-tabs">
          <View className="at-tabs__header">
            {tabList.map((tab, index) => (
              <View
                key={index}
                className={`at-tabs__item ${current === index ? 'at-tabs__item--active' : ''}`}
                onClick={() => handleClick(index)}
              >
                <Text>{tab.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView scrollY className="content-scroll">
        <View className="content-wrapper">
          <CommonTabContent current={current} index={0}>
            <PdAnalysis />
          </CommonTabContent>
          <CommonTabContent current={current} index={1}>
            <Text>Tab Content 1: 尿量</Text>
          </CommonTabContent>
          <CommonTabContent current={current} index={2}>
            <Text>Tab Content 2: 喝水</Text>
          </CommonTabContent>
          <CommonTabContent current={current} index={3}>
            <Text>Tab Content 3: 体重</Text>
          </CommonTabContent>
          <CommonTabContent current={current} index={4}>
            <Text>Tab Content 4: 血压</Text>
          </CommonTabContent>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsReportPage;