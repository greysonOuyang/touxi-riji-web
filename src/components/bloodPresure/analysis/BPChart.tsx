import React, { useEffect, useRef } from 'react';
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { format } from "date-fns";

interface BPDataPoint {
  systolic: number;
  diastolic: number;
  heartRate?: number;  // 心率是可选的
  timestamp: string;
}

interface BPChartProps {
  viewMode: "day" | "week" | "month";
  bpData: BPDataPoint[];
}

const BPChart: React.FC<BPChartProps> = ({ viewMode, bpData }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderChart();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bpData, viewMode]);

  const renderChart = () => {
    const query = Taro.createSelectorQuery();
    query
      .select('#bpChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          // 清除之前的图表
          if (chartRef.current) {
            // 清除画布而不是调用dispose
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            chartRef.current = null;
          }
          
          // 获取设备像素比
          const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 2;
          
          // 设置canvas尺寸，考虑设备像素比
          canvas.width = res[0].width * pixelRatio;
          canvas.height = res[0].height * pixelRatio;
          
          // 缩放上下文以匹配设备像素比
          ctx.scale(pixelRatio, pixelRatio);
          
          // 初始化图表（不再区分日视图和周/月视图）
          initChart(canvas, ctx, res[0].width, res[0].height);
        }
      });
  };

  // 统一的图表初始化方法
  const initChart = (canvas: any, ctx: any, width: number, height: number) => {
    try {
      // 即使没有数据也创建图表，显示坐标轴
      const categories = bpData && bpData.length > 0 
        ? bpData.map(item => {
            const date = new Date(item.timestamp);
            if (viewMode === "day") {
              return format(date, 'HH:mm');
            } else {
              return format(date, 'MM/dd');
            }
          })
        : viewMode === "day" 
          ? generateEmptyTimeCategories() 
          : generateEmptyDateCategories(viewMode);
      
      const series = [
        {
          name: "收缩压",
          data: bpData && bpData.length > 0 
            ? bpData.map(item => item.systolic)
            : [],
          color: "#FF8A8A",
          lineWidth: 3,
          pointStyle: {
            size: 5,
          }
        },
        {
          name: "舒张压",
          data: bpData && bpData.length > 0 
            ? bpData.map(item => item.diastolic)
            : [],
          color: "#92A3FD",
          lineWidth: 3,
          pointStyle: {
            size: 5,
          }
        },
        {
          name: "心率",
          data: bpData && bpData.length > 0 
            ? bpData.map(item => item.heartRate || 0)  // 使用 || 0 处理可能的 undefined
            : [],
          color: "#4CAF50",
          lineWidth: 3,
          pointStyle: {
            size: 5,
          }
        },
      ];
      
      const config = {
        type: "line",
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
          itemCount: viewMode === "week" ? 7 : 5,
          fontSize: 12,
          fontColor: "#333333",
        },
        yAxis: {
          gridType: "dash",
          dashLength: 4,
          data: [
            {
              min: 0,
              max: 200,
              fontSize: 12,
              fontColor: "#333333",
            },
          ],
        },
        extra: {
          line: {
            type: "straight",
            width: 3,
            activeType: "hollow",
            linearType: "custom",
            activeOpacity: 0.8,
          },
          tooltip: {
            showBox: true,
            showArrow: true,
            showCategory: true,
            borderWidth: 1,
            borderRadius: 4,
            borderColor: "#92A3FD",
            bgColor: "#FFFFFF",
            bgOpacity: 0.9,
            fontColor: "#333333",
            fontSize: 12,
          },
          empty: {
            content: "暂无数据",
            fontSize: 14,
            fontColor: "#999999",
          }
        },
      };
      
      chartRef.current = new UCharts(config);
      
      // 如果没有数据，在图表中心显示"暂无数据"
      if (!bpData || bpData.length === 0) {
        drawNoDataText(ctx, width, height);
      }
    } catch (error) {
      console.error("初始化图表失败:", error);
      // 出错时也显示空图表
      drawEmptyChart(ctx, width, height);
    }
  };

  // 生成空的时间类别（用于日视图）
  const generateEmptyTimeCategories = () => {
    const hours: string[] = [];
    for (let i = 0; i < 24; i += 4) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  };

  // 生成空的日期类别（用于周视图和月视图）
  const generateEmptyDateCategories = (mode: "day" | "week" | "month") => {
    const today = new Date();
    const dates: string[] = [];
    
    if (mode === "week") {
      // 生成最近7天的日期，确保正好显示7天
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(format(date, 'MM/dd'));
      }
    } else if (mode === "month") {
      // 生成当月的几个日期点
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i += 5) {
        dates.push(`${(today.getMonth() + 1).toString().padStart(2, '0')}/${i.toString().padStart(2, '0')}`);
      }
    }
    
    return dates;
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
    />
  );
};

export default BPChart;