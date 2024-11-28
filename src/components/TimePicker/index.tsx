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
      <Picker mode="time" value={selectedTime} onChange={handleTimeChange}>
        <View className="value-wrapper">
          <View className="value">
            <Text>{selectedTime}</Text>
            {showArrowIcon && <ArrowRight />}
          </View>
        </View>
      </Picker>
    </View>
  );
};

export default TimePicker;
