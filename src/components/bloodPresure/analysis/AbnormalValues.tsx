import React from "react";
import { View, Text } from "@tarojs/components";
import { BpTrendData } from "@/api/bloodPressureApi";
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils";
import "./AbnormalValues.scss";

interface AbnormalValuesProps {
  bpData: BpTrendData[];
  viewMode: "day" | "week" | "month";
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ bpData = [], viewMode }) => {
  // 添加默认值并检查bpData是否存在
  if (!bpData || !Array.isArray(bpData)) {
    return (
      <View className="abnormal-values">
        <View className="abnormal-card">
          <Text className="card-title">异常数值提醒</Text>
          <View className="empty-abnormal">
            <Text className="empty-text">暂无数据</Text>
          </View>
        </View>
      </View>
    );
  }
  
  // 筛选异常值
  const abnormalValues = bpData
    .filter(item => {
      if (!item || !item.hasMeasurement) return false;
      
      const category = getBPCategory(item.systolic, item.diastolic);
      return (
        category === BP_CATEGORIES.HYPERTENSION_1 ||
        category === BP_CATEGORIES.HYPERTENSION_2 ||
        category === BP_CATEGORIES.HYPERTENSION_CRISIS ||
        category === BP_CATEGORIES.LOW
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // 最多显示5条
  
  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return "未知时间";
    }
  };
  
  // 获取异常描述
  const getAbnormalDescription = (systolic: number, diastolic: number) => {
    const category = getBPCategory(systolic, diastolic);
    
    if (category === BP_CATEGORIES.HYPERTENSION_CRISIS) {
      return "血压极高，请立即就医";
    } else if (category === BP_CATEGORIES.HYPERTENSION_2) {
      return "血压显著升高，建议咨询医生";
    } else if (category === BP_CATEGORIES.HYPERTENSION_1) {
      return "血压轻度升高，请注意监测";
    } else if (category === BP_CATEGORIES.LOW) {
      return "血压低于正常范围，请注意监测";
    }
    
    return "血压异常";
  };
  
  return (
    <View className="abnormal-values">
      <View className="abnormal-card">
        <Text className="card-title">异常数值提醒</Text>
        
        {abnormalValues.length > 0 ? (
          <View className="abnormal-list">
            {abnormalValues.map((item, index) => (
              <View key={index} className="abnormal-item">
                <View className="abnormal-content">
                  <Text className="abnormal-title">
                    {item.systolic}/{item.diastolic} mmHg
                  </Text>
                  <Text className="abnormal-description">
                    {getAbnormalDescription(item.systolic, item.diastolic)}
                  </Text>
                  <Text className="abnormal-time">
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-abnormal">
            <Text className="empty-text">
              {viewMode === "day" ? "今日" : viewMode === "week" ? "本周" : "本月"}暂无异常数值
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AbnormalValues; 