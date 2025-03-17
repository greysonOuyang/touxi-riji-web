import React, { useRef, useEffect } from 'react';
import UCharts from "@qiun/ucharts";
import { BaseChartConfig } from './types';
import Taro from '@tarojs/taro';
import { View, Canvas } from '@tarojs/components';

const baseConfig: Partial<BaseChartConfig> = {
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

interface ChartProps {
  categories: string[];
  series: { name: string; data: number[]; color?: string; type?: string; pointShape?: string; pointSize?: number; lineWidth?: number; format?: (val: number) => string }[];
  width: number;
  height: number;
  config?: Partial<BaseChartConfig>;
}

const Chart: React.FC<ChartProps> = ({ categories, series, width, height, config = {} }) => {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 15)}`).current;

  useEffect(() => {
    if (width > 0 && height > 0) {
      const ctx = Taro.createCanvasContext(chartId);
      const chartConfig: BaseChartConfig = {
        ...baseConfig,
        ...config,
        categories,
        series,
        width,
        height,
        context: ctx,
      } as BaseChartConfig;
      try {
        console.log("Initializing uCharts with config:", chartConfig);
        new UCharts(chartConfig);
        console.log("uCharts initialized successfully");
      } catch (error) {
        console.error("uCharts initialization failed:", error);
      }
    }
  }, [categories, series, width, height, config]);

  return (
    <View>
      <Canvas canvasId={chartId} style={{ width: `${width}px`, height: `${height}px` }} />
    </View>
  );
};

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

export const ColumnChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    series: props.series.map(item => ({ ...item, type: 'column' }))
  };
  return <Chart {...config} />;
};

export const PieChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    series: props.series.map(item => ({ ...item, type: 'pie' }))
  };
  return <Chart {...config} />;
};