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
}

const BPChart: React.FC<BPChartProps> = ({
  viewMode,
  bpData,
  onSwipe,
}) => {
  const chartRef = useRef<any>(null);
  const canvasId = "bp-chart";
  const [scrolling, setScrolling] = useState(false);
  const startX = useRef(0);
  
  // 所有模式下都使用折线图
  const chartType = "line";
  
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
        type: "line",
        color: "#FF8A8A",
        pointShape: "circle",
        pointSize: 3,
        lineWidth: 2,
        format: (val) => { return val ? val.toFixed(0) : '-' }
      },
      {
        name: "舒张压",
        data: diastolicData,
        type: "line",
        color: "#92A3FD",
        pointShape: "circle",
        pointSize: 3,
        lineWidth: 2,
        format: (val) => { return val ? val.toFixed(0) : '-' }
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
        pointShape: "circle",
        pointSize: 3,
        lineWidth: 2,
        format: (val) => { return val ? val.toFixed(0) : '-' }
      });
    }
    
    // 图表配置
    chartRef.current = new UCharts({
      type: "line", // 固定使用折线图
      context: ctx,
      width,
      height,
      categories,
      series,
      animation: true,
      background: "#FFFFFF",
      padding: [15, 15, 15, 15], // 增加左侧内边距到50，确保第一个点不在Y轴上
      enableScroll: false, // 禁用滚动功能
      dataLabel: true, // 显示数据标签
      legend: {
        show: false
      },
      xAxis: {
        disableGrid: true,
        fontColor: "#999999",
        fontSize: 12,
        boundaryGap: "center", // 修改为center，确保点更好地对齐
        axisLine: true, // 显示坐标轴线
        calibration: true, // 显示刻度线
        marginLeft: 5, // 增加左侧边距到25
        itemCount: 7, // 固定显示7个数据点
        scrollShow: false, // 禁用滚动条
        labelCount: 7, // 设置标签数量为7
        formatter: (item, index) => {
          return categories[index]; // 使用完整的categories数组确保标签正确
        }
      },
      yAxis: {
        data: [
          {
            position: "left",
            title: "mmHg", // 单位放在Y轴顶部
            titleFontColor: "#999999",
            titleFontSize: 12,
            titleOffsetY: -5,
            titleOffsetX: -25,
            min: 40, // 最小值设为40，适合血压数据
            max: 200, // 最大值设为200，适合血压数据
            format: (val) => { return val.toFixed(0) }, // 格式化Y轴数值，去除小数点
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
          type: "straight", // 直线型
          width: 2,
          activeType: "hollow", // 点击后空心效果
          linearType: "none", // 不使用渐变
          activeLine: true, // 显示指示线
          activeLineWidth: 1, // 指示线宽度
          activeLineColor: "#999999", // 指示线颜色
          activeAreaOpacity: 0.1, // 指示区域透明度
          point: {
            size: 3, // 数据点大小
            activeSize: 5, // 激活时数据点大小
            activeColor: "#FFFFFF", // 激活时数据点颜色
            activeBorderWidth: 2, // 激活时数据点边框宽度
            borderWidth: 1, // 数据点边框宽度
            borderColor: "#FFFFFF", // 数据点边框颜色
            fillColor: "#FFFFFF", // 数据点填充颜色
            strokeWidth: 2, // 数据点描边宽度
          }
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
              labelOffsetX: 8,
              labelFontSize: 12,
              labelBgColor: "#FFF0F0",
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
              labelOffsetX: 8,
              labelFontSize: 12,
              labelBgColor: "#F0F8FF",
              labelBgOpacity: 0.7,
              labelFontColor: "#92A3FD"
            }
          ]
        }
      }
    });
    
    return chartRef.current;
  };
  
  // 触摸事件处理函数
  const handleTouchStart = (e) => {
    if (chartRef.current) {
      // 记录初始触摸位置
      startX.current = e.touches[0].clientX;
      // 使用标准的触摸事件方法
      chartRef.current.touchStart(e);
    }
  };
  
  const handleTouchMove = (e) => {
    if (chartRef.current) {
      // 使用标准的触摸事件方法
      chartRef.current.touchMove(e);
      // 设置正在滚动标志
      setScrolling(true);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (chartRef.current) {
      // 使用标准的触摸事件方法
      chartRef.current.touchEnd(e);
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
  }, [bpData, viewMode]);
  
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
  
  return (
    <View className="chart-container">
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        className="bp-chart"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </View>
  );
};

export default BPChart;