import React, { useMemo } from "react";
import { View, Text } from "@tarojs/components";
import { format, parseISO } from "date-fns";
import { UrineDataPoint, NORMAL_VOLUME_RANGE } from "./useUrineData";
import "./index.scss";

interface AbnormalValuesProps {
  urineData: UrineDataPoint[];
  viewMode: "day" | "week" | "month";
  baselineVolume?: number;
  isLoading?: boolean;
}

// 尿量类型定义
interface UrineVolumeCategory {
  type: "anuria" | "oliguria" | "normal" | "polyuria" | "baseline_low" | "baseline_high";
  label: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

const UrineVolumeDistribution: React.FC<AbnormalValuesProps> = ({ 
  urineData, 
  viewMode, 
  baselineVolume,
  isLoading = false 
}) => {
  // 分析尿量分布
  const { volumeCategories } = useMemo(() => {
    if (!urineData || urineData.length === 0) {
      return { volumeCategories: [] };
    }
    
    // 按日期分组计算每日总尿量
    const dailyVolumes: Record<string, number> = {};
    urineData.forEach(item => {
      const day = item.date;
      if (!dailyVolumes[day]) {
        dailyVolumes[day] = 0;
      }
      dailyVolumes[day] += item.volume;
    });
    
    // 初始化各类别计数
    const categories: Record<string, UrineVolumeCategory> = {
      anuria: {
        type: "anuria",
        label: "无尿",
        count: 0,
        percentage: 0,
        color: "#ff4d4f",
        description: "日尿量<100ml，属于无尿，如有需要，请咨询医生"
      },
      oliguria: {
        type: "oliguria",
        label: "少尿",
        count: 0,
        percentage: 0,
        color: "#faad14",
        description: "日尿量<400ml，属于少尿，如有需要，请咨询医生"
      },
      normal: {
        type: "normal",
        label: "正常",
        count: 0,
        percentage: 0,
        color: "#52c41a",
        description: "日尿量在400-1000ml之间，属于尿毒症患者的正常范围"
      },
      polyuria: {
        type: "polyuria",
        label: "多尿",
        count: 0,
        percentage: 0,
        color: "#1890ff",
        description: "日尿量>1000ml，对尿毒症患者来说可能偏高"
      }
    };
    
    // 如果有基线尿量，添加基线相关类别
    if (baselineVolume && baselineVolume > 0) {
      categories.baseline_low = {
        type: "baseline_low",
        label: "低于基线",
        count: 0,
        percentage: 0,
        color: "#ffa39e",
        description: `日尿量显著低于您的参考基线(${Math.round(baselineVolume)}ml)的50%`
      };
      
      categories.baseline_high = {
        type: "baseline_high",
        label: "高于基线",
        count: 0,
        percentage: 0,
        color: "#91caff",
        description: `日尿量显著高于您的参考基线(${Math.round(baselineVolume)}ml)的150%`
      };
    }
    
    // 分析每日尿量
    Object.entries(dailyVolumes).forEach(([date, volume]) => {
      let category: UrineVolumeCategory["type"] = "normal";
      
      // 判断尿量类别
      if (volume < NORMAL_VOLUME_RANGE.MIN) {
        category = "anuria";
      } else if (volume < 400) {
        category = "oliguria";
      } else if (volume > NORMAL_VOLUME_RANGE.MAX) {
        category = "polyuria";
      } else {
        category = "normal";
      }
      
      // 如果有基线尿量，优先考虑与基线的比较
      if (baselineVolume && baselineVolume > 0) {
        if (volume < baselineVolume * 0.5) {
          category = "baseline_low";
        } else if (volume > baselineVolume * 1.5) {
          category = "baseline_high";
        }
      }
      
      // 增加类别计数
      categories[category].count++;
    });
    
    // 计算百分比
    const totalDays = Object.keys(dailyVolumes).length;
    if (totalDays > 0) {
      Object.values(categories).forEach(category => {
        category.percentage = Math.round((category.count / totalDays) * 100);
      });
    }
    
    // 按计数排序并过滤掉计数为0的类别
    const sortedCategories = Object.values(categories)
      .filter(category => category.count > 0)
      .sort((a, b) => b.count - a.count);
    
    return { 
      volumeCategories: sortedCategories
    };
  }, [urineData, viewMode, baselineVolume]);
  
  // 如果没有数据，显示空状态
  if (!urineData || urineData.length === 0) {
    return (
      <View className="urine-volume-distribution">
        <Text className="section-title">尿量分布分析</Text>
        <View className="no-data">
          <Text>暂无尿量数据</Text>
        </View>
      </View>
    );
  }
  
  // 如果所有尿量都正常，显示正常状态
  if (volumeCategories.length === 1 && volumeCategories[0].type === "normal") {
    return (
      <View className="urine-volume-distribution">
        <Text className="section-title">尿量分布分析</Text>
        <View className="normal-status">
          <View className="status-icon normal"></View>
          <Text className="status-text">所有记录的尿量均在正常范围内</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="urine-volume-distribution">
      <Text className="section-title">尿量分布分析</Text>
      
      {/* 分布图表 */}
      <View className="distribution-chart">
        {volumeCategories.map((category, index) => (
          <View className="chart-item" key={index}>
            <View className="chart-bar-container">
              <View 
                className="chart-bar" 
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color
                }}
              />
            </View>
            <View className="chart-label">
              <View className="label-dot" style={{ backgroundColor: category.color }}></View>
              <Text className="label-text">{category.label}</Text>
              <Text className="label-count">{category.count}天</Text>
              <Text className="label-percentage">({category.percentage}%)</Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* 分布说明 */}
      <View className="distribution-legend">
        {volumeCategories.map((category, index) => (
          <View className="legend-item" key={index}>
            <View className="legend-dot" style={{ backgroundColor: category.color }}></View>
            <Text className="legend-text">{category.description}</Text>
          </View>
        ))}
      </View>
      
      {/* 提示说明 */}
      <View className="distribution-note">
        <Text className="note-text">
          尿毒症患者应特别关注尿量变化。无尿(&lt;100ml/天) 需咨询医生评估肾功能；少尿(&lt;400ml/天)需咨询医生评估肾功能；
          正常范围(400-1000ml/天)；多尿(&gt;1000ml/天)可能需要调整治疗。具体情况请遵医嘱。
        </Text>
      </View>
    </View>
  );
};

export default UrineVolumeDistribution; 