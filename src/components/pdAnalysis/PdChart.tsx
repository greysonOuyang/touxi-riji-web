import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "@tarojs/components";
import { LineChart } from '@/components/common/charts';
import { getDay } from "date-fns";
import Taro from '@tarojs/taro';
import "./PdChart.scss";
import { PdDataPoint } from "./usePdData";
import { BaseChartConfig } from '@/components/common/charts/types';

interface PdChartProps {
  viewMode: "day" | "week" | "month";
  pdData: PdDataPoint[];
  isLoading?: boolean;
}

const weekDayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const PdChart: React.FC<PdChartProps> = ({ viewMode, pdData, isLoading = false }) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const [dataView, setDataView] = useState<"ultrafiltration" | "drainage">("ultrafiltration");
  const chartId = useRef(`pd-chart-${Math.random().toString(36).substring(2, 15)}`);

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query
      .select(`#pd-chart-container-${chartId.current}`)
      .boundingClientRect((rect) => {
        if (rect && 'width' in rect) {
          setChartWidth(rect.width);
          setChartHeight(rect.height || 300);
          console.log("Chart dimensions:", rect.width, rect.height || 300);
        } else {
          console.error("Failed to get chart dimensions", rect);
        }
      })
      .exec();
  }, []);

  const toggleDataView = () => {
    setDataView(prev => (prev === "ultrafiltration" ? "drainage" : "ultrafiltration"));
  };

  const getCategories = () => {
    if (viewMode === "day") {
      const sortedData = [...pdData].sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(`${a.date}T${a.recordTime}`).getTime();
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(`${b.date}T${b.recordTime}`).getTime();
        return timeA - timeB;
      });
      const times = sortedData.map(item => item.recordTime);
      return times.length > 1 ? times : ["00:00", times[0]]; // 添加默认起点
    } else if (viewMode === "week") {
      const weekDayMap = new Map<number, { ultrafiltration: number[], drainage: number[], count: number, dayOfWeek: number }>();
      pdData.forEach(item => {
        const date = new Date(item.date);
        const dayOfWeek = getDay(date);
        if (!weekDayMap.has(dayOfWeek)) {
          weekDayMap.set(dayOfWeek, { ultrafiltration: [], drainage: [], count: 0, dayOfWeek });
        }
        const dayData = weekDayMap.get(dayOfWeek)!;
        dayData.ultrafiltration.push(item.ultrafiltration);
        dayData.drainage.push(item.drainageVolume);
        dayData.count++;
      });
      const sortedDays = Array.from(weekDayMap.keys()).sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
      return sortedDays.map(dayOfWeek => weekDayNames[dayOfWeek]);
    } else {
      const weekMap = new Map<number, { ultrafiltration: number[], drainage: number[], count: number, weekNumber: number }>();
      pdData.forEach(item => {
        const date = new Date(item.date);
        const weekNumber = Math.ceil(date.getDate() / 7);
        if (!weekMap.has(weekNumber)) {
          weekMap.set(weekNumber, { ultrafiltration: [], drainage: [], count: 0, weekNumber });
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
      return matchingData ? (dataView === "ultrafiltration" ? matchingData.ultrafiltration : matchingData.drainageVolume) : 0;
    });

    return [{
      name: dataView === "ultrafiltration" ? "超滤量" : "引流量",
      data: seriesData,
      color: dataView === "ultrafiltration" ? "#92A3FD" : "#C58BF2",
      format: (val: number) => `${val}mL`
    }];
  };

  const getChartConfig = (): Partial<BaseChartConfig> => {
    const maxValue = dataView === "ultrafiltration"
      ? Math.max(...pdData.map(item => item.ultrafiltration)) * 1.2 || 500
      : Math.max(...pdData.map(item => item.drainageVolume)) * 1.2 || 3000;

    return {
      xAxis: {
        labelCount: 5,
        scrollShow: true,
        itemCount: 5,
        scrollAlign: 'right',
        calibration: true,
        marginLeft: 5,
        formatter: (item: string) => item
      },
      yAxis: {
        data: [{
          min: dataView === "ultrafiltration" ? -maxValue : 0,
          max: maxValue,
          splitNumber: 5,
          showTitle: true,
          format: (val: number) => `${val}mL`
        }]
      }
    };
  };

  useEffect(() => {
    const categories = getCategories();
    const series = getSeries();
    console.log("PdChart - pdData:", pdData);
    console.log("PdChart - Categories:", categories);
    console.log("PdChart - Series:", series);
    console.log("Rendering LineChart with:", { width: chartWidth, height: chartHeight });
  }, [pdData, viewMode, dataView, chartWidth, chartHeight]);

  if (isLoading) return <View className="pd-chart loading"><Text>加载中...</Text></View>;
  if (!pdData || pdData.length === 0) return <View className="pd-chart empty"><Text>暂无数据</Text><Text>请先记录腹透数据</Text></View>;

  return (
    <View className="pd-chart" id={`pd-chart-container-${chartId.current}`}>
      <View className="chart-header">
        <Text>{dataView === "ultrafiltration" ? "超滤量趋势" : "引流量趋势"}</Text>
        <View className="view-toggle" onClick={toggleDataView}>
          <Text>查看{dataView === "ultrafiltration" ? "引流量" : "超滤量"}</Text>
        </View>
      </View>
      <View className="chart-unit"><Text>单位: mL</Text></View>
      <View className="chart-canvas">
        {chartWidth > 0 && chartHeight > 0 ? (
          <LineChart
            categories={getCategories()}
            series={getSeries()}
            width={chartWidth}
            height={chartHeight}
            config={getChartConfig()}
          />
        ) : (
          <Text>图表尺寸加载中...</Text>
        )}
      </View>
    </View>
  );
};

export default PdChart;