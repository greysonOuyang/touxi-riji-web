import React, { useMemo } from "react";
import { View, Text } from "@tarojs/components";
import { format, parseISO } from "date-fns";
import { UrineDataPoint, getUrineVolumeStatus, NORMAL_VOLUME_RANGE } from "./useUrineData";
import "./index.scss";

interface AbnormalValuesProps {
  urineData: UrineDataPoint[];
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

interface AbnormalRecord {
  timestamp: string;
  formattedTime: string;
  volume: number;
  reason: string;
  status: "low" | "high";
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ urineData, viewMode, isLoading = false }) => {
  // 筛选异常值
  const abnormalRecords = useMemo(() => {
    if (!urineData || urineData.length === 0) return [];
    
    const records: AbnormalRecord[] = [];
    
    urineData.forEach(item => {
      // 检查尿量是否异常
      const volumeStatus = getUrineVolumeStatus(item.volume);
      if (volumeStatus === "low" || volumeStatus === "high") {
        try {
          const date = parseISO(item.timestamp);
          records.push({
            timestamp: item.timestamp,
            formattedTime: format(date, "MM-dd HH:mm"),
            volume: item.volume,
            reason: volumeStatus === "low" 
              ? `尿量偏低 (${item.volume}ml < ${NORMAL_VOLUME_RANGE.MIN_SINGLE}ml)` 
              : `尿量偏高 (${item.volume}ml > ${NORMAL_VOLUME_RANGE.MAX_SINGLE}ml)`,
            status: volumeStatus
          });
        } catch (error) {
          console.error("解析异常值时间出错:", error, item);
        }
      }
    });
    
    // 按时间排序，最近的记录在前面
    return records.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [urineData]);
  
  // 计算异常值统计
  const abnormalStats = useMemo(() => {
    const total = abnormalRecords.length;
    const lowCount = abnormalRecords.filter(r => r.status === "low").length;
    const highCount = abnormalRecords.filter(r => r.status === "high").length;
    
    return {
      total,
      lowCount,
      highCount,
      lowPercentage: Math.round((lowCount / total) * 100),
      highPercentage: Math.round((highCount / total) * 100)
    };
  }, [abnormalRecords]);
  
  // 如果没有异常值，显示正常提示
  if (abnormalRecords.length === 0) {
    return (
      <View className="abnormal-values">
        <Text className="section-title">异常值分析</Text>
        <View className="no-abnormal">
          <Text>未检测到异常值，尿量状况良好</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="abnormal-values">
      <Text className="section-title">异常值分析</Text>
      
      {/* 异常值统计 */}
      <View className="abnormal-stats">
        <View className="stats-item">
          <Text className="stats-value">{abnormalStats.total}</Text>
          <Text className="stats-label">异常记录</Text>
        </View>
        {abnormalStats.lowCount > 0 && (
          <View className="stats-item low">
            <Text className="stats-value">{abnormalStats.lowCount}</Text>
            <Text className="stats-label">尿量偏低</Text>
            <Text className="stats-percentage">({abnormalStats.lowPercentage}%)</Text>
          </View>
        )}
        {abnormalStats.highCount > 0 && (
          <View className="stats-item high">
            <Text className="stats-value">{abnormalStats.highCount}</Text>
            <Text className="stats-label">尿量偏高</Text>
            <Text className="stats-percentage">({abnormalStats.highPercentage}%)</Text>
          </View>
        )}
      </View>
      
      {/* 异常提示说明 */}
      <View className="abnormal-note">
        <Text className="note-text">尿量异常可能与多种因素有关，如饮水量、药物、疾病等。请遵医嘱调整，必要时咨询医生。</Text>
      </View>
      
      {/* 异常记录列表标题 */}
      <View className="list-header">
        <Text className="list-title">异常记录详情</Text>
        <Text className="list-count">共 {abnormalRecords.length} 条</Text>
      </View>
      
      {/* 异常记录列表 */}
      <View className="abnormal-list">
        {abnormalRecords.map((record, index) => (
          <View className={`abnormal-item ${record.status}`} key={index}>
            <View className="left-content">
              <Text className="time">{record.formattedTime}</Text>
              <Text className="reason">{record.reason}</Text>
            </View>
            <View className="right-content">
              <Text className="value">{record.volume} ml</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AbnormalValues; 