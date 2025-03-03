import React from "react";
import { View, Text } from "@tarojs/components";
import "./WeightStatistics.scss";
import { WeightDataPoint, WeightStatisticsVO, BmiDataVO } from "./useWeightData";

interface WeightStatisticsProps {
  viewMode: "day" | "week" | "month";
  weightData?: WeightDataPoint[]; // 体重数据
  statistics?: WeightStatisticsVO | null; // 统计数据
  bmiData?: BmiDataVO | null; // BMI数据
  isLoading?: boolean;
}

const WeightStatistics: React.FC<WeightStatisticsProps> = ({ 
  viewMode, 
  weightData = [], 
  statistics = null,
  bmiData = null,
  isLoading = false
}) => {
  // 获取体重状态提醒
  const getWeightStatusAlert = () => {
    if (!weightData || weightData.length === 0 || !statistics) {
      return null;
    }
    
    // 根据体重变化和波动情况给出提醒
    if (statistics.weightChange > 0 && statistics.weightChange > statistics.weightFluctuation * 0.5) {
      return {
        message: `近期体重上升了${statistics.weightChange.toFixed(1)}kg，请注意控制饮食`,
        type: "warning",
      };
    } else if (statistics.weightChange < 0 && Math.abs(statistics.weightChange) > statistics.weightFluctuation * 0.5) {
      return {
        message: `近期体重下降了${Math.abs(statistics.weightChange).toFixed(1)}kg，请保持良好习惯`,
        type: "good",
      };
    } else if (statistics.weightFluctuation > 2) {
      return {
        message: `体重波动较大(${statistics.weightFluctuation.toFixed(1)}kg)，建议保持稳定的生活习惯`,
        type: "warning",
      };
    }
    
    return {
      message: "体重状况良好，请继续保持",
      type: "good",
    };
  };

  const alert = getWeightStatusAlert();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="weight-statistics">
        <View className="loading-state">
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!weightData || weightData.length === 0 || !statistics) {
    return (
      <View className="weight-statistics">
        <View className="empty-state">
          <Text>暂无数据，无法生成统计信息</Text>
        </View>
      </View>
    );
  }

  // 获取BMI分类的颜色和标签
  const getBmiCategoryInfo = () => {
    if (!bmiData) return { color: "#999", label: "未知" };
    
    const { bmiCategory } = bmiData;
    
    switch (bmiCategory) {
      case "偏瘦":
        return { color: "#52c41a", label: "偏瘦", bgColor: "#f6ffed" };
      case "正常":
        return { color: "#52c41a", label: "正常", bgColor: "#f6ffed" };
      case "超重":
        return { color: "#fa8c16", label: "超重", bgColor: "#fff7e6" };
      case "肥胖":
        return { color: "#f5222d", label: "肥胖", bgColor: "#fff1f0" };
      default:
        return { color: "#999", label: "未知", bgColor: "#f5f5f5" };
    }
  };

  const bmiCategoryInfo = getBmiCategoryInfo();

  return (
    <View className="weight-statistics">
      {/* 卡片1: 体重状态概览 */}
      <View className="weight-card status-card">
        <View className="card-header">
          <Text className="card-title">体重统计分析</Text>
          <Text className="card-subtitle">
            {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}体重概览
          </Text>
        </View>
        
        {alert && (
          <View className={`weight-alert ${alert.type}`}>
            <Text className="alert-message">{alert.message}</Text>
          </View>
        )}
        
        {/* 测量次数和数据可靠性 */}
        <View className="data-meta">
          <Text className="count-text">共{weightData.length || 0}次测量</Text>
          {statistics && statistics.dataCoverage < 0.7 && (
            <Text className="reliability-text">
              数据覆盖: {Math.round((statistics?.dataCoverage || 0) * 100)}% 
              {(statistics?.dataCoverage || 0) < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
      </View>

      {/* 卡片2: BMI分析 */}
      {bmiData && (
        <View className="weight-card bmi-card">
          <Text className="card-title">BMI分析</Text>
          <View className="bmi-container">
            <View className="bmi-value-container">
              <Text className="bmi-value">{bmiData.bmiValue.toFixed(1)}</Text>
              <Text className="bmi-label" style={{ 
                color: bmiCategoryInfo.color,
                backgroundColor: bmiCategoryInfo.bgColor
              }}>
                {bmiCategoryInfo.label}
              </Text>
            </View>
            <View className="bmi-scale">
              <View className="bmi-scale-bar">
                <View 
                  className="bmi-scale-indicator" 
                  style={{ left: `${bmiData.bmiPercentile}%` }} 
                />
              </View>
              <View className="bmi-scale-labels">
                <Text>偏瘦</Text>
                <Text>正常</Text>
                <Text>超重</Text>
                <Text>肥胖</Text>
              </View>
            </View>
            <View className="bmi-info">
              <Text className="bmi-info-text">
                理想体重范围: {bmiData.idealWeightMin.toFixed(1)}kg - {bmiData.idealWeightMax.toFixed(1)}kg
              </Text>
              <Text className="bmi-info-text">
                身高: {bmiData.height}cm
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 卡片3: 体重统计数据 */}
      <View className="weight-card stats-card">
        <Text className="card-title">体重统计</Text>
        <View className="stats-grid">
          <View className="stats-item">
            <Text className="stats-label">平均体重</Text>
            <Text className="stats-value">{statistics.averageWeight.toFixed(1)}</Text>
            <Text className="stats-unit">kg</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">最高体重</Text>
            <Text className="stats-value">{statistics.maxWeight.toFixed(1)}</Text>
            <Text className="stats-unit">kg</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">最低体重</Text>
            <Text className="stats-value">{statistics.minWeight.toFixed(1)}</Text>
            <Text className="stats-unit">kg</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">体重变化</Text>
            <Text className="stats-value" style={{ 
              color: statistics.weightChange > 0 ? '#f5222d' : 
                    statistics.weightChange < 0 ? '#52c41a' : '#666'
            }}>
              {statistics.weightChange > 0 ? '+' : ''}{statistics.weightChange.toFixed(1)}
            </Text>
            <Text className="stats-unit">kg</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">标准体重</Text>
            <Text className="stats-value">{statistics.standardWeight.toFixed(1)}</Text>
            <Text className="stats-unit">kg</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">体重波动</Text>
            <Text className="stats-value">{statistics.weightFluctuation.toFixed(1)}</Text>
            <Text className="stats-unit">kg</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WeightStatistics; 