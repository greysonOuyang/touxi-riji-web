import React, { useRef, useEffect } from "react";
import { Canvas, View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import "./WaterChart.scss";
import { WaterIntakeVO } from "@/api/waterIntakeApi";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";

// 引入图表库
import UCharts from "@qiun/ucharts";

interface WaterChartProps {
  viewMode: "day" | "week" | "month";
  waterData?: WaterIntakeVO[]; // 喝水数据
  endDate: Date; // 当前显示的结束日期
  onViewModeChange: (mode: "day" | "week" | "month") => void; // 视图模式变更回调
  onDateChange: (newDate: Date) => void; // 日期变更回调
  onSwipe?: (direction: "left" | "right") => void;
}

const WaterChart: React.FC<WaterChartProps> = ({ 
  viewMode, 
  waterData = [], 
  endDate,
  onViewModeChange,
  onDateChange,
  onSwipe
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

  // 处理日期导航
  const handleNavigate = (direction: "prev" | "next" | "today") => {
    let newDate = new Date(endDate);
    
    if (direction === "prev") {
      // 向前导航
      switch (viewMode) {
        case "day":
          newDate.setDate(newDate.getDate() - 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() - 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() - 1);
          break;
      }
    } else if (direction === "next") {
      // 向后导航
      switch (viewMode) {
        case "day":
          newDate.setDate(newDate.getDate() + 1);
          break;
        case "week":
          newDate.setDate(newDate.getDate() + 7);
          break;
        case "month":
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
    } else if (direction === "today") {
      // 重置为今天
      newDate = new Date();
    }
    
    onDateChange(newDate);
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
        // 日视图：按小时分组
        const hourlyData = new Map<number, number>();
        
        for (let i = 0; i < 24; i++) {
          hourlyData.set(i, 0);
        }
        
        waterData.forEach(item => {
          try {
            const date = new Date(item.timestamp);
            const hour = date.getHours();
            hourlyData.set(hour, (hourlyData.get(hour) || 0) + item.amount);
          } catch (e) {
            console.error("日期格式化错误:", e);
          }
        });
        
        // 生成小时标签和数据
        for (let i = 0; i < 24; i++) {
          categories.push(`${i}:00`);
          chartData.push(hourlyData.get(i) || 0);
        }
      } else if (viewMode === "week") {
        // 周视图：按天分组
        const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
        const dailyData = new Map<string, number>();
        
        weekDays.forEach(day => {
          dailyData.set(day, 0);
        });
        
        waterData.forEach(item => {
          try {
            const date = new Date(item.timestamp);
            // 获取星期几（0是周日，1-6是周一到周六）
            let dayOfWeek = date.getDay();
            // 调整为周一为一周的第一天
            if (dayOfWeek === 0) dayOfWeek = 7;
            const dayName = weekDays[dayOfWeek - 1];
            dailyData.set(dayName, (dailyData.get(dayName) || 0) + item.amount);
          } catch (e) {
            console.error("日期解析错误:", e);
          }
        });
        
        // 生成周标签和数据
        weekDays.forEach(day => {
          categories.push(day);
          chartData.push(dailyData.get(day) || 0);
        });
      } else {
        // 月视图：按日期分组
        const dailyData = new Map<string, number>();
        const daySet = new Set<string>();
        
        waterData.forEach(item => {
          try {
            const date = item.date || format(new Date(item.timestamp), "yyyy-MM-dd");
            // 提取日期中的日部分
            const day = date.split("-")[2];
            daySet.add(day);
            dailyData.set(day, (dailyData.get(day) || 0) + item.amount);
          } catch (e) {
            console.error("日期解析错误:", e);
          }
        });
        
        // 按日期排序
        const days = Array.from(daySet).sort((a, b) => parseInt(a) - parseInt(b));
        
        // 生成日期标签和数据
        days.forEach(day => {
          categories.push(`${day}日`);
          chartData.push(dailyData.get(day) || 0);
        });
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
    if (waterData && waterData.length > 0) {
      const query = Taro.createSelectorQuery();
      
      if (Taro.canIUse("SelectorQuery.selectViewport")) {
        query.selectViewport().scrollOffset();
      }
      
      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            initChart(res[0].node, res[0].width, res[0].height);
          } else {
            console.error("获取Canvas节点失败");
          }
        });
    }
  }, [waterData, viewMode]);

  // 处理屏幕旋转等导致的尺寸变化
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const query = Taro.createSelectorQuery();
        query
          .select(`#${canvasId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0]) {
              initChart(res[0].node, res[0].width, res[0].height);
            }
          });
      }
    };
    
    Taro.onWindowResize(handleResize);
    
    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, []);

  return (
    <View className="water-chart-container">
      <View className="header-container">
        <Text className="chart-title">喝水趋势</Text>
        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </View>
      
      <DateNavigator
        mode={viewMode}
        currentDate={endDate}
        onNavigate={handleNavigate}
        onReset={() => handleNavigate("today")}
      />
      
      <Canvas
        type="2d"
        id={canvasId}
        className="water-chart"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onInit={initChart}
      />
    </View>
  );
};

export default WaterChart; 