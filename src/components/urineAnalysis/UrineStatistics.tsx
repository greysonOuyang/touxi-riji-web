import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { UrineDataPoint, UrineMetadata } from "./useUrineData";
import { UrineTimeDistributionItemVO } from "@/api/urineApi";
import "./index.scss";

// 定义时间段配置
const TIME_PERIODS = {
  MORNING: { name: "早晨 (5:00-9:00)", color: "#91d5ff" },
  FORENOON: { name: "上午 (9:00-12:00)", color: "#87e8de" },
  NOON: { name: "中午 (12:00-14:00)", color: "#b7eb8f" },
  AFTERNOON: { name: "下午 (14:00-18:00)", color: "#ffe58f" },
  EVENING: { name: "晚上 (18:00-22:00)", color: "#ffadd2" },
  NIGHT: { name: "夜间 (22:00-5:00)", color: "#adc6ff" }
};

interface UrineStatisticsProps {
  urineData: UrineDataPoint[];
  metadata: UrineMetadata | null;
  timeDistribution?: UrineTimeDistributionItemVO[];
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const UrineStatistics: React.FC<UrineStatisticsProps> = ({
  urineData,
  metadata,
  timeDistribution,
  viewMode,
  isLoading = false
}) => {
  // 状态
  const [trendInfo, setTrendInfo] = useState<{ type: string; message: string } | null>(null);

  // 初始化时设置趋势信息
  useEffect(() => {
    if (metadata) {
      // 设置趋势信息
      if (metadata.trend) {
        setTrendInfo(getTrendDescription(metadata.trend, metadata.trendPercentage));
      }
    }
  }, [metadata]);

  // 获取时间分布数据
  const getTimeDistributionData = () => {
    // 优先使用传入的timeDistribution
    if (timeDistribution && timeDistribution.length > 0) {
      console.log("使用传入的timeDistribution数据", timeDistribution);
      return timeDistribution;
    }
    
    // 如果没有传入timeDistribution，则尝试使用metadata中的数据
    if (metadata && metadata.timeDistribution && metadata.timeDistribution.length > 0) {
      console.log("使用metadata中的timeDistribution数据", metadata.timeDistribution);
      return metadata.timeDistribution;
    }
    
    console.log("没有时间分布数据");
    return [];
  };

  // 获取趋势描述
  const getTrendDescription = (trend: string, percentage?: number) => {
    switch (trend) {
      case "increasing":
        return {
          type: "increasing",
          message: `排尿量呈上升趋势，请遵医嘱调整`
        };
      case "decreasing":
        return {
          type: "decreasing",
          message: `排尿量呈下降趋势，请遵医嘱调整`
        };
      case "fluctuating":
        return {
          type: "fluctuating",
          message: `排尿量波动较大，建议咨询医生`
        };
      case "stable":
      default:
        return {
          type: "stable",
          message: `排尿量保持稳定`
        };
    }
  };

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
        
        {/* 测量次数和数据可靠性 */}
        <View className="data-meta">
          <Text className="count-text">
            共{metadata?.recordCount || 0}次记录
          </Text>
          {metadata && metadata.recordCount < 3 && (
            <Text className="reliability-text">
              数据量较少，分析可靠性较低
            </Text>
          )}
        </View>
        
        {/* 数据完整度 */}
        {metadata && viewMode !== "day" && (
          <View className="data-completeness">
            <View className="completeness-header">
              <Text className="completeness-title">数据完整度</Text>
              <Text className="completeness-value">{metadata.dataCompleteness || 0}%</Text>
            </View>
            <View className="completeness-bar-container">
              <View 
                className="completeness-bar" 
                style={{ 
                  width: `${metadata.dataCompleteness || 0}%`,
                  backgroundColor: (metadata.dataCompleteness || 0) < 30 ? '#ff4d4f' : 
                                  (metadata.dataCompleteness || 0) < 70 ? '#faad14' : '#52c41a'
                }}
              />
            </View>
            <Text className="completeness-desc">
              在过去的{metadata.totalDays || 0}天中，有{metadata.daysWithData || 0}天记录了数据
            </Text>
          </View>
        )}
        
        {/* 尿量统计数据 */}
        <View className="statistics-grid">
          <View className="statistics-item">
            <View className="item-header">
              <Text className="item-value">
                {metadata?.dailyAverage ? `${Math.round(metadata.dailyAverage)}ml` : "-"}
              </Text>
              <View className="help-icon" onClick={() => Taro.showModal({
                title: '日均尿量说明',
                content: '日均尿量是基于有记录的天数计算的平均值。对尿毒症患者来说，日均尿量通常低于健康人群，无尿：<100ml/天；少尿：<400ml/天；正常范围：400-1000ml/天。如果您有基线尿量，系统会根据您的个人情况进行评估。',
                showCancel: false,
                confirmText: '我知道了'
              })}>?</View>
            </View>
            <Text className="item-label">日均尿量</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">
              {metadata?.recordCount && metadata?.daysWithData && metadata.daysWithData > 0
                ? Math.round((metadata.recordCount / metadata.daysWithData) * 10) / 10 
                : "-"}
            </Text>
            <Text className="item-label">日均次数</Text>
            <Text className="item-source">
              {metadata?.daysWithData ? `(${metadata.daysWithData}天)` : ""}
            </Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">
              {metadata?.averageVolume ? `${Math.round(metadata.averageVolume)}ml` : "-"}
            </Text>
            <Text className="item-label">平均单次</Text>
          </View>
        </View>
        
        {trendInfo && (
          <View className={`trend-info ${trendInfo.type}`}>
            <Text className="trend-text">{trendInfo.message}</Text>
          </View>
        )}
        
        <View className="data-note">
          <Text className="note-text">
            *尿量数据仅供参考，具体情况因个人病情而异，请遵医嘱。
          </Text>
        </View>
      </View>
      
      {/* 卡片2: 尿量汇总 */}
      <View className="statistics-card">
        <Text className="card-title">尿量汇总</Text>
        <View className="statistics-grid">
          <View className="statistics-item">
            <Text className="item-value">
              {metadata?.totalVolume ? `${metadata.totalVolume}ml` : "-"}
            </Text>
            <Text className="item-label">总尿量</Text>
            <Text className="item-source">
              {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}
            </Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">
              {metadata?.recordCount || 0}
            </Text>
            <Text className="item-label">总次数</Text>
            <Text className="item-source">
              {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}
            </Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">
              {metadata?.abnormalCount || 0}
            </Text>
            <Text className="item-label">异常次数</Text>
            <Text className="item-source">
              {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* 卡片3: 时间分布 */}
      <View className="statistics-card">
        <Text className="card-title">排尿时间分布</Text>
        <View className="time-distribution">
          {getTimeDistributionData().length > 0 ? (
            getTimeDistributionData().map((item, index) => {
              const percentage = item.count > 0 
                ? Math.round((item.count / getTimeDistributionData().reduce((sum, i) => sum + i.count, 0)) * 100) 
                : 0;
              
              // 查找对应的时间段配置
              const periodConfig = Object.values(TIME_PERIODS).find(p => p.name === item.period);
              const color = periodConfig ? periodConfig.color : '#1890ff';
              
              return (
                <View className="time-period-item" key={index}>
                  <View className="period-header">
                    <View className="period-dot" style={{ backgroundColor: color }}></View>
                    <Text className="period-name">{item.period}</Text>
                    <Text className="period-percentage">({percentage}%)</Text>
                  </View>
                  <View className="period-stats">
                    <View className="period-stat">
                      <Text className="stat-value">{item.count}</Text>
                      <Text className="stat-label">次数</Text>
                    </View>
                    <View className="period-stat">
                      <Text className="stat-value">{item.totalVolume ? `${item.totalVolume}ml` : '-'}</Text>
                      <Text className="stat-label">总量</Text>
                    </View>
                    <View className="period-stat">
                      <Text className="stat-value">{item.avgVolume ? `${Math.round(item.avgVolume)}ml` : '-'}</Text>
                      <Text className="stat-label">平均</Text>
                    </View>
                  </View>
                  <View className="period-bar" style={{ width: `${percentage}%`, backgroundColor: color }}></View>
                </View>
              );
            })
          ) : (
            <View className="no-data">暂无时间分布数据</View>
          )}
        </View>
      </View>
    </View>
  );
};

export default UrineStatistics; 