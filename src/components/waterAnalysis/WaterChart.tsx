import React, { useRef, useEffect } from "react";
import { Canvas, View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import "./WaterChart.scss";
import { WaterIntakeVO } from "@/api/waterIntakeApi";

// 引入图表库
import UCharts from "@qiun/ucharts";

interface WaterChartProps {
  viewMode: "day" | "week" | "month";
  waterData?: WaterIntakeVO[]; // 喝水数据
  onSwipe?: (direction: "left" | "right") => void;
  isLoading?: boolean;
}

const WaterChart: React.FC<WaterChartProps> = ({ 
  viewMode, 
  waterData = [], 
  onSwipe,
  isLoading = false
}) => {
  const chartRef = useRef<any>(null);
  const canvasId = "water-chart";
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

  // 触摸移动事件处理
  const handleTouchMove = (e) => {
    chartRef.current?.scrollMove(e);
  };

  // 初始化图表
  const initChart = (canvas, width, height) => {
    if (!canvas) {
      console.error("Canvas节点不存在");
      return null;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("无法获取Canvas上下文");
      return null;
    }
    
    const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;
    
    // 设置Canvas尺寸
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
    
    // 准备数据
    const categories: string[] = [];
    const chartData: number[] = [];
    
    try {
      // 根据视图模式处理数据
      if (viewMode === "day") {
        // 日视图：按时间排序
        const sortedData = [...waterData].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        sortedData.forEach(item => {
          try {
            const date = new Date(item.timestamp);
            categories.push(`${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`);
            if (typeof item.amount === 'number' && !isNaN(item.amount)) {
              chartData.push(Number(item.amount));
            }
          } catch (e) {
            console.error("日期格式化错误:", e);
          }
        });
      } else if (viewMode === "week") {
        // 周视图：按日期分组
        const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        const dayData = new Map<number, { amount: number; count: number }>();
        
        // 初始化每天的数据
        for (let i = 0; i < 7; i++) {
          dayData.set(i, { amount: 0, count: 0 });
        }
        
        // 累加每天的数据
        waterData.forEach(item => {
          try {
            const date = parseISO(item.date);
            const dayIndex = (date.getDay() + 6) % 7; // 转换为周一为0
            
            const dayStats = dayData.get(dayIndex)!;
            if (typeof item.amount === 'number' && !isNaN(item.amount)) {
              dayStats.amount += item.amount;
              dayStats.count += 1;
            }
          } catch (e) {
            console.error("日期解析错误:", e);
          }
        });
        
        // 计算每天的总量
        for (let i = 0; i < 7; i++) {
          categories.push(weekDays[i]);
          const stats = dayData.get(i)!;
          
          if (stats.count > 0) {
            chartData.push(stats.amount);
          } else {
            // 对于没有数据的日期，使用0
            chartData.push(0);
            // 在categories中标记为无数据
            categories[i] = `${weekDays[i]}(无)`;
          }
        }
      } else {
        // 月视图：按日期分组
        const daysInMonth = 31; // 假设最多31天
        const dayData = new Map<number, { amount: number; count: number }>();
        
        // 初始化每天的数据
        for (let i = 1; i <= daysInMonth; i++) {
          dayData.set(i, { amount: 0, count: 0 });
        }
        
        // 累加每天的数据
        waterData.forEach(item => {
          try {
            const date = parseISO(item.date);
            const day = date.getDate();
            
            const dayStats = dayData.get(day)!;
            if (typeof item.amount === 'number' && !isNaN(item.amount)) {
              dayStats.amount += item.amount;
              dayStats.count += 1;
            }
          } catch (e) {
            console.error("日期解析错误:", e);
          }
        });
        
        // 计算每天的总量，只添加有数据的日期
        for (let i = 1; i <= daysInMonth; i++) {
          if (dayData.get(i)!.count > 0) {
            categories.push(`${i}日`);
            const stats = dayData.get(i)!;
            chartData.push(stats.amount);
          }
        }
      }
      
      // 如果没有有效数据，添加一个默认数据点
      if (categories.length === 0 || chartData.length === 0) {
        categories.push("无数据");
        chartData.push(0);
      }
      
      // 准备图表数据
      const series = [
        {
          name: "喝水量",
          data: chartData,
          color: "#92A3FD",
          type: "column", // 使用柱状图
          style: "stroke",
          pointShape: "circle",
          pointColor: "#92A3FD",
          pointSelectedColor: "#92A3FD",
          barWidth: 15,
        }
      ];
      
      // 计算Y轴范围
      let maxAmount = 3000;
      
      if (chartData.length > 0 && chartData.some(w => w > 0)) {
        const validData = chartData.filter(w => w > 0);
        maxAmount = Math.ceil(Math.max(...validData) * 1.2); // 增加20%的空间
      }
      
      // 图表配置
      chartRef.current = new UCharts({
        type: "column",
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
          itemCount: Math.min(7, categories.length), // 限制显示的项目数量
          scrollShow: false,
          labelCount: Math.min(7, categories.length), // 限制标签数量
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
              max: maxAmount,
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
          column: {
            width: 15,
            barBorderRadius: [5, 5, 0, 0],
            linearType: "custom",
            linearOpacity: 1,
            customColor: [
              {
                stop: 0,
                color: "#92A3FD"
              },
              {
                stop: 1,
                color: "#9DCEFF"
              }
            ],
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
          }
        }
      });
      
      return chartRef.current;
    } catch (error) {
      console.error("图表初始化错误:", error);
      return null;
    }
  };

  // 组件挂载和更新时初始化图表
  useEffect(() => {
    if (waterData && waterData.length > 0 && !isLoading) {
      Taro.nextTick(() => {
        try {
          Taro.createSelectorQuery()
            .select(`#${canvasId}`)
            .fields({ node: true, size: true })
            .exec((res) => {
              if (res && res[0]) {
                initChart(res[0].node, res[0].width, res[0].height);
              } else {
                console.error("获取Canvas节点失败");
              }
            });
        } catch (error) {
          console.error("初始化图表错误:", error);
        }
      });
    }
    
    return () => {
      if (chartRef.current) {
        chartRef.current = null;
      }
    };
  }, [waterData, viewMode, isLoading]);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (waterData && waterData.length > 0 && !isLoading) {
        try {
          Taro.createSelectorQuery()
            .select(`#${canvasId}`)
            .fields({ node: true, size: true })
            .exec((res) => {
              if (res && res[0]) {
                initChart(res[0].node, res[0].width, res[0].height);
              }
            });
        } catch (error) {
          console.error("窗口大小变化时初始化图表错误:", error);
        }
      }
    };
    
    Taro.onWindowResize(handleResize);
    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, [waterData, viewMode, isLoading]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="water-chart loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!waterData || waterData.length === 0) {
    return (
      <View className="water-chart empty">
        <Text className="empty-text">暂无喝水数据</Text>
        <Text className="empty-hint">请先记录喝水</Text>
      </View>
    );
  }

  return (
    <View className="water-chart">
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        className="chart-canvas"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      />
    </View>
  );
};

export default WaterChart; 