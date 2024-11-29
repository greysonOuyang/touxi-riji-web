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
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (value && value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return value;
    }
    return useCurrentTime ? currentTime : "";
  });

  useEffect(() => {
    if (value && value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      setSelectedTime(value);
    }
  }, [value]);

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setSelectedTime(time);
    onChange?.(time);
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
