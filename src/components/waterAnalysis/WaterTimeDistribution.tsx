import React from "react";
import { View, Text } from "@tarojs/components";
import { PieChart } from '@/components/common/charts';
import { WaterIntakeVO } from "@/api/waterIntakeApi";
import "./WaterTimeDistribution.scss";

interface WaterTimeDistributionProps {
  data: WaterIntakeVO[];
  isLoading?: boolean;
}

const WaterTimeDistribution: React.FC<WaterTimeDistributionProps> = ({
  data,
  isLoading = false
}) => {
  // 计算不同时间段的饮水量分布
  const getTimeDistribution = () => {
    const distribution = {
      morning: { total: 0, count: 0 }, // 6-12点
      afternoon: { total: 0, count: 0 }, // 12-18点
      evening: { total: 0, count: 0 }, // 18-24点
      night: { total: 0, count: 0 } // 0-6点
    };

    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours();
      if (hour >= 6 && hour < 12) {
        distribution.morning.total += item.amount;
        distribution.morning.count++;
      } else if (hour >= 12 && hour < 18) {
        distribution.afternoon.total += item.amount;
        distribution.afternoon.count++;
      } else if (hour >= 18) {
        distribution.evening.total += item.amount;
        distribution.evening.count++;
      } else {
        distribution.night.total += item.amount;
        distribution.night.count++;
      }
    });

    return distribution;
  };

  const distribution = getTimeDistribution();
  const totalWater = Object.values(distribution).reduce((sum, { total }) => sum + total, 0);

  // 准备饼图数据
  const pieData = [
    {
      name: "上午",
      value: distribution.morning.total,
      color: "#92A3FD"
    },
    {
      name: "下午",
      value: distribution.afternoon.total,
      color: "#C58BF2"
    },
    {
      name: "晚上",
      value: distribution.evening.total,
      color: "#FFB547"
    },
    {
      name: "凌晨",
      value: distribution.night.total,
      color: "#FF6B6B"
    }
  ].filter(item => item.value > 0);

  const getPieChartConfig = () => {
    return {
      legend: {
        show: false
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
        horizentalLine: false,
        xAxisLabel: true,
        yAxisLabel: false,
        labelBgColor: "#FFFFFF",
        labelBgOpacity: 0.7,
        labelFontColor: "#666666"
      },
      label: {
        show: true,
        position: "outside",
        formatter: (item: any) => `${item.name}\n${item.value}mL`
      }
    };
  };

  if (isLoading) {
    return (
      <View className="water-time-distribution loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="water-time-distribution empty">
        <Text className="empty-text">暂无数据</Text>
        <Text className="empty-hint">请先记录饮水数据</Text>
      </View>
    );
  }

  return (
    <View className="water-time-distribution">
      <View className="chart-header">
        <Text className="chart-title">饮水时间分布</Text>
      </View>

      <View className="chart-content">
        <View className="pie-chart">
          <PieChart
            categories={pieData.map(item => item.name)}
            series={[{
              name: "饮水量",
              data: pieData.map(item => item.value),
              color: pieData.map(item => item.color),
              format: (val: number) => `${val}mL`
            }]}
            width={300}
            height={300}
            config={getPieChartConfig()}
          />
        </View>

        <View className="distribution-details">
          <View className="detail-item">
            <View className="time-label morning">上午</View>
            <View className="amount">
              {distribution.morning.total}mL
              <Text className="percentage">
                ({((distribution.morning.total / totalWater) * 100).toFixed(1)}%)
              </Text>
            </View>
          </View>
          <View className="detail-item">
            <View className="time-label afternoon">下午</View>
            <View className="amount">
              {distribution.afternoon.total}mL
              <Text className="percentage">
                ({((distribution.afternoon.total / totalWater) * 100).toFixed(1)}%)
              </Text>
            </View>
          </View>
          <View className="detail-item">
            <View className="time-label evening">晚上</View>
            <View className="amount">
              {distribution.evening.total}mL
              <Text className="percentage">
                ({((distribution.evening.total / totalWater) * 100).toFixed(1)}%)
              </Text>
            </View>
          </View>
          <View className="detail-item">
            <View className="time-label night">凌晨</View>
            <View className="amount">
              {distribution.night.total}mL
              <Text className="percentage">
                ({((distribution.night.total / totalWater) * 100).toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WaterTimeDistribution; 