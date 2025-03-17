import React, { useEffect, useRef, useState } from 'react';
import { View } from '@tarojs/components';
import { ColumnChart } from '@/components/common/charts';
import { formatDate, getWeekDays, getMonthDays } from '@/utils/date';
import './WaterChart.scss';
import { WaterIntakeVO } from "@/api/waterIntakeApi";
import ViewModeSelector from "@/components/common/ViewModeSelector";
import DateNavigator from "@/components/common/DateNavigator";

interface WaterChartProps {
  viewMode: 'day' | 'week' | 'month';
  waterData?: WaterIntakeVO[]; // 喝水数据
  endDate: Date; // 当前显示的结束日期
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void; // 视图模式变更回调
  onDateChange: (newDate: Date) => void; // 日期变更回调
  onSwipe?: (direction: 'left' | 'right') => void;
}

const WaterChart: React.FC<WaterChartProps> = ({ 
  viewMode, 
  waterData = [], 
  endDate,
  onViewModeChange,
  onDateChange,
  onSwipe
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

  // 处理日期导航
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    let newDate = new Date(endDate);
    
    if (direction === 'prev') {
      // 向前导航
      switch (viewMode) {
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
      }
    } else if (direction === 'next') {
      // 向后导航
      switch (viewMode) {
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
    } else if (direction === 'today') {
      // 重置为今天
      newDate = new Date();
    }
    
    onDateChange(newDate);
  };

  const getCategories = () => {
    switch (viewMode) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      case 'week':
        return getWeekDays(endDate);
      case 'month':
        return getMonthDays(endDate);
      default:
        return [];
    }
  };

  const getSeries = () => {
    const categories = getCategories();
    const seriesData = categories.map(category => {
      const matchingData = waterData.find(item => {
        switch (viewMode) {
          case 'day':
            return formatDate(new Date(item.timestamp), 'HH') === category;
          case 'week':
            return formatDate(new Date(item.timestamp), 'EEE') === category;
          case 'month':
            return formatDate(new Date(item.timestamp), 'd') === category;
          default:
            return false;
        }
      });
      return matchingData ? matchingData.amount : 0;
    });

    return [{
      name: '饮水量',
      data: seriesData,
      color: '#4A90E2',
      format: (val: number) => `${val}ml`
    }];
  };

  const getChartConfig = () => {
    return {
      xAxis: {
        labelCount: viewMode === 'day' ? 6 : 5,
        formatter: (item: string) => item
      },
      yAxis: {
        data: [{
          min: 0,
          format: (val: number) => `${val}ml`
        }]
      }
    };
  };

  return (
    <View className='water-chart' ref={containerRef}>
      <ColumnChart
        categories={getCategories()}
        series={getSeries()}
        width={chartWidth}
        height={chartHeight}
        config={getChartConfig()}
      />
    </View>
  );
};

export default WaterChart; 