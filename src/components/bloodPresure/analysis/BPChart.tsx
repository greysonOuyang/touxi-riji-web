import React, { useEffect, useRef, useState } from "react";
import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { BpTrendData } from "@/api/bloodPressureApi";
import "./BPChart.scss";

interface BPChartProps {
  viewMode: "day" | "week" | "month";
  bpData: BpTrendData[];
  onSwipe?: (direction: "left" | "right") => void;
  chartType?: "line" | "column";
}

const BPChart: React.FC<BPChartProps> = ({ 
  viewMode, 
  bpData, 
  onSwipe,
  chartType = "line" 
}) => {
  const chartRef = useRef<any>(null);
  const canvasId = "bp-chart";
  const [scrolling, setScrolling] = useState(false);
  const startX = useRef(0);
  
  // 初始化图表 - 使用更可靠的方式获取Canvas
  const initChart = (canvas, width, height) => {
    const ctx = canvas.getContext("2d");
    const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;
    
    // 设置Canvas尺寸
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // 准备数据
    const categories = [];
    const systolicData = [];
    const diastolicData = [];
    const heartRateData = [];
    
    // 根据数据类型格式化
    bpData.forEach(item => {
      let label = "";
      
      try {
        const date = new Date(item.timestamp);
        
        if (viewMode === "day") {
          label = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        } else if (viewMode === "week") {
          const days = ["日", "一", "二", "三", "四", "五", "六"];
          label = `周${days[date.getDay()]}`;
        } else {
          label = `${date.getDate()}日`;
        }
      } catch (e) {
        console.error("日期格式化错误:", e);
        label = "-";
      }
      
      categories.push(label);
      
      if (item.hasMeasurement) {
        systolicData.push(item.systolic);
        diastolicData.push(item.diastolic);
        heartRateData.push(item.heartRate || null);
      } else {
        systolicData.push(null);
        diastolicData.push(null);
        heartRateData.push(null);
      }
    });
    
    // 准备图表系列
    const series = [
      {
        name: "收缩压",
        data: systolicData,
        color: "#FF8A8A",
        type: chartType === "column" ? "column" : undefined
      },
      {
        name: "舒张压",
        data: diastolicData,
        color: "#92A3FD",
        type: chartType === "column" ? "column" : undefined
      }
    ];
    
    // 如果有心率数据，添加心率系列
    if (heartRateData.some(val => val !== null)) {
      series.push({
        name: "心率",
        data: heartRateData,
        color: "#4CAF50",
        type: "line",
        disableLegend: true,
        addPoint: true,
        pointColor: "#4CAF50",
        pointShape: "circle",
        pointSize: 3
      });
    }
    
    // 图表配置
    chartRef.current = new UCharts({
      type: chartType,
      context: ctx,
      width,
      height,
      categories,
      series,
      animation: true,
      background: "#FFFFFF",
      padding: [15, 10, 15, 25], // 减少左右内边距
      enableScroll: true, // 启用图表内滚动
      dataLabel: true, // 显示数据标签
      legend: {
        show: false
      },
      xAxis: {
        disableGrid: true,
        fontColor: "#999999",
        fontSize: 12,
        scrollShow: true, // 显示滚动条
        scrollAlign: "left", // 滚动条位置
        scrollBackgroundColor: "#EEEEEE", // 滚动条背景色
        scrollColor: "#A0A0A0", // 滚动条颜色
        scrollHeight: 4, // 滚动条高度
        itemCount: 3, // 强制限制显示数量，确保需要滚动
        boundaryGap: "center" // 边界间隙设置
      },
      yAxis: {
        data: [
          {
            position: "left",
            title: "mmHg",
            titleFontSize: 12,
            min: chartType === "column" ? 0 : 40, // 柱状图时从0开始
            max: 200,
            fontColor: "#999999",
            fontSize: 12,
            format: (val) => val.toFixed(0),
            splitNumber: chartType === "column" ? 5 : 4 // 柱状图时增加垂直网格线数量
          }
        ],
        showTitle: true,
        gridType: "dash",
        dashLength: 4,
        gridColor: "#EEEEEE"
      },
      extra: {
        line: {
          type: "straight",
          width: 2.5,
          activeType: "hollow",
          linearType: "none",
          connectNulls: false,
          labelShow: true, // 显示数据标签
          labelFontSize: 10,
          labelColor: "#666666",
          labelBgColor: "rgba(255, 255, 255, 0.8)",
          labelBgOpacity: 0.8,
          labelPadding: 4
        },
        column: {
          width: viewMode === 'day' ? 20 : 30,
          barWidth: viewMode === 'day' ? 20 : 30,
          categoryGap: 10,
          barBorderRadius: [4, 4, 0, 0],
          activeBgColor: "#000000",
          activeBgOpacity: 0.1,
          labelShow: true, // 显示数据标签
          labelFontSize: 10,
          labelColor: "#666666",
          labelPosition: "top"
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
          horizentalLine: false,
          xAxisLabel: true,
          yAxisLabel: false,
          labelBgColor: "#000000",
          labelBgOpacity: 0.7,
          labelFontColor: "#FFFFFF"
        },
        markLine: {
          type: "dash",
          dashLength: 5,
          data: [
            {
              value: 140,
              lineColor: "#FF8A8A",
              showLabel: true,
              labelText: "高压140",
              labelPosition: "left",
              labelAlign: "top",
              labelOffsetX: chartType === "column" ? 5 : 8,
              labelFontSize: 12,
              labelBgColor: "#F0F8FF",
              labelBgOpacity: 0.7,
              labelFontColor: "#FF8A8A"
            },
            {
              value: 90,
              lineColor: "#92A3FD",
              showLabel: true,
              labelText: "低压90",
              labelPosition: "left",
              labelAlign: "bottom",
              labelOffsetX: chartType === "column" ? 5 : 8,
              labelFontSize: 12,
              labelBgColor: "#F0F8FF",
              labelBgOpacity: 0.7,
              labelFontColor: "#92A3FD"
            }
          ]
        }
      }
    });
    
    // 显式设置滚动选项并初始化滚动功能
    if (chartRef.current) {
      chartRef.current.opts.enableScroll = true;
      // 如果有提供滚动初始化方法，调用它
      if (typeof chartRef.current.initScroll === 'function') {
        chartRef.current.initScroll();
      }
    }
    
    return chartRef.current;
  };
  
  // 触摸事件处理函数
  const handleTouchStart = (e) => {
    if (chartRef.current) {
      // 记录初始触摸位置
      startX.current = e.touches[0].clientX;
      // 调用UCharts的正确方法
      chartRef.current.scrollStart(e);
      chartRef.current.touchLegend(e);
      chartRef.current.showToolTip(e);
    }
  };
  
  const handleTouchMove = (e) => {
    if (chartRef.current) {
      // 调用UCharts的正确方法
      chartRef.current.scrollMove(e);
      chartRef.current.showToolTip(e);
      // 设置正在滚动标志
      setScrolling(true);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (chartRef.current) {
      // 调用UCharts的正确方法
      chartRef.current.scrollEnd(e);
      chartRef.current.touchLegend(e);
    }
    
    // 如果不是滚动状态，检查是否需要触发翻页
    if (!scrolling && onSwipe) {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX.current;
      
      // 判断是否为快速滑动（翻页）
      if (Math.abs(diffX) > 100) {
        if (diffX > 0) {
          onSwipe("right");
        } else {
          onSwipe("left");
        }
      }
    }
    
    // 延迟重置滚动标志
    setTimeout(() => {
      setScrolling(false);
    }, 300);
  };
  
  // 图表渲染
  useEffect(() => {
    if (bpData && bpData.length > 0) {
      Taro.createSelectorQuery()
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            initChart(res[0].node, res[0].width, res[0].height);
          } else {
            console.error("获取Canvas节点失败");
          }
        });
    }
  }, [bpData, viewMode, chartType]);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (bpData && bpData.length > 0) {
        Taro.createSelectorQuery()
          .select(`#${canvasId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res[0]) {
              initChart(res[0].node, res[0].width, res[0].height);
            }
          });
      }
    };
    
    Taro.onWindowResize(handleResize);
    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, [bpData]);
  
  // 调试信息
  useEffect(() => {
    if (chartRef.current) {
      console.log("Chart initialized with scroll enabled:", chartRef.current.opts.enableScroll);
    }
  }, [chartRef.current]);
  
  return (
    <View className="chart-container">
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        className="bp-chart"
        disableScroll={false}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </View>
  );
};

export default BPChart;