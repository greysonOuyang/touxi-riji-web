import React, { useMemo } from "react";
import { View, Text } from "@tarojs/components";
import { PdDataPoint, PdMetadata } from "./usePdData";
import "./PdStatistics.scss";

interface PdStatisticsProps {
  pdData: PdDataPoint[];
  metadata: PdMetadata | null;
  viewMode: "day" | "week" | "month";
}

const PdStatistics: React.FC<PdStatisticsProps> = ({ pdData, metadata, viewMode }) => {
  // 获取腹透状态提醒
  const getPdStatusAlert = () => {
    if (!pdData || pdData.length === 0) {
      return null;
    }
    
    // 检查是否有负超滤量
    const hasNegativeUltrafiltration = pdData.some(item => item.ultrafiltration < 0);
    if (hasNegativeUltrafiltration) {
      return {
        message: "检测到负超滤量，请注意监测",
        type: "warning",
      };
    }
    
    // 检查是否有超高超滤量
    const hasHighUltrafiltration = pdData.some(item => item.ultrafiltration > 1000);
    if (hasHighUltrafiltration) {
      return {
        message: "检测到超高超滤量，请咨询医生",
        type: "warning",
      };
    }
    
    return {
      message: "腹透状况良好，请继续保持",
      type: "good",
    };
  };

  const alert = getPdStatusAlert();

  // 如果没有数据，显示空状态
  if (!pdData || pdData.length === 0) {
    return (
      <View className="pd-statistics">
        <View className="empty-state">
          <Text>暂无数据，无法生成统计信息</Text>
        </View>
      </View>
    );
  }

  // 计算透析液浓度分布
  const concentrationDistribution = useMemo(() => {
    const distribution = new Map<string, number>();
    
    pdData.forEach(item => {
      const concentration = item.dialysateType;
      if (concentration) {
        distribution.set(
          concentration, 
          (distribution.get(concentration) || 0) + 1
        );
      }
    });
    
    return Array.from(distribution.entries())
      .map(([type, count]) => ({
        type,
        count,
        percent: Math.round((count / pdData.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [pdData]);

  return (
    <View className="pd-statistics">
      {/* 卡片1: 腹透状态概览 */}
      <View className="pd-card status-card">
        <View className="card-header">
          <Text className="card-title">腹透统计分析</Text>
          <Text className="card-subtitle">
            {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}腹透概览
          </Text>
        </View>
        
        {alert && (
          <View className={`pd-alert ${alert.type}`}>
            <Text className="alert-message">{alert.message}</Text>
          </View>
        )}
        
        {/* 测量次数和数据可靠性 */}
        <View className="data-meta">
          <Text className="count-text">共{pdData.length}次测量</Text>
          {metadata && metadata.dataCoverage < 0.7 && (
            <Text className="reliability-text">
              数据覆盖: {Math.round(metadata.dataCoverage * 100)}% 
              {metadata.dataCoverage < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
      </View>

      {/* 卡片2: 透析液浓度分布 */}
      <View className="pd-card distribution-card">
        <Text className="card-title">透析液浓度分布</Text>
        <View className="distribution-list">
          {concentrationDistribution.map((item, index) => (
            <View key={index} className="distribution-item">
              <View className="distribution-color" style={{ backgroundColor: getConcentrationColor(item.type) }} />
              <Text className="distribution-label">{item.type}</Text>
              <Text className="distribution-value">{item.count}次</Text>
              <Text className="distribution-percent">
                {item.percent}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 卡片3: 腹透统计数据 */}
      <View className="pd-card stats-card">
        <Text className="card-title">腹透统计</Text>
        <View className="stats-grid">
          <View className="stats-item">
            <Text className="stats-label">平均超滤量</Text>
            <Text className="stats-value">{metadata?.averageUltrafiltration || 0}</Text>
            <Text className="stats-unit">ml</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">最大超滤量</Text>
            <Text className="stats-value">{metadata?.maxUltrafiltration || 0}</Text>
            <Text className="stats-unit">ml</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">最小超滤量</Text>
            <Text className="stats-value">{metadata?.minUltrafiltration || 0}</Text>
            <Text className="stats-unit">ml</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">平均引流量</Text>
            <Text className="stats-value">{metadata?.avgDrainageVolume || 0}</Text>
            <Text className="stats-unit">ml</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">最大引流量</Text>
            <Text className="stats-value">{metadata?.maxDrainageVolume || 0}</Text>
            <Text className="stats-unit">ml</Text>
          </View>
          <View className="stats-item">
            <Text className="stats-label">异常次数</Text>
            <Text className="stats-value">{metadata?.abnormalCount || 0}</Text>
            <Text className="stats-unit">次</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 根据透析液浓度获取颜色
const getConcentrationColor = (concentration: string): string => {
  const colors = {
    "1.5%": "#92A3FD",
    "2.5%": "#9DCEFF",
    "4.25%": "#C58BF2",
    "低钙": "#EEA4CE",
    "标准": "#ADE792",
    "高钙": "#FFCF86",
  };
  
  return colors[concentration] || "#CCCCCC";
};

export default PdStatistics; 