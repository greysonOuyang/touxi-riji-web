import React from "react";
import { View, Text } from "@tarojs/components";
import { WaterStatisticsVO } from "@/api/waterIntakeApi";
import "./WaterStatistics.scss";

interface WaterStatisticsProps {
  statistics?: WaterStatisticsVO | null;
  isLoading?: boolean;
}

const WaterStatistics: React.FC<WaterStatisticsProps> = ({ 
  statistics, 
  isLoading = false 
}) => {
  // 获取水分摄入状态
  const getWaterStatus = () => {
    if (!statistics) return "warning";
    
    const { totalAmount, recommendedLimit } = statistics;
    const percentage = totalAmount / recommendedLimit;
    
    if (percentage > 1) return "danger"; // 超过限制
    if (percentage >= 0.8) return "warning"; // 接近限制
    return "good"; // 低于限制
  };
  
  // 获取水分摄入状态文本
  const getWaterStatusText = () => {
    if (!statistics) return "暂无数据";
    
    const status = getWaterStatus();
    
    switch (status) {
      case "good":
        return "今日水分摄入控制良好，继续保持！";
      case "warning":
        return "今日水分摄入接近上限，请注意控制！";
      case "danger":
        return "今日水分摄入已超过建议上限，请严格控制！";
      default:
        return "暂无数据";
    }
  };
  
  // 计算完成百分比
  const getCompletionPercentage = () => {
    if (!statistics || !statistics.recommendedLimit) return 0;
    
    const { totalAmount, recommendedLimit } = statistics;
    return Math.min(Math.round((totalAmount / recommendedLimit) * 100), 100);
  };
  
  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="water-statistics">
        <View className="loading-state">
          <Text>加载统计数据中...</Text>
        </View>
      </View>
    );
  }
  
  // 如果没有数据，显示空状态
  if (!statistics) {
    return (
      <View className="water-statistics">
        <View className="empty-state">
          <Text>暂无喝水统计数据</Text>
        </View>
      </View>
    );
  }
  
  const { totalAmount, recommendedLimit, averageAmount, maxAmount, recordDays, completionRate } = statistics;
  
  return (
    <View className="water-statistics">
      {/* 水分摄入状态卡片 */}
      <View className="water-card">
        <View className="card-header">
          <Text className="card-title">今日水分摄入</Text>
          <Text className="card-subtitle">建议上限: {recommendedLimit}ml</Text>
        </View>
        
        <View className={`water-alert ${getWaterStatus()}`}>
          <Text>{getWaterStatusText()}</Text>
        </View>
        
        <View className="water-progress">
          <View className="progress-bar">
            <View 
              className="progress-fill" 
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </View>
          <Text className="progress-text">{getCompletionPercentage()}%</Text>
        </View>
        
        <View className="water-amount">
          <Text className="amount-value">{totalAmount}</Text>
          <Text className="amount-unit">ml</Text>
        </View>
      </View>
      
      {/* 统计数据网格 */}
      <View className="stats-grid">
        <View className="stats-item">
          <Text className="stats-label">平均摄入量</Text>
          <Text className="stats-value">{averageAmount}ml</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">最高摄入量</Text>
          <Text className="stats-value">{maxAmount}ml</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">建议上限</Text>
          <Text className="stats-value">{recommendedLimit}ml</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">记录天数</Text>
          <Text className="stats-value">{recordDays}天</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">控制达标率</Text>
          <Text className="stats-value">
            {completionRate ? Math.round(completionRate) : 0}%
          </Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">今日状态</Text>
          <Text className="stats-value">
            {totalAmount <= recommendedLimit ? "达标" : "超量"}
          </Text>
        </View>
      </View>
      
      {/* 健康提示 */}
      <View className="health-tips">
        <Text className="tips-title">健康提示</Text>
        <Text className="tips-content">
          腹膜透析患者需要严格控制水分摄入量，良好的水分平衡有助于减轻心脏负担和提高透析效果。建议每天饮水量不超过医生建议的上限，通常根据体重、尿量和超滤量计算得出。过量饮水可能导致水肿、高血压和心脏负担加重。
        </Text>
      </View>
    </View>
  );
};

export default WaterStatistics; 