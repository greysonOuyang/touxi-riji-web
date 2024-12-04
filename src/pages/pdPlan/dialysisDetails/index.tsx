import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import { DialysisData } from "@/components/pdPlan/DialysisData";
import { HistoricalData } from "@/components/pdPlan/HistoricalData";
import { TrendChart } from "@/components/pdPlan/TrendChart";
import { DataReport } from "@/components/pdPlan/DataReport";
import { ComparisonReport } from "@/components/pdPlan/ComparisonReport";
import "./index.scss";

const DialysisDetailsPage: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const tabList = [
    { title: "数据" },
    { title: "历史" },
    { title: "趋势" },
    { title: "报告" },
    { title: "对比" },
  ];

  const handleClick = (value) => {
    setCurrent(value);
  };

  return (
    <View className="dialysis-details-page">
      <View className="header">
        <Text className="title">腹透详情</Text>
        <View className="export-button">导出</View>
      </View>
      <AtTabs
        current={current}
        tabList={tabList}
        onClick={handleClick}
        swipeable={false}
      >
        <AtTabsPane current={current} index={0}>
          <DialysisData />
        </AtTabsPane>
        <AtTabsPane current={current} index={1}>
          <HistoricalData />
        </AtTabsPane>
        <AtTabsPane current={current} index={2}>
          <TrendChart />
        </AtTabsPane>
        <AtTabsPane current={current} index={3}>
          <DataReport />
        </AtTabsPane>
        <AtTabsPane current={current} index={4}>
          <ComparisonReport />
        </AtTabsPane>
      </AtTabs>
    </View>
  );
};

export default DialysisDetailsPage;
