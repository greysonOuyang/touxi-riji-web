import React, { useState, useEffect } from "react";
import { View, Text, Picker } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";
import ArrowRight from "../ArrowRight";

interface TimePickerProps {
  value?: string;
  label?: string;
  showLabel?: boolean;
  showArrowIcon?: boolean;
  onChange?: (value: string) => void;
  useCurrentTime?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  label = "时间",
  showLabel = true,
  showArrowIcon = true,
  onChange,
  useCurrentTime = false,
}) => {
  const currentTime = dayjs().format("HH:mm");

  // 校验时间格式并初始化选中的时间
  const getValidTime = (time: string | undefined) => {
    if (time && time.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return time; // 返回有效的时间
    }
    return useCurrentTime ? currentTime : ""; // 如果不符合格式，返回当前时间或者空
  };

  const [selectedTime, setSelectedTime] = useState<string>(() =>
    getValidTime(value)
  );

  useEffect(() => {
    // 如果 value 变化，更新 selectedTime，确保状态一致
    setSelectedTime(getValidTime(value));
  }, [value]);

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setSelectedTime(time);
    onChange?.(time); // 传递选中的时间给父组件
  };

  const pickerValue = selectedTime || currentTime;

  return (
    <View className="time-picker">
      {showLabel && <Text className="label">{label}</Text>}
      <Picker mode="time" value={pickerValue} onChange={handleTimeChange}>
        <View className="value-wrapper">
          <View className="value">
            <Text>{selectedTime || "请选择时间"}</Text>
            {showArrowIcon && <ArrowRight />}
          </View>
        </View>
      </Picker>
    </View>
  );
};

export default TimePicker;
