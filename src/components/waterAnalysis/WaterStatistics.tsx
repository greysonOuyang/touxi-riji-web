import React from "react";
import { View, Text } from "@tarojs/components";
import { WaterStatisticsVO } from "@/api/waterIntakeApi";
import "./WaterStatistics.scss";

interface WaterStatisticsProps {
  statistics?: WaterStatisticsVO;
  isLoading?: boolean;
}

const WaterStatistics: React.FC<WaterStatisticsProps> = ({ 
  statistics, 
  isLoading = false 
}) => {
  // 获取水分摄入状态
  const getWaterStatus = () => {
    if (!statistics) return "warning";
    
    const { totalAmount, targetAmount } = statistics;
    const percentage = totalAmount / targetAmount;
    
    if (percentage >= 1) return "good"; // 达到目标
    if (percentage >= 0.7) return "warning"; // 接近目标
    return "danger"; // 远低于目标
  };
  
  // 获取水分摄入状态文本
  const getWaterStatusText = () => {
    if (!statistics) return "暂无数据";
    
    const status = getWaterStatus();
    
    switch (status) {
      case "good":
        return "水分摄入达标，继续保持！";
      case "warning":
        return "水分摄入接近目标，再喝一点吧！";
      case "danger":
        return "水分摄入不足，请多喝水！";
      default:
        return "暂无数据";
    }
  };
  
  // 计算完成百分比
  const getCompletionPercentage = () => {
    if (!statistics || !statistics.targetAmount) return 0;
    
    const { totalAmount, targetAmount } = statistics;
    return Math.min(Math.round((totalAmount / targetAmount) * 100), 100);
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
  
  const { totalAmount, targetAmount, averageAmount, maxAmount, minAmount, completionDays, recordDays } = statistics;
  
  return (
    <View className="water-statistics">
      {/* 水分摄入状态卡片 */}
      <View className="water-card">
        <View className="card-header">
          <Text className="card-title">今日水分摄入</Text>
          <Text className="card-subtitle">目标: {targetAmount}ml</Text>
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
          <Text className="stats-label">最低摄入量</Text>
          <Text className="stats-value">{minAmount}ml</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">达标天数</Text>
          <Text className="stats-value">{completionDays}天</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">记录天数</Text>
          <Text className="stats-value">{recordDays}天</Text>
        </View>
        
        <View className="stats-item">
          <Text className="stats-label">达标率</Text>
          <Text className="stats-value">
            {recordDays > 0 ? Math.round((completionDays / recordDays) * 100) : 0}%
          </Text>
        </View>
      </View>
      
      {/* 健康提示 */}
      <View className="health-tips">
        <Text className="tips-title">健康提示</Text>
        <Text className="tips-content">
          每天保持充足的水分摄入有助于维持身体健康，提高新陈代谢，改善皮肤状况。建议成年人每天饮水量在1500-2000ml之间。
        </Text>
      </View>
    </View>
  );
};

export default WaterStatistics; 