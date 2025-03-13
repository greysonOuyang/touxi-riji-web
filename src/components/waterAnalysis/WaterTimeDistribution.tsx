import React, { useEffect, useRef } from "react";
import { View, Text, Canvas } from "@tarojs/components";
import { WaterIntakeTimeDistributionVO } from "@/api/waterIntakeApi";
import Taro from "@tarojs/taro";
import "./WaterTimeDistribution.scss";

// 引入 uCharts
import uCharts from "@qiun/ucharts";

interface WaterTimeDistributionProps {
  distribution?: WaterIntakeTimeDistributionVO;
  isLoading?: boolean;
}

const WaterTimeDistribution: React.FC<WaterTimeDistributionProps> = ({
  distribution,
  isLoading = false
}) => {
  const hourlyChartRef = useRef(null);
  const canvasId = "hourly-distribution-chart"; // 为 Canvas 组件添加一个 id

  // 初始化小时分布图表 (使用 uCharts)
  const initHourlyChart = (canvas, width, height, distributionData) => {
    if (!canvas) {
      console.error("Canvas 节点不存在");
      return null;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("无法获取 Canvas 上下文");
      return null;
    }

    const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;

    // 设置 Canvas 尺寸
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    if (!distributionData || distributionData.length === 0) {
      // 没有数据时的处理
      return null;
    }

    // 准备 uCharts 数据
    const categories = distributionData.map(item => `${item.hour}时`);
    const seriesData = distributionData.map(item => ({
      name: '饮水量',
      data: [item.amount] // uCharts 折线图数据格式需要调整
    }));

    const series = [
      {
        name: '饮水量',
        data: distributionData.map(item => item.amount),
        color: "#2563EB",
        type: "line",
        style: "stroke",
        pointShape: "circle",
        pointColor: "#2563EB",
        pointSelectedColor: "#2563EB",
      }
    ];


    // uCharts 配置
    hourlyChartRef.current = new uCharts({
      type: "line",
      context: ctx,
      width,
      height,
      categories: categories,
      series: series,
      animation: true,
      background: "#FFFFFF",
      padding: [15, 15, 15, 15],
      enableScroll: false,
      legend: {
        show: false
      },
      xAxis: {
        disableGrid: true,
        fontColor: "#999999",
        fontSize: 12,
        boundaryGap: "center",
        axisLine: true,
        calibration: true,
        marginLeft: 5,
        itemCount: Math.min(7, categories.length),
        scrollShow: false,
        labelCount: Math.min(7, categories.length),
        formatter: (item, index) => {
          return categories[index];
        }
      },
      yAxis: {
        data: [
          {
            position: "left",
            title: "ml",
            titleFontColor: "#999999",
            titleFontSize: 12,
            titleOffsetY: -5,
            titleOffsetX: -25,
            min: 0,
            format: (val) => { return val.toFixed(0) },
            fontColor: "#999999",
            fontSize: 12,
            lineColor: "#EEEEEE",
            dashLength: 4,
            gridType: "dash",
            splitNumber: 5,
            showTitle: true,
            tofix: 0
          }
        ]
      },
      extra: {
        line: {
          width: 3,
          // curve: true, // 可以尝试开启曲线
          // dotShape: 'solid', // 可以尝试实心点
        },
        tooltip: {
          showBox: true,
          showArrow: true,
          showCategory: true,
          borderWidth: 0,
          borderRadius: 4,
          borderColor: "#000000",
          borderOpacity: 0.7,
          bgColor: "#000000",
          bgOpacity: 0.7,
          gridType: "dash",
          dashLength: 4,
          gridColor: "#CCCCCC",
          fontColor: "#FFFFFF",
          fontSize: 12,
          lineHeight: 20,
          padding: 10,
          xAxisLabel: true,
          yAxisLabel: false,
          labelBgColor: "#000000",
          labelBgOpacity: 0.7,
          labelFontColor: "#FFFFFF",
          formatter: function (item, category) { // 自定义 tooltip 内容
            return `${category} ${item.name}: ${item.data}ml (${distributionData[item.index].percentage.toFixed(1)}%)`;
          }
        }
      }
    });

    return hourlyChartRef.current;
  };


  // 初始化图表
  useEffect(() => {
    if (distribution && distribution.hourlyDistribution && distribution.hourlyChartRef) {
      const query = Taro.createSelectorQuery();

      if (Taro.canIUse("SelectorQuery.selectViewport")) {
        query.selectViewport().scrollOffset();
      }

      query
        .select(`#${canvasId}`) // 使用 canvasId 选择器
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            initHourlyChart(res[0].node, res[0].width, res[0].height, distribution.hourlyDistribution);
          } else {
            console.error("获取 Canvas 节点失败");
          }
        });
    }
  }, [distribution]);

  // 处理屏幕旋转等导致的尺寸变化
  useEffect(() => {
    const handleResize = () => {
      if (hourlyChartRef.current) {
        const query = Taro.createSelectorQuery();
        query
          .select(`#${canvasId}`) // 使用 canvasId 选择器
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0]) {
              initHourlyChart(res[0].node, res[0].width, res[0].height, distribution?.hourlyDistribution || []);
            }
          });
      }
    };

    Taro.onWindowResize(handleResize);

    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, []);


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

        <Canvas
          type="2d"
          id={canvasId} // 添加 id 属性
          className="chart-container"
          ref={hourlyChartRef}
        />

        <View className="average-interval">
          <Text className="label">平均饮水间隔:</Text>
          <Text className="value">{distribution.averageInterval || 0} 分钟</Text>
        </View>
      </View>
    </View>
  );
};

export default WaterTimeDistribution; 