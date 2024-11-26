import React, { useState, useEffect } from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";

interface TimePickerProps {
  value?: string; // 当前选中的时间（外部传入）
  label?: string; // 自定义的 label 名称
  showLabel?: boolean; // 是否显示 label
  showClockIcon?: boolean; // 是否显示时钟图标
  showArrowIcon?: boolean; // 是否显示箭头图标
  onChange?: (value: string) => void; // 时间变化的回调
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  label = "时间",
  showLabel = true,
  showClockIcon = true,
  showArrowIcon = true,
  onChange,
}) => {
  const [selectedTime, setSelectedTime] = useState<string>(
    value || dayjs().format("HH:mm")
  );

  useEffect(() => {
    // 如果外部传入的 value 改变，更新组件内部的 selectedTime
    if (value) {
      setSelectedTime(value);
    }
  }, [value]);

  const handleTimeChange = (e) => {
    const time = e.detail.value;
    setSelectedTime(time);
    onChange?.(time); // 调用父组件传入的回调
  };

  return (
    <View className="time-picker">
      {showLabel && <Text className="label">{label}</Text>}
      <Picker mode="time" value={selectedTime} onChange={handleTimeChange}>
        <View className="picker-wrapper">
          {showClockIcon && (
            <Image
              className="clock-icon"
              src="/assets/icons/clock.png"
              mode="aspectFit"
            />
          )}
          <Text>{selectedTime}</Text>
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
