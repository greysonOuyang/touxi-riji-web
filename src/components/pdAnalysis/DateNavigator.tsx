import React from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
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
  // 根据不同模式格式化日期显示
  const getFormattedDate = () => {
    if (mode === "day") {
      return format(currentDate, "yyyy年MM月dd日");
    } else if (mode === "week") {
      return `${format(currentDate, "yyyy年MM月dd日")} 这一周`;
    } else {
      return format(currentDate, "yyyy年MM月");
    }
  };

  return (
    <View className="date-navigator">
      <View className="nav-button prev" onClick={() => onNavigate("prev")}>
        <AtIcon value="chevron-left" size="16" color="#666" />
      </View>
      
      <View className="date-display" onClick={onReset}>
        <Text>{getFormattedDate()}</Text>
        <View className="today-indicator">点击回到今天</View>
      </View>
      
      <View className="nav-button next" onClick={() => onNavigate("next")}>
        <AtIcon value="chevron-right" size="16" color="#666" />
      </View>
    </View>
  );
};

export default DateNavigator; 