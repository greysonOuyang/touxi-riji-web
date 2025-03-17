import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "@tarojs/components";
import { LineChart } from '@/components/common/charts';
import { format, parseISO, getDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PdDataPoint } from "./usePdData";
import "./PdChart.scss";
import Taro from '@tarojs/taro';

interface PdChartProps {
  viewMode: "day" | "week" | "month";
  pdData: PdDataPoint[];
  isLoading?: boolean;
}

// 星期几的中文表示
const weekDayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const PdChart: React.FC<PdChartProps> = ({
  viewMode,
  pdData,
  isLoading = false
}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dataView, setDataView] = useState<"ultrafiltration" | "drainage">("ultrafiltration");
  const chartId = useRef<number>(Math.random());
  
  useEffect(() => {
    if (containerRef.current) {
      // 使用 Taro.createSelectorQuery 获取元素尺寸
      Taro.createSelectorQuery()
        .select(`#pd-chart-container-${chartId.current}`) // 使用 id 选择器
        .boundingClientRect()
        .exec(res => {
          if (res && res[0]) {
            const { width, height } = res[0];
            setChartWidth(width);
            setChartHeight(height);
          }
        });
    }
  }, []);
  
  // 切换数据视图
  const toggleDataView = () => {
    setDataView(prev => prev === "ultrafiltration" ? "drainage" : "ultrafiltration");
  };

  const getCategories = () => {
    if (viewMode === "day") {
      // 日视图：按时间排序
      const sortedData = [...pdData].sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(`${a.date}T${a.recordTime}`).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(`${b.date}T${b.recordTime}`).getTime();
        return timeA - timeB;
      });
      
      return sortedData.map(item => item.recordTime);
    } else if (viewMode === "week") {
      // 周视图：按周几分组
      const weekDayMap = new Map<number, {
        ultrafiltration: number[],
        drainage: number[],
        count: number,
        dayOfWeek: number
      }>();
      
      pdData.forEach(item => {
        const date = new Date(item.date);
        const dayOfWeek = getDay(date);
        
        if (!weekDayMap.has(dayOfWeek)) {
          weekDayMap.set(dayOfWeek, {
            ultrafiltration: [],
            drainage: [],
            count: 0,
            dayOfWeek
          });
        }
        
        const dayData = weekDayMap.get(dayOfWeek)!;
        dayData.ultrafiltration.push(item.ultrafiltration);
        dayData.drainage.push(item.drainageVolume);
        dayData.count++;
      });
      
      const sortedDays = Array.from(weekDayMap.keys()).sort((a, b) => {
        const orderA = a === 0 ? 7 : a;
        const orderB = b === 0 ? 7 : b;
        return orderA - orderB;
      });
      
      return sortedDays.map(dayOfWeek => weekDayNames[dayOfWeek]);
    } else {
      // 月视图：按周分组
      const weekMap = new Map<number, {
        ultrafiltration: number[],
        drainage: number[],
        count: number,
        weekNumber: number
      }>();
      
      pdData.forEach(item => {
        const date = new Date(item.date);
        const weekNumber = Math.ceil(date.getDate() / 7);
        
        if (!weekMap.has(weekNumber)) {
          weekMap.set(weekNumber, {
            ultrafiltration: [],
            drainage: [],
            count: 0,
            weekNumber
          });
        }
        
        const weekData = weekMap.get(weekNumber)!;
        weekData.ultrafiltration.push(item.ultrafiltration);
        weekData.drainage.push(item.drainageVolume);
        weekData.count++;
      });
      
      const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
      return sortedWeeks.map(weekNumber => `第${weekNumber}周`);
    }
  };

  const getSeries = () => {
    const categories = getCategories();
    const seriesData = categories.map(category => {
      const matchingData = pdData.find(item => {
        switch (viewMode) {
          case "day":
            return item.recordTime === category;
          case "week":
            const date = new Date(item.date);
            const dayOfWeek = getDay(date);
            return weekDayNames[dayOfWeek] === category;
          case "month":
            const weekNumber = Math.ceil(new Date(item.date).getDate() / 7);
            return `第${weekNumber}周` === category;
          default:
            return false;
        }
      });

      if (dataView === "ultrafiltration") {
        return matchingData ? matchingData.ultrafiltration : 0;
      } else {
        return matchingData ? matchingData.drainageVolume : 0;
      }
    });

    return [{
      name: dataView === "ultrafiltration" ? "超滤量" : "引流量",
      data: seriesData,
      color: dataView === "ultrafiltration" ? "#92A3FD" : "#C58BF2",
      format: (val: number) => `${val}mL`
    }];
  };

  const getChartConfig = () => {
    const maxValue = dataView === "ultrafiltration" 
      ? Math.max(...pdData.map(item => item.ultrafiltration)) * 1.2 || 500
      : Math.max(...pdData.map(item => item.drainageVolume)) * 1.2 || 3000;

    return {
      xAxis: {
        labelCount: 5,
        formatter: (item: string) => item
      },
      yAxis: {
        data: [{
          min: dataView === "ultrafiltration" ? -maxValue : 0,
          max: maxValue,
          format: (val: number) => `${val}mL`
        }]
      }
    };
  };

  if (isLoading) {
    return (
      <View className="pd-chart loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }
  
  if (!pdData || pdData.length === 0) {
    return (
      <View className="pd-chart empty">
        <Text className="empty-text">暂无数据</Text>
        <Text className="empty-hint">请先记录腹透数据</Text>
      </View>
    );
  }
  
  return (
    <View className="pd-chart" ref={containerRef} id={`pd-chart-container-${chartId.current}`}>
      <View className="chart-header">
        <Text className="chart-title">
          {dataView === "ultrafiltration" ? "超滤量趋势" : "引流量趋势"}
        </Text>
        <View className="view-toggle" onClick={toggleDataView}>
          <Text>查看{dataView === "ultrafiltration" ? "引流量" : "超滤量"}</Text>
        </View>
      </View>
      
      <View className="chart-unit">
        <Text>单位: mL</Text>
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

export default PdChart;