import React, { useEffect, useRef } from 'react';
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { format } from "date-fns";

interface BPDataPoint {
  systolic: number;
  diastolic: number;
  heartRate: number;
  timestamp: string;
}

interface DailyBPDataPoint {
  id: number;
  userId: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  measurementTime: string;
  notes: string;
}

interface BPChartProps {
  viewMode: "day" | "week" | "month";
  bpData: BPDataPoint[];
  dailyBpData: DailyBPDataPoint[];
  hasDailyData: boolean;
}

const BPChart: React.FC<BPChartProps> = ({ viewMode, bpData, dailyBpData, hasDailyData }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderChart();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [bpData, dailyBpData, viewMode, hasDailyData]);

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
          
          // 根据视图模式选择数据
          if (viewMode === "day" && hasDailyData) {
            initDailyChart(canvas, ctx, res[0].width, res[0].height);
          } else {
            initTrendChart(canvas, ctx, res[0].width, res[0].height);
          }
        }
      });
  };

  const initDailyChart = (canvas: any, ctx: any, width: number, height: number) => {
    try {
      if (!dailyBpData || dailyBpData.length === 0) {
        console.log("没有日视图数据可显示");
        return;
      }
      
      const categories = dailyBpData.map(item => 
        format(new Date(item.measurementTime), 'HH:mm')
      );
      
      const series = [
        {
          name: "收缩压",
          data: dailyBpData.map(item => item.systolic),
          color: "#FF8A8A",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
          }
        },
        {
          name: "舒张压",
          data: dailyBpData.map(item => item.diastolic),
          color: "#92A3FD",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
          }
        },
        {
          name: "心率",
          data: dailyBpData.map(item => item.heartRate),
          color: "#4CAF50",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
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
        padding: [15, 15, 30, 15], // 增加底部内边距
        enableScroll: true,
        legend: {
          show: false
        },
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 5,
          fontSize: 12, // 增加字体大小
          fontColor: "#333333", // 加深字体颜色
        },
        yAxis: {
          gridType: "dash",
          dashLength: 4,
          data: [
            {
              min: 0,
              max: 200,
              fontSize: 12, // 增加字体大小
              fontColor: "#333333", // 加深字体颜色
            },
          ],
        },
        extra: {
          line: {
            type: "straight",
            width: 3, // 增加线宽
            activeType: "hollow",
            linearType: "custom", // 使用自定义线性渐变
            activeOpacity: 0.8, // 活动状态的透明度
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
          }
        },
      };
      
      chartRef.current = new UCharts(config);
    } catch (error) {
      console.error("初始化日视图图表失败:", error);
    }
  };

  const initTrendChart = (canvas: any, ctx: any, width: number, height: number) => {
    try {
      if (!bpData || bpData.length === 0) {
        console.log("没有趋势数据可显示");
        return;
      }
      
      const categories = bpData.map(item => {
        const date = new Date(item.timestamp);
        return format(date, 'MM/dd');
      });
      
      const series = [
        {
          name: "收缩压",
          data: bpData.map(item => item.systolic),
          color: "#FF8A8A",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
          }
        },
        {
          name: "舒张压",
          data: bpData.map(item => item.diastolic),
          color: "#92A3FD",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
          }
        },
        {
          name: "心率",
          data: bpData.map(item => item.heartRate),
          color: "#4CAF50",
          lineWidth: 3, // 增加线宽
          pointStyle: {
            size: 5, // 增加点的大小
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
        padding: [15, 15, 30, 15], // 增加底部内边距
        enableScroll: true,
        legend: {
          show: false
        },
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 5,
          fontSize: 12, // 增加字体大小
          fontColor: "#333333", // 加深字体颜色
        },
        yAxis: {
          gridType: "dash",
          dashLength: 4,
          data: [
            {
              min: 0,
              max: 200,
              fontSize: 12, // 增加字体大小
              fontColor: "#333333", // 加深字体颜色
            },
          ],
        },
        extra: {
          line: {
            type: "straight",
            width: 3, // 增加线宽
            activeType: "hollow",
            linearType: "custom", // 使用自定义线性渐变
            activeOpacity: 0.8, // 活动状态的透明度
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
          }
        },
      };
      
      chartRef.current = new UCharts(config);
    } catch (error) {
      console.error("初始化趋势图表失败:", error);
    }
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