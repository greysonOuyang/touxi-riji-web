import React, { useEffect, useRef, useState } from 'react';
import { Canvas, View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { format, isValid, parse } from "date-fns";
import { zhCN } from 'date-fns/locale';

// 直接在文件中定义类型
type ViewMode = "day" | "week" | "month";
type ChartType = "line" | "column";

interface BPDataPoint {
  systolic: number;
  diastolic: number;
  heartRate?: number;  // 心率是可选的
  timestamp: string;
}

interface BPChartProps {
  viewMode: ViewMode;
  bpData: BPDataPoint[];
  onSwipe?: (direction: 'left' | 'right') => void;
  chartType?: ChartType;
}

const BPChart: React.FC<BPChartProps> = ({ 
  viewMode, 
  bpData, 
  onSwipe,
  chartType = viewMode === 'day' ? 'column' : 'line'
}) => {
  const chartRef = useRef<any>(null);
  const touchStartXRef = useRef<number | null>(null);
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderChart();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bpData, viewMode, chartType]);

  // 处理触摸开始事件
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  // 处理触摸结束事件
  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || !onSwipe) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartXRef.current;
    
    // 如果滑动距离超过50px，则触发翻页
    if (Math.abs(diffX) > 50) {
      // 向左滑动 -> 查看下一页
      if (diffX < 0) {
        onSwipe('left');
      } 
      // 向右滑动 -> 查看上一页
      else {
        onSwipe('right');
      }
    }
    
    touchStartXRef.current = null;
  };

  const renderChart = () => {
    const query = Taro.createSelectorQuery();
    query
      .select('#bpChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          canvasRef.current = canvas;
          const ctx = canvas.getContext('2d');
          
          // 获取设备像素比
          const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;
          
          // 设置canvas的实际渲染尺寸
          canvas.width = res[0].width * pixelRatio;
          canvas.height = res[0].height * pixelRatio;
          
          // 设置canvas的样式尺寸
          canvas._width = res[0].width;
          canvas._height = res[0].height;
          
          // 缩放上下文以适应高DPI屏幕
          ctx.scale(pixelRatio, pixelRatio);
          
          // 清除之前的图表
          if (chartRef.current) {
            ctx.clearRect(0, 0, canvas._width, canvas._height);
          }
          
          initChart(canvas, ctx, canvas._width, canvas._height);
        }
      });
  };

  const initChart = (canvas: any, ctx: any, width: number, height: number) => {
    try {
      // 处理数据为空的情况
      if (!bpData || bpData.length === 0) {
        drawEmptyChart(ctx, width, height);
        return;
      }
      
      // 准备X轴类别数据
      const categories = bpData.map(item => formatTimestamp(item.timestamp, viewMode));
      
      // 准备系列数据
      const series = [
        {
          name: "收缩压",
          data: bpData.map(item => item.systolic),
          color: "#FF8A8A",
          lineWidth: 2,
          pointStyle: {
            size: 4,
          }
        },
        {
          name: "舒张压",
          data: bpData.map(item => item.diastolic),
          color: "#92A3FD",
          lineWidth: 2,
          pointStyle: {
            size: 4,
          }
        },
        {
          name: "心率",
          data: bpData.map(item => item.heartRate || 0),
          color: "#4CAF50",
          lineWidth: 2,
          pointStyle: {
            size: 4,
          }
        },
      ];
      
      const config = {
        type: chartType,
        canvasId: 'bpChart',
        canvas2d: true,
        context: ctx,
        width,
        height,
        categories,
        series,
        animation: true,
        background: "#FFFFFF",
        padding: [15, 15, 30, 15],
        enableScroll: true,
        legend: {
          show: false
        },
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: viewMode === "day" ? 6 : (viewMode === "week" ? 7 : 5),
          fontSize: 11,
          fontColor: "#666666",
        },
        yAxis: {
          gridType: "dash",
          dashLength: 4,
          data: [
            {
              min: 0,
              max: 200,
              fontSize: 11,
              fontColor: "#666666",
              format: (val) => val.toFixed(0)
            },
          ],
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "hollow",
            linearType: "custom",
            activeOpacity: 0.8,
          },
          column: {
            width: viewMode === "day" ? 12 : 8,
            activeBgColor: "#000000",
            activeBgOpacity: 0.08,
            barBorderRadius: [3, 3, 0, 0],
          },
          tooltip: {
            showBox: true,
            showArrow: true,
            showCategory: true,
            borderWidth: 0,
            borderRadius: 4,
            borderColor: "#92A3FD",
            bgColor: "#FFFFFF",
            bgOpacity: 0.9,
            fontColor: "#333333",
            fontSize: 11,
          },
        },
      };
      
      chartRef.current = new UCharts(config);
      
    } catch (error) {
      console.error("初始化图表失败:", error);
      // 出错时也显示空图表
      drawEmptyChart(ctx, width, height);
    }
  };

  // 处理日期或时间字符串
  const formatTimestamp = (timestamp: string, mode: ViewMode): string => {
    try {
      // 检查是否已经是格式化的时间字符串 (如 "12:30")
      if (/^\d{1,2}:\d{2}$/.test(timestamp)) {
        return timestamp;
      }
      
      // 检查是否已经是格式化的日期字符串 (如 "02/23")
      if (/^\d{1,2}\/\d{1,2}$/.test(timestamp)) {
        return timestamp;
      }
      
      // 尝试解析为日期对象
      const date = new Date(timestamp);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn(`无效的日期: ${timestamp}`);
        return viewMode === "day" ? "00:00" : "00/00";
      }
      
      // 根据视图模式格式化
      if (viewMode === "day") {
        return format(date, 'HH:mm');
      } else {
        return format(date, 'MM/dd');
      }
    } catch (error) {
      console.error(`日期格式化错误: ${error}`, timestamp);
      return viewMode === "day" ? "00:00" : "00/00";
    }
  };

  // 在图表中心绘制"暂无数据"文本
  const drawNoDataText = (ctx: any, width: number, height: number) => {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText('暂无数据', width / 2, height / 2);
    ctx.restore();
  };

  // 绘制空图表（出错时使用）
  const drawEmptyChart = (ctx: any, width: number, height: number) => {
    ctx.save();
    
    // 绘制X轴
    ctx.beginPath();
    ctx.moveTo(30, height - 30);
    ctx.lineTo(width - 15, height - 30);
    ctx.strokeStyle = '#CCCCCC';
    ctx.stroke();
    
    // 绘制Y轴
    ctx.beginPath();
    ctx.moveTo(30, 15);
    ctx.lineTo(30, height - 30);
    ctx.stroke();
    
    // 绘制"暂无数据"文本
    drawNoDataText(ctx, width, height);
    
    ctx.restore();
  };

  return (
    <Canvas
      type="2d"
      id="bpChart"
      canvas-id="bpChart"
      className="charts"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default BPChart;