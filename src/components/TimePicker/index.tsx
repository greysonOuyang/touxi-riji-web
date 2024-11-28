import React, { useState, useEffect } from "react";
import { View, Text, Picker } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss"; // 引入样式
import ArrowRight from "../ArrowRight";

interface TimePickerProps {
  value?: string; // 当前选中的时间（外部传入）
  label?: string; // 自定义的 label 名称
  showLabel?: boolean; // 是否显示 label
  showArrowIcon?: boolean; // 是否显示箭头图标
  onChange?: (value: string) => void; // 时间变化的回调
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  label = "时间",
  showLabel = true,
  showArrowIcon = true,
  onChange,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>(
    value || dayjs().format("HH:mm")
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

  return (
    <View className="time-picker">
      {showLabel && <Text className="label">{label}</Text>}

      <View className="value-wrapper">
        <Picker
          mode="time"
          value={selectedTime}
          onChange={handleTimeChange}
        ></Picker>
        <View className="value">
          <Text>{selectedTime}</Text>
          {showArrowIcon && <ArrowRight />}
        </View>
      </View>
    </View>
  );
};

export default TimePicker;
