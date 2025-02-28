import React from "react";
import { View, Text } from "@tarojs/components";
import { format } from "date-fns";
import "./DateNavigator.scss";

interface DateNavigatorProps {
  mode: "day" | "week" | "month";
  currentDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
  onReset: () => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  mode,
  currentDate,
  onNavigate,
  onReset,
}) => {
  // 获取日期显示文本
  const getDateDisplayText = () => {
    if (mode === "day") {
      return format(currentDate, "yyyy年MM月dd日");
    } else if (mode === "week") {
      return `${format(currentDate, "yyyy年MM月")} 第${Math.ceil(currentDate.getDate() / 7)}周`;
    } else {
      return format(currentDate, "yyyy年MM月");
    }
  };
  
  return (
    <View className="date-navigator">
      <View className="navigator-arrow" onClick={() => onNavigate("prev")}>
        <View className="arrow-icon left"></View>
      </View>
      
      <View className="date-display">
        <Text className="date-value">{getDateDisplayText()}</Text>
        <Text className="date-reset" onClick={onReset}>返回今天</Text>
      </View>
      
      <View className="navigator-arrow" onClick={() => onNavigate("next")}>
        <View className="arrow-icon right"></View>
      </View>
    </View>
  );
};

export default DateNavigator; 