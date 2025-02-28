import React, { useRef, useEffect } from "react";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import { PdDataPoint } from "./usePdData";
import "./PdChart.scss";

// 引入图表库
const UCharts = require("@qiun/ucharts");

interface PdChartProps {
  viewMode: "day" | "week" | "month";
  pdData: PdDataPoint[];
  onSwipe?: (direction: "left" | "right") => void;
}

const PdChart: React.FC<PdChartProps> = ({
  viewMode,
  pdData,
  onSwipe,
}) => {
  const chartRef = useRef<any>(null);
  const canvasId = "pd-chart";
  let startX = 0;

  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    startX = e.touches[0].x;
  };

  // 处理触摸结束事件
  const handleTouchEnd = (e) => {
    if (!onSwipe) return;
    
    const endX = e.changedTouches[0].x;
    const diffX = endX - startX;
    
    // 判断滑动方向
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        onSwipe("right"); // 右滑
      } else {
        onSwipe("left"); // 左滑
      }
    }
  };

  // 初始化图表
  const initChart = (canvas, width, height) => {
    const ctx = canvas.getContext("2d");
    
    // 准备数据
    const categories: string[] = [];
    const ultrafiltrationData: number[] = [];
    const drainageData: number[] = [];
    
    // 根据视图模式处理数据
    if (viewMode === "day") {
      // 日视图：按时间排序
      const sortedData = [...pdData].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      sortedData.forEach(item => {
        categories.push(item.recordTime.substring(0, 5));
        ultrafiltrationData.push(item.ultrafiltration);
        drainageData.push(item.drainageVolume);
      });
    } else if (viewMode === "week") {
      // 周视图：按日期分组
      const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      const dayData = new Map<number, { ultrafiltration: number; drainage: number; count: number }>();
      
      // 初始化每天的数据
      for (let i = 0; i < 7; i++) {
        dayData.set(i, { ultrafiltration: 0, drainage: 0, count: 0 });
      }
      
      // 累加每天的数据
      pdData.forEach(item => {
        const date = parseISO(item.date);
        const dayIndex = (date.getDay() + 6) % 7; // 转换为周一为0
        
        const dayStats = dayData.get(dayIndex)!;
        dayStats.ultrafiltration += item.ultrafiltration;
        dayStats.drainage += item.drainageVolume;
        dayStats.count += 1;
      });
      
      // 计算每天的平均值
      for (let i = 0; i < 7; i++) {
        categories.push(weekDays[i]);
        const stats = dayData.get(i)!;
        
        if (stats.count > 0) {
          ultrafiltrationData.push(Math.round(stats.ultrafiltration / stats.count));
          drainageData.push(Math.round(stats.drainage / stats.count));
        } else {
          ultrafiltrationData.push(0);
          drainageData.push(0);
        }
      }
    } else {
      // 月视图：按日期分组
      const daysInMonth = new Date(
        new Date(pdData[0]?.date || new Date()).getFullYear(),
        new Date(pdData[0]?.date || new Date()).getMonth() + 1,
        0
      ).getDate();
      
      const dayData = new Map<number, { ultrafiltration: number; drainage: number; count: number }>();
      
      // 初始化每天的数据
      for (let i = 1; i <= daysInMonth; i++) {
        dayData.set(i, { ultrafiltration: 0, drainage: 0, count: 0 });
      }
      
      // 累加每天的数据
      pdData.forEach(item => {
        const date = parseISO(item.date);
        const day = date.getDate();
        
        const dayStats = dayData.get(day)!;
        dayStats.ultrafiltration += item.ultrafiltration;
        dayStats.drainage += item.drainageVolume;
        dayStats.count += 1;
      });
      
      // 计算每天的平均值
      for (let i = 1; i <= daysInMonth; i++) {
        categories.push(i.toString());
        const stats = dayData.get(i)!;
        
        if (stats.count > 0) {
          ultrafiltrationData.push(Math.round(stats.ultrafiltration / stats.count));
          drainageData.push(Math.round(stats.drainage / stats.count));
        } else {
          ultrafiltrationData.push(0);
          drainageData.push(0);
        }
      }
    }
    
    // 准备图表数据
    const series = [
      {
        name: "超滤量",
        data: ultrafiltrationData,
        color: "#92A3FD",
        type: "line",
        style: "curve",
        pointShape: "circle",
        pointColor: "#92A3FD",
        pointSelectedColor: "#92A3FD",
        lineWidth: 3,
      },
      {
        name: "引流量",
        data: drainageData,
        color: "#C58BF2",
        type: "line",
        style: "curve",
        pointShape: "circle",
        pointColor: "#C58BF2",
        pointSelectedColor: "#C58BF2",
        lineWidth: 3,
      },
    ];
    
    // 图表配置
    chartRef.current = new UCharts({
      type: "line",
      context: ctx,
      width,
      height,
      categories,
      series,
      animation: true,
      background: "#FFFFFF",
      padding: [15, 15, 15, 15],
      enableScroll: false,
      dataLabel: true,
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
        itemCount: 7,
        scrollShow: false,
        labelCount: 7,
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
            max: Math.max(...ultrafiltrationData, ...drainageData) * 1.2 || 1000,
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
          type: "curve",
          width: 2
        },
        tooltip: {
          showBox: true,
          showArrow: true,
          showCategory: false,
          borderWidth: 0,
          borderRadius: 4,
          borderColor: "#92A3FD",
          borderOpacity: 0.7,
          bgColor: "#FFFFFF",
          bgOpacity: 0.9,
          gridType: "dash",
          dashLength: 4,
          gridColor: "#CCCCCC",
          fontColor: "#333333",
          horizentalLine: false,
          xAxisLabel: true,
          yAxisLabel: false,
          labelBgColor: "#92A3FD",
          labelBgOpacity: 0.9,
          labelFontColor: "#FFFFFF"
        }
      }
    });
    
    return chartRef.current;
  };

  // 触摸移动事件处理
  const touchMove = (e) => {
    chartRef.current?.scrollMove(e);
  };

  // 触摸结束事件处理
  const touchEnd = (e) => {
    chartRef.current?.scrollEnd(e);
  };

  return (
    <Canvas
      type="2d"
      id={canvasId}
      canvasId={canvasId}
      className="pd-chart"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={touchMove}
      onTouchCancel={touchEnd}
      onInit={initChart}
    />
  );
};

export default PdChart; 