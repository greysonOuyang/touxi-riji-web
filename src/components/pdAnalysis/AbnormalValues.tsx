import React from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import { format, parseISO } from "date-fns";
import { PdDataPoint } from "./usePdData";
import "./AbnormalValues.scss";

interface AbnormalValuesProps {
  pdData: PdDataPoint[];
  viewMode: "day" | "week" | "month";
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ pdData = [], viewMode }) => {
  // 添加默认值并检查pdData是否存在
  if (!pdData || !Array.isArray(pdData)) {
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
  const abnormalValues = pdData
    .filter(item => {
      if (!item || !item.hasMeasurement) return false;
      
      // 超滤量异常判断逻辑
      return item.ultrafiltration < 0 || item.ultrafiltration > 1000;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5); // 最多显示5条
  
  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return "未知时间";
    }
  };
  
  // 如果没有异常值，显示正常状态
  if (abnormalValues.length === 0) {
    return (
      <View className="abnormal-values">
        <View className="abnormal-card">
          <Text className="card-title">异常数值提醒</Text>
          <View className="normal-status">
            <AtIcon value="check-circle" size="16" color="#4CAF50" />
            <Text className="normal-text">未检测到异常超滤量</Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View className="abnormal-values">
      <View className="abnormal-card">
        <Text className="card-title">异常数值提醒</Text>
        <View className="abnormal-list">
          {abnormalValues.map((item, index) => (
            <View key={index} className="abnormal-item">
              <View className="abnormal-icon">
                <AtIcon value="alert-circle" size="16" color="#FF8A8A" />
              </View>
              <View className="abnormal-content">
                <Text className="abnormal-message">
                  {item.ultrafiltration < 0 
                    ? "超滤量为负值" 
                    : item.ultrafiltration > 1000 
                      ? "超滤量过高" 
                      : "异常超滤量"}
                </Text>
                <Text className="abnormal-value">{item.ultrafiltration} ml</Text>
              </View>
              <View className="abnormal-time">
                <Text className="time-text">
                  {format(parseISO(item.date), "MM-dd")} {formatTime(item.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default AbnormalValues; 