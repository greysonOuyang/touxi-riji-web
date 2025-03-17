import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "@tarojs/components";
import { LineChart } from '@/components/common/charts';
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import "./WeightChart.scss";
import { WeightDataPoint } from "./useWeightData";

interface WeightChartProps {
  viewMode: "day" | "week" | "month";
  weightData: WeightDataPoint[];
  isLoading?: boolean;
}

const WeightChart: React.FC<WeightChartProps> = ({
  viewMode,
  weightData,
  isLoading = false
}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setChartWidth(width);
      setChartHeight(height);
    }
  }, []);
  
  const getCategories = () => {
    if (viewMode === "day") {
      // 日视图：按时间排序
      const sortedData = [...weightData].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB;
      });
      
      return sortedData.map(item => format(parseISO(item.timestamp), "HH:mm"));
    } else if (viewMode === "week") {
      // 周视图：按日期分组
      const dateMap = new Map<string, {
        weight: number[],
        count: number
      }>();
      
      weightData.forEach(item => {
        if (!dateMap.has(item.date)) {
          dateMap.set(item.date, {
            weight: [],
            count: 0
          });
        }
        
        const dayData = dateMap.get(item.date)!;
        dayData.weight.push(item.weight);
        dayData.count++;
      });
      
      const sortedDates = Array.from(dateMap.keys()).sort();
      return sortedDates.map(date => format(parseISO(date), "MM-dd", { locale: zhCN }));
    } else {
      // 月视图：按周分组
      const weekMap = new Map<number, {
        weight: number[],
        count: number,
        weekNumber: number
      }>();
      
      weightData.forEach(item => {
        const date = new Date(item.date);
        const weekNumber = Math.ceil(date.getDate() / 7);
        
        if (!weekMap.has(weekNumber)) {
          weekMap.set(weekNumber, {
            weight: [],
            count: 0,
            weekNumber
          });
        }
        
        const weekData = weekMap.get(weekNumber)!;
        weekData.weight.push(item.weight);
        weekData.count++;
      });
      
      const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
      return sortedWeeks.map(weekNumber => `第${weekNumber}周`);
    }
  };

  const getSeries = () => {
    const categories = getCategories();
    const seriesData = categories.map(category => {
      const matchingData = weightData.find(item => {
        switch (viewMode) {
          case "day":
            return format(parseISO(item.timestamp), "HH:mm") === category;
          case "week":
            return format(parseISO(item.date), "MM-dd", { locale: zhCN }) === category;
          case "month":
            const weekNumber = Math.ceil(new Date(item.date).getDate() / 7);
            return `第${weekNumber}周` === category;
          default:
            return false;
        }
      });

      return matchingData ? matchingData.weight : 0;
    });

    return [{
      name: "体重",
      data: seriesData,
      color: "#92A3FD",
      format: (val: number) => `${val}kg`
    }];
  };

  const getChartConfig = () => {
    const maxWeight = Math.max(...weightData.map(item => item.weight));
    const minWeight = Math.min(...weightData.map(item => item.weight));
    const range = maxWeight - minWeight;
    const padding = range * 0.1;

    return {
      xAxis: {
        labelCount: 5,
        formatter: (item: string) => item
      },
      yAxis: {
        data: [{
          min: minWeight - padding,
          max: maxWeight + padding,
          format: (val: number) => `${val}kg`
        }]
      }
    };
  };

  if (isLoading) {
    return (
      <View className="weight-chart loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }
  
  if (!weightData || weightData.length === 0) {
    return (
      <View className="weight-chart empty">
        <Text className="empty-text">暂无数据</Text>
        <Text className="empty-hint">请先记录体重数据</Text>
      </View>
    );
  }
  
  return (
    <View className="weight-chart" ref={containerRef}>
      <View className="chart-header">
        <Text className="chart-title">体重变化趋势</Text>
      </View>
      
      <View className="chart-unit">
        <Text>单位: kg</Text>
      </View>
      
      <View className="chart-canvas">
        <LineChart
          categories={getCategories()}
          series={getSeries()}
          width={chartWidth}
          height={chartHeight}
          config={getChartConfig()}
        />
      </View>
    </View>
  );
};

export default WeightChart; 