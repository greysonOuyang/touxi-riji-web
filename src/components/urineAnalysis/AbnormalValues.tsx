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
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ urineData, viewMode, isLoading = false }) => {
  // 筛选异常值
  const abnormalRecords = useMemo(() => {
    if (!urineData || urineData.length === 0) return [];
    
    const records: AbnormalRecord[] = [];
    
    urineData.forEach(item => {
      let isAbnormal = false;
      let reason = "";
      
      // 检查尿量是否异常
      const volumeStatus = getUrineVolumeStatus(item.volume);
      if (volumeStatus === "low") {
        isAbnormal = true;
        reason = `尿量偏低 (${item.volume}ml < ${NORMAL_VOLUME_RANGE.MIN_SINGLE}ml)`;
      } else if (volumeStatus === "high") {
        isAbnormal = true;
        reason = `尿量偏高 (${item.volume}ml > ${NORMAL_VOLUME_RANGE.MAX_SINGLE}ml)`;
      }
      
      if (isAbnormal) {
        const date = parseISO(item.timestamp);
        records.push({
          timestamp: item.timestamp,
          formattedTime: format(date, "MM-dd HH:mm"),
          volume: item.volume,
          reason
        });
      }
    });
    
    // 按时间排序，最近的记录在前面
    return records.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [urineData]);
  
  // 如果没有异常值，显示正常提示
  if (abnormalRecords.length === 0) {
    return (
      <View className="abnormal-values">
        <Text className="section-title">异常值分析</Text>
        <Text className="no-abnormal">未检测到异常值，尿量状况良好</Text>
      </View>
    );
  }
  
  return (
    <View className="abnormal-values">
      <Text className="section-title">异常值分析</Text>
      <View className="abnormal-note">
        <Text className="note-text">尿量异常可能与多种因素有关，请遵医嘱调整，必要时咨询医生</Text>
      </View>
      <View className="abnormal-list">
        {abnormalRecords.map((record, index) => (
          <View className="abnormal-item" key={index}>
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