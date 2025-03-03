import React from "react";
import { View, Text } from "@tarojs/components";
import { format } from "date-fns";
import "./DateNavigator.scss";

interface DateNavigatorProps {
  currentDate: Date;
  mode: "day" | "week" | "month";
  onNavigate: (direction: "prev" | "next") => void;
  onReset: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  mode,
  onNavigate,
  onReset
}) => {
  // 格式化日期显示
  const getFormattedDate = () => {
    if (mode === "day") {
      return format(currentDate, "yyyy年MM月dd日");
    } else if (mode === "week") {
      // 获取周的开始和结束日期
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      // 如果开始和结束日期在同一个月
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${format(startOfWeek, "yyyy年MM月dd日")} - ${format(endOfWeek, "dd日")}`;
      } else if (startOfWeek.getFullYear() === endOfWeek.getFullYear()) {
        return `${format(startOfWeek, "yyyy年MM月dd日")} - ${format(endOfWeek, "MM月dd日")}`;
      } else {
        return `${format(startOfWeek, "yyyy年MM月dd日")} - ${format(endOfWeek, "yyyy年MM月dd日")}`;
      }
    } else {
      return format(currentDate, "yyyy年MM月");
    }
  };

  return (
    <View className="date-navigator">
      <View className="date-controls">
        <View className="date-arrow" onClick={() => onNavigate("prev")}>
          <View className="arrow-icon">
            <Text className="iconfont icon-left"></Text>
          </View>
        </View>
        
        <View className="date-arrow" onClick={() => onNavigate("next")}>
          <View className="arrow-icon">
            <Text className="iconfont icon-right"></Text>
          </View>
        </View>
      </View>
      
      <View className="date-display">
        <Text className="date-text">{getFormattedDate()}</Text>
      </View>
      
      <View className="date-reset" onClick={onReset}>
        <Text className="reset-text">今天</Text>
      </View>
    </View>
  );
};

export default DateNavigator; 