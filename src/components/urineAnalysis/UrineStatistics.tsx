import React, { useMemo } from "react";
import { View, Text } from "@tarojs/components";
import { UrineDataPoint, UrineMetadata, NORMAL_VOLUME_RANGE, TIME_PERIODS } from "./useUrineData";
import "./index.scss";

interface UrineStatisticsProps {
  urineData: UrineDataPoint[];
  metadata: UrineMetadata | null;
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const UrineStatistics: React.FC<UrineStatisticsProps> = ({
  urineData,
  metadata,
  viewMode,
  isLoading = false
}) => {
  // 根据尿量生成状态提示
  const getUrineVolumeAlert = (dailyAverage: number) => {
    if (dailyAverage < NORMAL_VOLUME_RANGE.MIN) {
      return {
        type: "warning",
        message: "日均尿量偏低，请咨询医生",
        icon: "warning"
      };
    } else if (dailyAverage > NORMAL_VOLUME_RANGE.MAX) {
      return {
        type: "notice",
        message: "日均尿量偏高，建议咨询医生",
        icon: "info"
      };
    } else {
      return {
        type: "good",
        message: "尿量在正常范围内",
        icon: "success"
      };
    }
  };
  
  // 获取趋势描述
  const getTrendDescription = (trend: "increasing" | "decreasing" | "stable" | "fluctuating", percentage: number) => {
    switch (trend) {
      case "increasing":
        return `尿量呈上升趋势，相比前期增加了${percentage}%`;
      case "decreasing":
        return `尿量呈下降趋势，相比前期减少了${percentage}%`;
      case "fluctuating":
        return "尿量波动较大，请遵医嘱调整";
      case "stable":
      default:
        return "尿量保持稳定";
    }
  };
  
  // 渲染时间分布
  const renderTimeDistribution = () => {
    if (!metadata || !metadata.timeDistribution || metadata.timeDistribution.length === 0) {
      return <Text className="no-data">暂无时间分布数据</Text>;
    }
    
    return (
      <View className="time-distribution">
        {metadata.timeDistribution.map((item, index) => {
          const periodInfo = Object.values(TIME_PERIODS).find(p => p.name === item.period);
          const bgColor = periodInfo ? periodInfo.color : "#9E9E9E";
          
          return (
            <View className="time-period-item" key={index}>
              <View className="period-header">
                <View 
                  className="period-dot" 
                  style={{ backgroundColor: bgColor }}
                />
                <Text className="period-name">{item.period}</Text>
                <Text className="period-percentage">({item.percentage}%)</Text>
              </View>
              <View className="period-stats">
                <View className="period-stat">
                  <Text className="stat-value">{item.count}</Text>
                  <Text className="stat-label">次数</Text>
                </View>
                <View className="period-stat">
                  <Text className="stat-value">{item.avgVolume}</Text>
                  <Text className="stat-label">平均(ml)</Text>
                </View>
                <View className="period-stat">
                  <Text className="stat-value">{item.totalVolume}</Text>
                  <Text className="stat-label">总量(ml)</Text>
                </View>
              </View>
              <View 
                className="period-bar" 
                style={{ 
                  width: `${Math.max(item.percentage, 5)}%`,
                  backgroundColor: bgColor
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };
  
  // 如果没有数据，显示空状态
  if (!urineData || urineData.length === 0 || !metadata) {
    return (
      <View className="urine-statistics">
        <View className="empty-state">
          <Text>暂无数据，无法生成统计信息</Text>
        </View>
      </View>
    );
  }
  
  const alert = getUrineVolumeAlert(metadata.dailyAverage);
  const trendDescription = getTrendDescription(metadata.trend, metadata.trendPercentage);
  
  return (
    <View className="urine-statistics">
      {/* 卡片1: 尿量状态概览 */}
      <View className="statistics-card">
        <View className="card-header">
          <Text className="card-title">尿量统计分析</Text>
          <Text className="card-subtitle">
            {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}尿量概览
          </Text>
        </View>
        
        {alert && (
          <View className={`urine-alert ${alert.type}`}>
            <Text className="alert-message">{alert.message}</Text>
          </View>
        )}
        
        {/* 测量次数和数据可靠性 */}
        <View className="data-meta">
          <Text className="count-text">共{metadata.recordCount}次记录</Text>
          {metadata.dataCoverage < 0.7 && viewMode !== "day" && (
            <Text className="reliability-text">
              数据覆盖: {Math.round(metadata.dataCoverage * 100)}% 
              {metadata.dataCoverage < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
        
        {/* 趋势信息 */}
        {viewMode !== "day" && (
          <View className={`trend-info ${metadata.trend}`}>
            <Text className="trend-text">{trendDescription}</Text>
          </View>
        )}
      </View>

      {/* 卡片2: 尿量统计数据 */}
      <View className="statistics-card">
        <Text className="card-title">尿量统计</Text>
        <View className="statistics-grid">
          <View className="statistics-item">
            <Text className="item-value">{metadata.dailyAverage}</Text>
            <Text className="item-label">日均尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.totalVolume}</Text>
            <Text className="item-label">总尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.averageVolume}</Text>
            <Text className="item-label">平均单次(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.maxVolume}</Text>
            <Text className="item-label">最大尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.minVolume}</Text>
            <Text className="item-label">最小尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.abnormalCount}</Text>
            <Text className="item-label">异常次数</Text>
          </View>
        </View>
      </View>
      
      {/* 卡片3: 时间分布 */}
      <View className="statistics-card">
        <Text className="card-title">排尿时间分布</Text>
        {renderTimeDistribution()}
      </View>
    </View>
  );
};

export default UrineStatistics; 