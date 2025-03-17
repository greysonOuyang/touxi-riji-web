import React, { useEffect, useRef, useState } from "react";
import { View } from "@tarojs/components";
import { LineChart } from '@/components/common/charts';
import { BpTrendData } from "@/api/bloodPressureApi";
import { formatDate } from '@/utils/date';
import "./BPChart.scss";

interface BPChartProps {
  viewMode: "day" | "week" | "month";
  bpData: BpTrendData[];
  onSwipe?: (direction: "left" | "right") => void;
}

const BPChart: React.FC<BPChartProps> = ({
  viewMode,
  bpData,
  onSwipe,
}) => {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setChartWidth(width);
      setChartHeight(height);
    }
  }, []);

  // 处理触摸事件
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    setScrolling(true);
  };

  const handleTouchEnd = (e) => {
    if (!scrolling && onSwipe) {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX.current;
      
      if (Math.abs(diffX) > 100) {
        if (diffX > 0) {
          onSwipe("right");
        } else {
          onSwipe("left");
        }
      }
    }
    
    setTimeout(() => {
      setScrolling(false);
    }, 300);
  };

  const getCategories = () => {
    return bpData.map(item => {
      const date = new Date(item.timestamp);
      switch (viewMode) {
        case "day":
          return formatDate(date, "HH:mm");
        case "week":
          return formatDate(date, "EEE");
        case "month":
          return formatDate(date, "d日");
        default:
          return "";
      }
    });
  };

  const getSeries = () => {
    return [
      {
        name: "收缩压",
        data: bpData.map(item => item.hasMeasurement ? item.systolic : null),
        color: "#FF8A8A",
        type: "line",
        pointShape: "circle",
        pointSize: 3,
        lineWidth: 2,
        format: (val) => val ? val.toFixed(0) : '-'
      },
      {
        name: "舒张压",
        data: bpData.map(item => item.hasMeasurement ? item.diastolic : null),
        color: "#92A3FD",
        type: "line",
        pointShape: "circle",
        pointSize: 3,
        lineWidth: 2,
        format: (val) => val ? val.toFixed(0) : '-'
      }
    ];
  };

  const getChartConfig = () => {
    return {
      xAxis: {
        labelCount: 7,
        formatter: (item: string) => item
      },
      yAxis: {
        data: [{
          min: 40,
          max: 200,
          format: (val: number) => val.toFixed(0),
          title: "mmHg",
          titleFontColor: "#999999",
          titleFontSize: 12,
          titleOffsetY: -5,
          titleOffsetX: -25
        }]
      },
      extra: {
        markLine: {
          type: "dash",
          dashLength: 5,
          data: [
            {
              value: 140,
              lineColor: "#FF8A8A",
              showLabel: true,
              labelText: "高压140",
              labelPosition: "left",
              labelAlign: "top",
              labelOffsetX: 8,
              labelFontSize: 12,
              labelBgColor: "#FFF0F0",
              labelBgOpacity: 0.7,
              labelFontColor: "#FF8A8A"
            },
            {
              value: 90,
              lineColor: "#92A3FD",
              showLabel: true,
              labelText: "低压90",
              labelPosition: "left",
              labelAlign: "bottom",
              labelOffsetX: 8,
              labelFontSize: 12,
              labelBgColor: "#F0F8FF",
              labelBgOpacity: 0.7,
              labelFontColor: "#92A3FD"
            }
          ]
        }
      }
    };
  };

  return (
    <View className="chart-container" ref={containerRef}>
      <LineChart
        categories={getCategories()}
        series={getSeries()}
        width={chartWidth}
        height={chartHeight}
        config={getChartConfig()}
      />
    </View>
  );
};

export default BPChart;