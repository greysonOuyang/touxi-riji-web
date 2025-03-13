import React from "react";
import { View, Text, Progress } from "@tarojs/components";
import { WaterIntakeHabitVO } from "@/api/waterIntakeApi";
import "./WaterHabitAnalysis.scss";

interface WaterHabitAnalysisProps {
  habitAnalysis?: WaterIntakeHabitVO;
  isLoading?: boolean;
}

const WaterHabitAnalysis: React.FC<WaterHabitAnalysisProps> = ({
  habitAnalysis,
  isLoading = false
}) => {
  // 获取规律性等级对应的颜色
  const getRegularityColor = (level: string) => {
    switch (level) {
      case "高":
        return "#10B981"; // 绿色
      case "中":
        return "#F59E0B"; // 黄色
      case "低":
        return "#EF4444"; // 红色
      default:
        return "#A1A1AA"; // 灰色
    }
  };

  // 获取分布模式对应的图标和颜色
  const getPatternInfo = (pattern: string) => {
    switch (pattern) {
      case "早集中型":
        return { icon: "🌅", color: "#F59E0B" };
      case "晚集中型":
        return { icon: "🌙", color: "#6366F1" };
      case "波峰型":
        return { icon: "⛰️", color: "#EF4444" };
      case "均匀型":
        return { icon: "⚖️", color: "#10B981" };
      default:
        return { icon: "❓", color: "#A1A1AA" };
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="water-habit-analysis">
        <View className="loading-state">
          <Text>加载习惯分析数据中...</Text>
        </View>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!habitAnalysis) {
    return (
      <View className="water-habit-analysis">
        <View className="empty-state">
          <Text>暂无喝水习惯分析数据</Text>
        </View>
      </View>
    );
  }

  const { regularity, dailyPattern } = habitAnalysis;
  const patternInfo = getPatternInfo(dailyPattern.pattern);

  return (
    <View className="water-habit-analysis">
      <View className="habit-header">
        <Text className="title">饮水习惯分析</Text>
        <Text className="subtitle">基于最近30天的饮水记录</Text>
      </View>

      {/* 规律性分析 */}
      <View className="habit-card">
        <View className="card-header">
          <Text className="card-title">饮水规律性</Text>
          <Text className="card-subtitle">您的饮水规律评分</Text>
        </View>

        <View className="regularity-score">
          <View className="score-circle" style={{ borderColor: getRegularityColor(regularity.level) }}>
            <Text className="score-value">{regularity.score}</Text>
            <Text className="score-label">分</Text>
          </View>
          <View className="score-info">
            <Text className="level" style={{ color: getRegularityColor(regularity.level) }}>
              规律性: {regularity.level}
            </Text>
          </View>
        </View>
      </View>

      {/* 日间分布特征 */}
      <View className="habit-card">
        <View className="card-header">
          <Text className="card-title">日间分布特征</Text>
          <Text className="card-subtitle">您的饮水时间分布模式</Text>
        </View>

        <View className="pattern-info">
          <View className="pattern-details">
            <Text className="pattern-name">{dailyPattern.pattern}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WaterHabitAnalysis; 