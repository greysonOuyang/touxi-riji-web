import React, { useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import { WaterIntakeTimeDistributionVO } from "@/api/waterIntakeApi";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import Taro from "@tarojs/taro";
import "./WaterTimeDistribution.scss";

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
]);

interface WaterTimeDistributionProps {
  distribution?: WaterIntakeTimeDistributionVO;
  isLoading?: boolean;
}

const WaterTimeDistribution: React.FC<WaterTimeDistributionProps> = ({
  distribution,
  isLoading = false
}) => {
  const hourlyChartRef = useRef(null);

  // 初始化小时分布图表
  useEffect(() => {
    if (!distribution || !distribution.hourlyDistribution || !hourlyChartRef.current) {
      return;
    }

    const chartDom = hourlyChartRef.current;
    const myChart = echarts.init(chartDom);

    const data = distribution.hourlyDistribution.map(item => ({
      hour: `${item.hour}时`,
      amount: item.amount,
      percentage: item.percentage
    }));

    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const param = params[0];
          return `${param.name}: ${param.value}ml (${param.data.percentage.toFixed(1)}%)`;
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.hour),
        axisLabel: {
          interval: 'auto'
        }
      },
      yAxis: {
        type: 'value',
        name: '饮水量(ml)'
      },
      series: [
        {
          name: '饮水量',
          type: 'line',
          data: data.map(item => ({
            value: item.amount,
            percentage: item.percentage
          })),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#2563EB',
            width: 3
          },
          itemStyle: {
            color: '#2563EB',
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(37, 99, 235, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(37, 99, 235, 0.1)'
                }
              ]
            }
          }
        }
      ]
    };

    myChart.setOption(option);

    // 处理屏幕旋转或大小变化
    const handleResize = () => {
      myChart.resize();
    };

    Taro.eventCenter.on('windowResize', handleResize);

    return () => {
      myChart.dispose();
      Taro.eventCenter.off('windowResize', handleResize);
    };
  }, [distribution]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="water-time-distribution">
        <View className="loading-state">
          <Text>加载时间分布数据中...</Text>
        </View>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!distribution) {
    return (
      <View className="water-time-distribution">
        <View className="empty-state">
          <Text>暂无喝水时间分布数据</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="water-time-distribution">
      <View className="distribution-header">
        <Text className="title">饮水时间分布</Text>
        <Text className="subtitle">了解您的饮水习惯</Text>
      </View>

      {/* 小时分布 */}
      <View className="distribution-card">
        <View className="card-header">
          <Text className="card-title">小时分布</Text>
          <Text className="card-subtitle">24小时饮水量变化</Text>
        </View>

        <View className="chart-container" ref={hourlyChartRef}></View>

        <View className="average-interval">
          <Text className="label">平均饮水间隔:</Text>
          <Text className="value">{distribution.averageInterval || 0} 分钟</Text>
        </View>
      </View>
    </View>
  );
};

export default WaterTimeDistribution; 