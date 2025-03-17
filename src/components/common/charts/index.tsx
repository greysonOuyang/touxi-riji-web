import React, { useRef, useEffect, useState } from 'react';
import UCharts from "@qiun/ucharts";
import { BaseChartConfig } from './types';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';

// 基础图表配置
const baseConfig: BaseChartConfig = {
  animation: true,
  background: "#FFFFFF",
  padding: [15, 15, 15, 15],
  enableScroll: true,
  dataLabel: true,
  legend: {
    show: true,
    position: 'top',
    float: 'center',
    padding: 5,
    margin: 5,
    backgroundColor: '#FFFFFF',
    fontSize: 12,
    lineHeight: 11,
    itemGap: 10,
    itemWidth: 25,
    itemHeight: 14
  },
  xAxis: {
    labelCount: 5,
    scrollShow: true,
    itemCount: 5,
    scrollAlign: 'right',
    calibration: true,
    marginLeft: 5,
    formatter: (item: string) => item
  },
  yAxis: {
    data: [{
      min: 0,
      splitNumber: 5,
      showTitle: true,
      format: (val: number) => val.toString()
    }]
  },
  extra: {
    line: {
      type: 'straight',
      width: 2,
      activeType: 'hollow',
      linearType: 'none',
      activeLine: true,
      activeLineWidth: 1,
      activeLineColor: '#999999',
      activeAreaOpacity: 0.1,
      point: {
        size: 3,
        activeSize: 5,
        activeColor: '#FFFFFF',
        activeBorderWidth: 2,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        fillColor: '#FFFFFF',
        strokeWidth: 2
      }
    },
    tooltip: {
      showBox: true,
      showArrow: true,
      showCategory: true,
      borderWidth: 0,
      borderRadius: 4,
      borderColor: '#000000',
      borderOpacity: 0.7,
      bgColor: '#000000',
      bgOpacity: 0.7,
      gridType: 'dash',
      dashLength: 4,
      gridColor: '#CCCCCC',
      fontColor: '#FFFFFF',
      fontSize: 12,
      lineHeight: 20,
      padding: 10,
      horizentalLine: false,
      xAxisLabel: true,
      yAxisLabel: false,
      labelBgColor: '#FFFFFF',
      labelBgOpacity: 0.7,
      labelFontColor: '#666666'
    }
  }
};

// 图表组件接口
interface ChartProps {
  categories: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
    type?: string;
    pointShape?: string;
    pointSize?: number;
    lineWidth?: number;
    format?: (val: number) => string;
  }[];
  width: number;
  height: number;
  config?: Partial<BaseChartConfig>;
}

// 基础图表组件
const Chart: React.FC<ChartProps> = ({
  categories,
  series,
  width,
  height,
  config = {}
}) => {
  const chartId = useRef(Math.random().toString(36).substring(2, 15)).current; // 生成随机 canvasId
  const chartRef = useRef< Taro.CanvasContext | null>(null); // 创建 ref 用于存储 canvas context
  const [chartContext, setChartContext] = useState< Taro.CanvasContext | null>(null); // 使用 useState 存储 context

  useEffect(() => {
    const ctx = Taro.createCanvasContext(chartId); // 使用 Taro.createCanvasContext 获取 context
    chartRef.current = ctx; // 将 context 存储到 ref
    setChartContext(ctx); // 更新 state，触发重新渲染
  }, [chartId]); // 依赖 chartId，确保每次 chartId 变化都重新获取 context

  useEffect(() => {
    if (chartContext) { // 确保 context 获取成功后才初始化 uCharts
      const chartConfig: BaseChartConfig = {
        ...baseConfig,
        ...config,
        categories,
        series,
        width,
        height,
        context: chartContext, // 使用 context 属性传递 context
        // canvasId: chartId, // 移除 canvasId 属性
      };
      new UCharts(chartConfig); // 初始化 uCharts
    }
  }, [chartContext, categories, series, width, height, config]); // 依赖 context 和其他配置项

  return (
    <View ref={chartRef}> {/* 使用 View 包裹 canvas，并设置 ref */}
      <canvas canvasId={chartId} style={{ width: `${width}px`, height: `${height}px` }} />
    </View>
  );
};

// 折线图组件
export const LineChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    series: props.series.map(item => ({
      ...item,
      type: 'line',
      pointShape: 'circle',
      pointSize: 3,
      lineWidth: 2
    }))
  };
  return <Chart {...config} />;
};

// 柱状图组件
export const ColumnChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    series: props.series.map(item => ({
      ...item,
      type: 'column'
    }))
  };
  return <Chart {...config} />;
};

// 饼图组件
export const PieChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    series: props.series.map(item => ({
      ...item,
      type: 'pie'
    }))
  };
  return <Chart {...config} />;
}; 