import React, { useEffect, useState } from "react";
import { View } from "@tarojs/components";
import { AtButton } from "taro-ui";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import Taro from "@tarojs/taro";
import "./index.scss";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
]);

const ComparisonReport: React.FC = () => {
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

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query
      .select("#comparison-chart")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const chart = echarts.init(canvas, null, {
          width: res[0].width,
          height: res[0].height,
        });

        const data = isWeekly ? weeklyData : monthlyData;
        const period1 = isWeekly ? "本周" : "本月";
        const period2 = isWeekly ? "上周" : "上月";

        const option = {
          title: {
            text: "对比报告",
          },
          legend: {},
          xAxis: {
            type: "category",
            data: data.map((item) => item.name),
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              name: period1,
              type: "bar",
              data: data.map((item) => item[period1]),
            },
            {
              name: period2,
              type: "bar",
              data: data.map((item) => item[period2]),
            },
          ],
        };

        chart.setOption(option);
      });
  }, [isWeekly]);

  return (
    <View className="comparison-report">
      <AtButton size="small" onClick={() => setIsWeekly(!isWeekly)}>
        {isWeekly ? "切换到月度对比" : "切换到周度对比"}
      </AtButton>
      <canvas
        id="comparison-chart"
        type="2d"
        style={{ width: "100%", height: "300px" }}
      />
      <View className="summary">
        与{isWeekly ? "上周" : "上月"}相比，{isWeekly ? "本周" : "本月"}
        的超滤量提高了
        {isWeekly ? "7.1%" : "7.3%"}，治疗完成率提高了
        {isWeekly ? "5.6%" : "5.7%"}。 液体滞留时间方差减少了
        {isWeekly ? "28.6%" : "25%"}， 显示整体治疗效果和稳定性正在稳步提升。
      </View>
    </View>
  );
};

export default ComparisonReport;
