import React from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils"
import { format, isValid } from "date-fns"

interface AbnormalValuesProps {
  data?: any[]
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return null
  }

  // 筛选异常数据，并按照严重程度排序
  const abnormalItems = data
    .filter(item => {
      const category = getBPCategory(item.systolic, item.diastolic)
      return (
        category === BP_CATEGORIES.HYPERTENSION_1 ||
        category === BP_CATEGORIES.HYPERTENSION_2 ||
        category === BP_CATEGORIES.HYPERTENSION_CRISIS ||
        category === BP_CATEGORIES.LOW ||
        (item.heartRate && (item.heartRate < 60 || item.heartRate > 100))
      )
    })
    .sort((a, b) => {
      // 获取血压分类
      const categoryA = getBPCategory(a.systolic, a.diastolic)
      const categoryB = getBPCategory(b.systolic, b.diastolic)
      
      // 定义严重程度顺序
      const severityOrder = {
        [BP_CATEGORIES.HYPERTENSION_CRISIS.name]: 1,
        [BP_CATEGORIES.HYPERTENSION_2.name]: 2,
        [BP_CATEGORIES.HYPERTENSION_1.name]: 3,
        [BP_CATEGORIES.LOW.name]: 4,
        [BP_CATEGORIES.ELEVATED.name]: 5,
        [BP_CATEGORIES.NORMAL.name]: 6
      }
      
      // 按严重程度排序
      return severityOrder[categoryA.name] - severityOrder[categoryB.name]
    })

  if (abnormalItems.length === 0) {
    return null
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return "未知时间";
      
      // 检查是否已经是格式化的时间字符串 (如 "12:30")
      if (/^\d{1,2}:\d{2}$/.test(timestamp)) {
        return timestamp;
      }
      
      // 检查是否已经是格式化的日期字符串 (如 "02/23")
      if (/^\d{1,2}\/\d{1,2}$/.test(timestamp)) {
        return timestamp;
      }
      
      // 尝试解析为日期对象
      const date = new Date(timestamp);
      
      // 检查日期是否有效
      if (isValid(date)) {
        return format(date, 'MM-dd HH:mm');
      }
      
      return timestamp;
    } catch (error) {
      console.error("时间格式化错误:", error);
      return timestamp;
    }
  };

  return (
    <View className="abnormal-values">
      <Text className="title">异常数值提醒</Text>
      {abnormalItems.map((item, index) => {
        const category = getBPCategory(item.systolic, item.diastolic);
        return (
          <View key={index} className={`abnormal-item ${(category.name || '').toLowerCase().replace('_', '-')}`}>
            <View className="abnormal-header">
              <Text className="abnormal-time">{formatTimestamp(item.timestamp)}</Text>
              <Text className="abnormal-category" style={{ color: category.color }}>
                {category.name}
              </Text>
            </View>
            <View className="abnormal-details">
              <Text className="abnormal-value">收缩压: <Text className="value">{item.systolic}</Text> mmHg</Text>
              <Text className="abnormal-value">舒张压: <Text className="value">{item.diastolic}</Text> mmHg</Text>
              {item.heartRate && (
                <Text className="abnormal-value">
                  心率: <Text className="value">{item.heartRate}</Text> bpm
                  {(item.heartRate < 60 || item.heartRate > 100) && (
                    <Text className="abnormal-indicator"> {item.heartRate < 60 ? '偏低' : '偏高'}</Text>
                  )}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  )
}

export default AbnormalValues 