import React from "react";
import { View, Text, Image } from "@tarojs/components";
import { format, parseISO } from "date-fns";
import { PdDataPoint } from "./usePdData";
import "./AbnormalValues.scss";

interface AbnormalValuesProps {
  pdData: PdDataPoint[];
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({
  pdData,
  viewMode,
  isLoading = false
}) => {
  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      if (viewMode === "day") {
        return format(date, "HH:mm");
      } else {
        return format(date, "MM-dd HH:mm");
      }
    } catch (e) {
      console.error("日期格式化错误:", e);
      return timestamp;
    }
  };

  // 获取异常值
  const getAbnormalValues = () => {
    if (!pdData || pdData.length === 0) return [];

    return pdData.filter(item => {
      // 超滤量异常
      const isUltrafiltrationAbnormal = item.ultrafiltration < 0 || item.ultrafiltration > 1500;
      
      // 引流量异常
      const isDrainageAbnormal = item.drainageVolume < item.infusionVolume * 0.8 || 
                                item.drainageVolume > item.infusionVolume * 1.5;
      
      // 注入量异常
      const isInfusionAbnormal = item.infusionVolume < 500 || item.infusionVolume > 3000;
      
      return isUltrafiltrationAbnormal || isDrainageAbnormal || isInfusionAbnormal;
    });
  };

  // 获取异常描述
  const getAbnormalDescription = (item: PdDataPoint) => {
    const descriptions: string[] = [];
    
    // 超滤量异常
    if (item.ultrafiltration < 0) {
      descriptions.push("超滤量为负值");
    } else if (item.ultrafiltration > 1500) {
      descriptions.push("超滤量过高");
    }
    
    // 引流量异常
    if (item.drainageVolume < item.infusionVolume * 0.8) {
      descriptions.push("引流量不足");
    } else if (item.drainageVolume > item.infusionVolume * 1.5) {
      descriptions.push("引流量过多");
    }
    
    // 注入量异常
    if (item.infusionVolume < 500) {
      descriptions.push("注入量过少");
    } else if (item.infusionVolume > 3000) {
      descriptions.push("注入量过多");
    }
    
    return descriptions.join("，");
  };

  // 获取异常严重程度
  const getAbnormalSeverity = (item: PdDataPoint) => {
    // 超滤量严重异常
    if (item.ultrafiltration < -500 || item.ultrafiltration > 2000) {
      return "high";
    }
    
    // 引流量严重异常
    if (item.drainageVolume < item.infusionVolume * 0.5 || 
        item.drainageVolume > item.infusionVolume * 2) {
      return "high";
    }
    
    // 注入量严重异常
    if (item.infusionVolume < 300 || item.infusionVolume > 3500) {
      return "high";
    }
    
    return "medium";
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <View className="abnormal-values loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  // 如果没有数据，显示空状态
  if (!pdData || pdData.length === 0) {
    return (
      <View className="abnormal-values empty">
        <Text className="empty-text">暂无腹透数据</Text>
        <Text className="empty-hint">请先记录腹透数据</Text>
      </View>
    );
  }

  const abnormalValues = getAbnormalValues();

  // 如果没有异常值，显示正常状态
  if (abnormalValues.length === 0) {
    return (
      <View className="abnormal-values normal">
        <View className="normal-icon">
          {/*  */}
        </View>
        <Text className="normal-text">未检测到异常值</Text>
        <Text className="normal-hint">您的腹透数据正常，请继续保持</Text>
      </View>
    );
  }

  return (
    <View className="abnormal-values">
      <View className="abnormal-header">
        <View className="abnormal-title">
          异常值警报
          <Text className="abnormal-badge">{abnormalValues.length}</Text>
        </View>
        <Text className="abnormal-count">需要关注</Text>
      </View>
      
      <View className="abnormal-list">
        {abnormalValues.map((item, index) => {
          const severity = getAbnormalSeverity(item);
          return (
            <View 
              key={index} 
              className={`abnormal-item ${severity}`}
            >
              <View className="abnormal-icon">
                {/*  */}
              </View>
              <View className="abnormal-content">
                <Text className="abnormal-description">
                  {getAbnormalDescription(item)}
                </Text>
                <View className="abnormal-details">
                  <Text className="abnormal-time">{formatTime(item.timestamp)}</Text>
                  <Text className="abnormal-values-text">
                    超滤: {item.ultrafiltration}ml, 
                    引流: {item.drainageVolume}ml, 
                    注入: {item.infusionVolume}ml
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      
      <View className="abnormal-footer">
        <Text className="abnormal-tip">
          如有异常值，请咨询医生或调整透析方案
        </Text>
      </View>
    </View>
  );
};

export default AbnormalValues; 