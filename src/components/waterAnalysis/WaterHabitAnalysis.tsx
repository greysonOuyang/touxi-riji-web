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

  const { regularity, dailyPattern, weekdayVsWeekend, suggestions } = habitAnalysis;
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
            <Text className="analysis">{regularity.analysis}</Text>
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
          <View className="pattern-icon" style={{ backgroundColor: patternInfo.color }}>
            <Text>{patternInfo.icon}</Text>
          </View>
          <View className="pattern-details">
            <Text className="pattern-name">{dailyPattern.pattern}</Text>
            <Text className="pattern-description">{dailyPattern.description}</Text>
          </View>
        </View>
      </View>

      {/* 工作日vs周末对比 */}
      <View className="habit-card">
        <View className="card-header">
          <Text className="card-title">工作日vs周末对比</Text>
          <Text className="card-subtitle">饮水量在不同类型日期的差异</Text>
        </View>

        <View className="comparison">
          <View className="comparison-item">
            <Text className="comparison-label">工作日平均</Text>
            <Text className="comparison-value">{weekdayVsWeekend.weekdayAverage}ml</Text>
            <View className="comparison-bar">
              <Progress 
                percent={weekdayVsWeekend.weekdayAverage / 10} 
                strokeWidth={8} 
                activeColor="#2563EB" 
                backgroundColor="#E5E7EB" 
              />
            </View>
          </View>

          <View className="comparison-item">
            <Text className="comparison-label">周末平均</Text>
            <Text className="comparison-value">{weekdayVsWeekend.weekendAverage}ml</Text>
            <View className="comparison-bar">
              <Progress 
                percent={weekdayVsWeekend.weekendAverage / 10} 
                strokeWidth={8} 
                activeColor="#10B981" 
                backgroundColor="#E5E7EB" 
              />
            </View>
          </View>

          <View className="comparison-difference">
            <Text className="difference-label">差异:</Text>
            <Text className="difference-value">{weekdayVsWeekend.difference.toFixed(1)}%</Text>
          </View>
        </View>
      </View>

      {/* 改进建议 */}
      <View className="suggestions-card">
        <View className="card-header">
          <Text className="card-title">改进建议</Text>
          <Text className="card-subtitle">基于您的饮水习惯分析</Text>
        </View>

        <View className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <View key={index} className="suggestion-item">
              <Text className="suggestion-bullet">•</Text>
              <Text className="suggestion-text">{suggestion}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default WaterHabitAnalysis; 