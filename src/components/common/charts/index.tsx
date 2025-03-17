import React, { useRef, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Canvas } from '@tarojs/components';
import { BaseChartConfig } from './types';

// 注意：uCharts 已全局注册到 app.js 中，无需在此导入
// 请在 app.js 中添加以下代码：
// import UCharts from '@qiun/ucharts';
// global.UCharts = UCharts;

const baseConfig: Partial<BaseChartConfig> = {
  animation: true,
  background: '#FFFFFF',
  padding: [15, 15, 15, 15],
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
    itemHeight: 14,
  },
};

// 根据图表类型动态生成配置
const getConfigByType = (type: string, config: Partial<BaseChartConfig>): Partial<BaseChartConfig> => {
  const commonConfig = { ...baseConfig, ...config };

  if (type === 'pie') {
    return commonConfig; // 饼图不需要 xAxis、yAxis 和滚动配置
  }

  return {
    ...commonConfig,
    enableScroll: true,
    xAxis: {
      labelCount: 5,
      scrollShow: true,
      itemCount: 5,
      scrollAlign: 'right',
      calibration: true,
      marginLeft: 5,
      formatter: (item: string) => item,
    },
    yAxis: {
      data: [{
        min: 0,
        splitNumber: 5,
        showTitle: true,
        format: (val: number) => val.toString(),
      }],
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
          strokeWidth: 2,
        },
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
        labelFontColor: '#666666',
      },
    },
  };
};

interface ChartProps {
  categories: string[];
  series: { name: string; data: number[]; color?: string; type?: string; pointShape?: string; pointSize?: number; lineWidth?: number; format?: (val: number) => string }[];
  width: number;
  height: number;
  config?: Partial<BaseChartConfig>;
  type: 'line' | 'column' | 'pie'; // 新增 type 参数以区分图表类型
}

const Chart: React.FC<ChartProps> = ({ categories, series, width, height, config = {}, type }) => {
  const chartId = useRef(`chart-${Math.random().toString(36).substring(2, 15)}`).current;

  useEffect(() => {
    if (width > 0 && height > 0) {
      const ctx = Taro.createCanvasContext(chartId);
      const chartConfig: BaseChartConfig = {
        ...getConfigByType(type, config),
        categories,
        series,
        width,
        height,
        context: ctx,
      } as BaseChartConfig;

      try {
        console.log(`Initializing uCharts (${type}) with config:`, chartConfig);
        new global.UCharts(chartConfig); // 使用全局注册的 uCharts
        console.log(`uCharts (${type}) initialized successfully`);
      } catch (error) {
        console.error(`uCharts (${type}) initialization failed:`, error);
      }
    }
  }, [categories, series, width, height, config, type]);

  return (
    <View>
      <Canvas canvasId={chartId} style={{ width: `${width}px`, height: `${height}px` }} />
    </View>
  );
};

export const LineChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    type: 'line' as const,
    series: props.series.map(item => ({
      ...item,
      type: 'line',
      pointShape: 'circle',
      pointSize: 3,
      lineWidth: 2,
    })),
  };
  return <Chart {...config} />;
};

export const ColumnChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    type: 'column' as const,
    series: props.series.map(item => ({ ...item, type: 'column' })),
  };
  return <Chart {...config} />;
};

export const PieChart: React.FC<ChartProps> = (props) => {
  const config = {
    ...props,
    type: 'pie' as const,
    series: props.series.map(item => ({ ...item, type: 'pie' })),
  };
  return <Chart {...config} />;
};