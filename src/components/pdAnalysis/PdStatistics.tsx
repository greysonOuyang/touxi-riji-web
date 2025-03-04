import React, { useMemo } from "react";
import { View, Text, Image } from "@tarojs/components";
import { PdDataPoint, PdMetadata } from "./usePdData";
import "./PdStatistics.scss";

interface PdStatisticsProps {
  pdData: PdDataPoint[];
  metadata: PdMetadata | null;
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const PdStatistics: React.FC<PdStatisticsProps> = ({
  pdData,
  metadata,
  viewMode,
  isLoading = false
}) => {
  // 根据超滤量生成状态提示
  const getPdStatusAlert = (ultrafiltration: number) => {
    if (ultrafiltration < 0) {
      return {
        type: "warning",
        message: "超滤量为负值，请注意水钠潴留风险",
        icon: "warning"
      };
    } else if (ultrafiltration < 500) {
      return {
        type: "info",
        message: "超滤量偏低，请关注体重变化",
        icon: "info"
      };
    } else if (ultrafiltration > 1500) {
      return {
        type: "warning",
        message: "超滤量偏高，注意脱水风险",
        icon: "warning"
      };
    } else {
      return {
        type: "success",
        message: "超滤量在正常范围内",
        icon: "success"
      };
    }
  };

  // 计算透析液浓度分布
  const concentrationDistribution = useMemo(() => {
    if (!pdData || pdData.length === 0) return [];

    const distribution = new Map<string, number>();
    let total = 0;

    pdData.forEach(item => {
      const type = item.dialysateType || "未知";
      distribution.set(type, (distribution.get(type) || 0) + 1);
      total++;
    });

    return Array.from(distribution.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [pdData]);

  // 计算超滤效率
  const ultrafiltrationEfficiency = useMemo(() => {
    if (!metadata || !metadata.totalInfusionVolume || metadata.totalInfusionVolume === 0) {
      return 0;
    }
    return Math.round((metadata.totalUltrafiltration / metadata.totalInfusionVolume) * 100);
  }, [metadata]);

  // 计算平均每次超滤量
  const averageUltrafiltrationPerExchange = useMemo(() => {
    if (!metadata || !pdData || pdData.length === 0) {
      return 0;
    }
    return Math.round(metadata.totalUltrafiltration / pdData.length);
  }, [metadata, pdData]);

  // 计算每日平均超滤量
  const averageDailyUltrafiltration = useMemo(() => {
    if (!metadata || metadata.dataCoverage === 0) {
      return 0;
    }
    return Math.round(metadata.totalUltrafiltration / metadata.dataCoverage);
  }, [metadata]);

  // 生成健康建议
  const healthTips = useMemo(() => {
    if (!metadata) return [] as string[];

    const tips: string[] = [];

    // 根据超滤量给出建议
    if (metadata.averageUltrafiltration < 500) {
      tips.push("超滤量偏低，建议咨询医生是否需要调整透析方案");
    } else if (metadata.averageUltrafiltration > 1500) {
      tips.push("超滤量偏高，请注意是否存在脱水风险，保持适当水分摄入");
    }

    // 根据异常值数量给出建议
    if (metadata.abnormalCount > 0) {
      tips.push(`检测到${metadata.abnormalCount}次异常记录，请查看异常值详情并咨询医生`);
    }

    // 根据透析液类型分布给出建议
    if (concentrationDistribution.length === 1) {
      tips.push("建议在医生指导下尝试不同浓度的透析液，可能有助于提高超滤效果");
    }

    // 根据数据覆盖率给出建议
    if (metadata.dataCoverage < 7 && viewMode === "month") {
      tips.push("数据记录不完整，建议坚持每日记录腹透数据以便更准确评估治疗效果");
    }

    // 如果没有特别问题，给出鼓励性建议
    if (tips.length === 0) {
      tips.push("您的腹透数据表现良好，请继续保持当前的治疗方案");
    }

    return tips;
  }, [metadata, concentrationDistribution, viewMode]);

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="pd-statistics loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!pdData || pdData.length === 0 || !metadata) {
    return (
      <View className="pd-statistics empty">
        <Text className="empty-text">暂无腹透数据</Text>
        <Text className="empty-hint">请先记录腹透数据</Text>
      </View>
    );
  }

  // 获取状态提示
  const statusAlert = getPdStatusAlert(metadata.averageUltrafiltration);

  return (
    <View className="pd-statistics">
      <View className="statistics-header">
        <Text className="statistics-subtitle">
          {viewMode === "day" && "今日统计"}
          {viewMode === "week" && "本周统计"}
          {viewMode === "month" && "本月统计"}
        </Text>
      </View>

      {/* 状态提示卡片 */}
      <View className={`status-card ${statusAlert.type}`}>
        <View className="status-icon">
          <Image 
            className="icon" 
            src={`/assets/icons/${statusAlert.icon}.png`} 
            mode="aspectFit" 
          />
        </View>
        <View className="status-content">
          <Text className="status-title">腹透状态</Text>
          <Text className="status-message">{statusAlert.message}</Text>
        </View>
      </View>

      {/* 总体统计卡片 */}
      <View className="statistics-card">
        <Text className="card-title">总体统计</Text>
        <View className="statistics-grid">
          <View className="statistics-item">
            <Text className="item-value">{metadata.totalUltrafiltration}</Text>
            <Text className="item-label">总超滤量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.totalDrainageVolume}</Text>
            <Text className="item-label">总引流量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.totalInfusionVolume}</Text>
            <Text className="item-label">总注入量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{pdData.length}</Text>
            <Text className="item-label">记录次数</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.dataCoverage}</Text>
            <Text className="item-label">覆盖天数</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{ultrafiltrationEfficiency}%</Text>
            <Text className="item-label">超滤效率</Text>
          </View>
        </View>
      </View>

      {/* 透析液浓度分布卡片 */}
      {concentrationDistribution.length > 0 && (
        <View className="statistics-card">
          <Text className="card-title">透析液浓度分布</Text>
          <View className="concentration-distribution">
            {concentrationDistribution.map((item, index) => (
              <View className="concentration-item" key={index}>
                <View className="concentration-bar-container">
                  <View 
                    className="concentration-bar" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </View>
                <View className="concentration-info">
                  <Text className="concentration-type">{item.type}</Text>
                  <Text className="concentration-percentage">{item.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 超滤量统计卡片 */}
      <View className="statistics-card">
        <Text className="card-title">超滤量统计</Text>
        <View className="statistics-grid">
          <View className="statistics-item">
            <Text className="item-value">{metadata.averageUltrafiltration}</Text>
            <Text className="item-label">平均超滤量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.maxUltrafiltration}</Text>
            <Text className="item-label">最大超滤量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.minUltrafiltration}</Text>
            <Text className="item-label">最小超滤量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{averageUltrafiltrationPerExchange}</Text>
            <Text className="item-label">平均每次超滤(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{averageDailyUltrafiltration}</Text>
            <Text className="item-label">日均超滤量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.abnormalCount}</Text>
            <Text className="item-label">异常值数量</Text>
          </View>
        </View>
      </View>

      {/* 健康建议卡片 */}
      <View className="statistics-card">
        <Text className="card-title">健康建议</Text>
        <View className="health-tips">
          {healthTips.map((tip, index) => (
            <View className="health-tip" key={index}>
              <View className="tip-bullet" />
              <Text className="tip-text">{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default PdStatistics; 