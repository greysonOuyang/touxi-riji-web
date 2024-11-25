import React, { useState, useEffect } from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";

interface TimePickerProps {
  label?: string; // 自定义的 label 名称
  showLabel?: boolean; // 是否显示 label
  showClockIcon?: boolean; // 是否显示时钟图标
  showArrowIcon?: boolean; // 是否显示箭头图标
  onTimeChange?: (value: string) => void; // 时间更改的回调
}

const TimePicker: React.FC<TimePickerProps> = ({
  label = "时间",
  showLabel = true,
  showClockIcon = true,
  showArrowIcon = true,
  onTimeChange,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>("");

  // 设置默认时间为当前时间
  useEffect(() => {
    const currentTime = dayjs().format("HH:mm");
    setSelectedTime(currentTime);
  }, []);

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setSelectedTime(time);
    onTimeChange?.(time);
  };

  return (
    <View className="time-container">
      {showLabel && <Text className="time-label">{label}</Text>}
      <Picker mode="time" value={selectedTime} onChange={handleTimeChange}>
        <View className="picker">
          {showClockIcon && (
            <Image
              className="clock-icon"
              src="/assets/icons/clock.png"
              mode="aspectFit"
            />
          )}
          <Text className="selected-time">{selectedTime}</Text>
          {showArrowIcon && (
            <Image
              className="arrow-icon"
              src="../../assets/icons/right_arrow.png"
              mode="aspectFit"
            />
          )}
        </View>
      </Picker>
    </View>
  );
};

export default TimePicker;
