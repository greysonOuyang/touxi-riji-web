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
  useCurrentTime?: boolean; // 新增参数
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  label = "时间",
  showLabel = true,
  showArrowIcon = true,
  onChange,
  useCurrentTime = false, // 默认值为 false
}) => {
  const currentTime = dayjs().format("HH:mm");
  const [selectedTime, setSelectedTime] = useState<string>(
    value || (useCurrentTime ? currentTime : "")
  );

  useEffect(() => {
    if (value) {
      setSelectedTime(value);
    }
  }, [value]);

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setSelectedTime(time);
    onChange?.(time);
  };

  const pickerValue = selectedTime || currentTime; // 如果没有选择时间，使用当前时间作为默认值

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
