import React, { useEffect, useRef } from "react";
import { View, Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import { UrineDataPoint } from "./useUrineData";
import "./index.scss";

interface UrineChartProps {
  urineData: UrineDataPoint[];
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const UrineChart: React.FC<UrineChartProps> = ({ urineData, viewMode, isLoading = false }) => {
  const chartRef = useRef<any>(null);
  const canvasId = "urine-volume-chart";
  
  // 处理数据，按日期分组
  const processChartData = () => {
    if (!urineData || urineData.length === 0) return { labels: [], values: [] };
    
    const dataMap = new Map<string, number>();
    
    // 根据视图模式决定日期格式
    const dateFormat = viewMode === "day" ? "HH:mm" : "MM-dd";
    
    urineData.forEach(item => {
      const date = parseISO(item.timestamp);
      const label = format(date, dateFormat);
      
      if (viewMode === "day") {
        // 日视图：显示每次记录
        dataMap.set(label, item.volume);
      } else {
        // 周/月视图：按日期累加
        const dayKey = format(date, "yyyy-MM-dd");
        dataMap.set(dayKey, (dataMap.get(dayKey) || 0) + item.volume);
      }
    });
    
    // 如果是周/月视图，需要重新格式化标签
    if (viewMode !== "day") {
      const newMap = new Map<string, number>();
      
      dataMap.forEach((value, key) => {
        const date = parseISO(key);
        const label = format(date, dateFormat);
        newMap.set(label, value);
      });
      
      dataMap.clear();
      newMap.forEach((value, key) => {
        dataMap.set(key, value);
      });
    }
    
    // 排序并转换为数组
    const sortedEntries = Array.from(dataMap.entries())
      .sort((a, b) => {
        if (viewMode === "day") {
          // 日视图按时间排序
          return a[0].localeCompare(b[0]);
        } else {
          // 周/月视图按日期排序
          return a[0].localeCompare(b[0]);
        }
      });
    
    const labels = sortedEntries.map(([label]) => label);
    const values = sortedEntries.map(([_, value]) => value);
    
    return { labels, values };
  };
  
  // 初始化图表
  const initChart = (canvas, width, height) => {
    if (!canvas) return null;
    
    const ctx = canvas.getContext("2d");
    const dpr = Taro.getSystemInfoSync().pixelRatio;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    const { labels, values } = processChartData();
    
    if (labels.length === 0 || values.length === 0) {
      return null;
    }
    
    // 图表配置
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // 计算Y轴范围
    const maxValue = Math.max(...values) * 1.2; // 留出20%的空间
    const yStep = Math.ceil(maxValue / 5 / 100) * 100; // 向上取整到最接近的100的倍数
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 1;
    
    // Y轴
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    
    // X轴
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // 绘制Y轴刻度和网格线
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#999";
    ctx.font = "12px Arial";
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartHeight - (i * chartHeight / 5);
      const value = i * yStep;
      
      // 绘制网格线
      ctx.beginPath();
      ctx.strokeStyle = "#F0F0F0";
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // 绘制刻度值
      ctx.fillText(`${value}`, padding.left - 5, y);
    }
    
    // 绘制X轴标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    
    const xStep = chartWidth / (labels.length - 1 || 1);
    labels.forEach((label, index) => {
      const x = padding.left + index * xStep;
      ctx.fillText(label, x, height - padding.bottom + 10);
    });
    
    // 绘制数据点和连线
    ctx.beginPath();
    ctx.strokeStyle = "#1890FF";
    ctx.lineWidth = 2;
    
    values.forEach((value, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + chartHeight - (value / maxValue * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // 绘制数据点
    values.forEach((value, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + chartHeight - (value / maxValue * chartHeight);
      
      ctx.beginPath();
      ctx.fillStyle = "#1890FF";
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制数值
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${value}`, x, y - 10);
    });
    
    return null;
  };
  
  // 组件挂载或数据变化时初始化图表
  useEffect(() => {
    if (isLoading || !urineData || urineData.length === 0) return;
    
    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          // 清空画布
          ctx.clearRect(0, 0, res[0].width, res[0].height);
          
          // 初始化图表
          chartRef.current = initChart(canvas, res[0].width, res[0].height);
        }
      });
  }, [urineData, viewMode, isLoading]);
  
  return (
    <View className="urine-chart">
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        className="chart-canvas"
      />
    </View>
  );
};

export default UrineChart; 