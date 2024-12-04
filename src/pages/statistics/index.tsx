import React, { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import { View, Text, Picker, Canvas } from "@tarojs/components";
import Button from "@/components/common/ConfirmButton";
import { generateMockData } from "@/utils/mockData";
import F2 from "@antv/f2";
import "./index.scss";

const dataTypes = [
  { value: "pd", label: "腹透" },
  { value: "water", label: "喝水" },
  { value: "urine", label: "尿量" },
  { value: "bp", label: "血压" },
  { value: "weight", label: "体重" },
];

const timeRanges = [
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "year", label: "年" },
];

const StaticsPage: React.FC = () => {
  const [selectedDataType, setSelectedDataType] = useState("pd");
  const [timeRange, setTimeRange] = useState("week");
  const [chartData, setChartData] = useState<any>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const data = generateMockData(selectedDataType, timeRange);
    setChartData(data);
    renderChart(data);
  }, [selectedDataType, timeRange]);

  const handleDataTypeChange = (e: any) => {
    setSelectedDataType(dataTypes[e.detail.value].value);
  };

  const handleTimeRangeChange = (e: any) => {
    setTimeRange(timeRanges[e.detail.value].value);
  };

  const renderChart = (data: any) => {
    const query = Taro.createSelectorQuery();
    query
      .select("#myChart")
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext("2d");
        const pixelRatio = Taro.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * pixelRatio;
        canvas.height = res[0].height * pixelRatio;

        const chart = new F2.Chart({
          context: ctx,
          pixelRatio,
          width: res[0].width,
          height: res[0].height,
        });

        chart.source(data.chartData);
        chart.scale("value", {
          tickCount: 5,
          min: 0,
        });
        chart.axis("date", {
          label: (text, index, total) => {
            const textCfg: any = {};
            if (index === 0) {
              textCfg.textAlign = "left";
            } else if (index === total - 1) {
              textCfg.textAlign = "right";
            }
            return textCfg;
          },
        });
        chart.line().position("date*value");
        chart.point().position("date*value").style({
          stroke: "#fff",
          lineWidth: 1,
        });
        chart.render();

        // Store the chart instance for later use if needed
        chartRef.current = chart;
      });
  };

  const renderStats = () => {
    if (!chartData) return null;

    return (
      <View className="stats-container">
        <Text className="stats-title">关键统计</Text>
        <Text className="stats-item">平均值: {chartData.average}</Text>
        <Text className="stats-item">最高值: {chartData.max}</Text>
        <Text className="stats-item">最低值: {chartData.min}</Text>
      </View>
    );
  };

  const handleRecordData = () => {
    // 根据选中的数据类型跳转到相应的记录页面
    console.log("Record data for:", selectedDataType);
  };

  return (
    <View className="statics-page">
      <View className="data-type-selector">
        <Picker
          mode="selector"
          range={dataTypes.map((type) => type.label)}
          onChange={handleDataTypeChange}
        >
          <View className="picker">
            数据类型：
            {dataTypes.find((type) => type.value === selectedDataType)?.label}
          </View>
        </Picker>
      </View>
      <View className="time-range-selector">
        <Picker
          mode="selector"
          range={timeRanges.map((range) => range.label)}
          onChange={handleTimeRangeChange}
        >
          <View className="picker">
            时间范围：
            {timeRanges.find((range) => range.value === timeRange)?.label}
          </View>
        </Picker>
      </View>
      <View className="chart-container">
        <Canvas type="2d" id="myChart" className="chart-canvas" />
      </View>
      {renderStats()}
      <Button text="记录数据" onClick={handleRecordData} />
    </View>
  );
};

export default StaticsPage;
