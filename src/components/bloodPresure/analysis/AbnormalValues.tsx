import React, { useState, useMemo } from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils"
import { format, isValid } from "date-fns"
import { BpTrendData } from "@/api/bloodPressureApi"

interface AbnormalValuesProps {
  data?: BpTrendData[];
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ data = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MM-dd HH:mm');
    } catch (e) {
      console.error('时间格式化错误:', e);
      return timestamp;
    }
  };
  
  // 计算异常项
  const abnormalItems = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 只处理有实际测量数据的点
    return data
      .filter(item => {
        // 确保有测量数据
        if (!item.hasMeasurement) return false;
        
        // 确保有有效的血压值
        if (!item.systolic || !item.diastolic) return false;
        
        // 获取血压分类
        const category = getBPCategory(item.systolic, item.diastolic);
        
        // 如果是正常或偏高正常，则不是异常
        return category.name !== 'NORMAL' && category.name !== 'ELEVATED';
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data]);
  
  // 切换展开/折叠
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // 要显示的项目
  const displayedItems = useMemo(() => {
    return isExpanded ? abnormalItems : abnormalItems.slice(0, 3);
  }, [abnormalItems, isExpanded]);
  
  if (abnormalItems.length === 0) {
    return null; // 没有异常数据时不显示组件
  }
  
  return (
    <View className="abnormal-values">
      <View className="title-row">
        <Text className="title">异常数值提醒</Text>
        {abnormalItems.length > 3 && (
          <Text className="toggle-button" onClick={toggleExpand}>
            {isExpanded ? '收起' : `查看更多(${abnormalItems.length})`}
          </Text>
        )}
      </View>
      
      {displayedItems.map((item, index) => {
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
  );
};

export default AbnormalValues; 