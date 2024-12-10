import React from "react";
import { View } from "@tarojs/components";
import UCharts from "@qiun/ucharts";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

const UChartsDemo: React.FC = () => {
  let chart = null;

  const initChart = () => {
    const query = Taro.createSelectorQuery();
    query
      .select("#lineChart")
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");
          canvas.width = res[0].width * 2;
          canvas.height = res[0].height * 2;
          ctx.scale(2, 2);

          const chartData = {
            categories: [
              "周一",
              "周二",
              "周三",
              "周四",
              "周五",
              "周六",
              "周日",
            ],
            series: [
              {
                name: "超滤量",
                data: [300, 400, 350, 500, 490, 600, 550],
              },
            ],
          };

          chart = new UCharts({
            type: "line",
            context: ctx,
            width: res[0].width,
            height: res[0].height,
            categories: chartData.categories,
            series: chartData.series,
            animation: true,
            background: "#FFFFFF",
            padding: [15, 15, 0, 15],
            xAxis: {
              disableGrid: true,
            },
            yAxis: {
              gridType: "dash",
              dashLength: 2,
              title: "超滤量(ml)",
              min: 0,
            },
            legend: {},
            extra: {
              line: {
                type: "straight",
                width: 2,
              },
            },
          });
        }
      });
  };

  React.useEffect(() => {
    initChart();
  }, []);

  return (
    <View className="ucharts-demo">
      <Canvas
        type="2d"
        id="lineChart"
        canvas-id="lineChart"
        className="charts"
      />
    </View>
  );
};

export default UChartsDemo;
