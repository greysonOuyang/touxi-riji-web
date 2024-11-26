import React from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";
import ArrowRight from "../ArrowRight";

interface TimeSelectorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  allowFuture?: boolean;
  showLabel?: boolean; // 新增的属性
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label = "时间",
  value,
  onChange,
  allowFuture = false,
  showLabel = true, // 默认值为 true
}) => {
  const currentDate = dayjs();

  const generateDateTimeOptions = () => {
    const maxDays = allowFuture ? 365 : 30;
    const days: string[] = [];
    const today = currentDate.startOf("day");

    for (let i = 0; i <= maxDays; i++) {
      const date = today.subtract(maxDays - i, "day");
      days.push(date.format("MM月DD日"));
    }

    const hours = Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}时`
    );
    const minutes = Array.from(
      { length: 60 },
      (_, i) => `${i.toString().padStart(2, "0")}分`
    );

    return [days, hours, minutes];
  };

  const handleChange = (e) => {
    const [dayIndex, hourIndex, minuteIndex] = e.detail.value;
    const daysColumn = generateDateTimeOptions()[0];
    const hoursColumn = generateDateTimeOptions()[1];
    const minutesColumn = generateDateTimeOptions()[2];

    const selectedDate = dayjs()
      .month(parseInt(daysColumn[dayIndex].split("月")[0]) - 1)
      .date(parseInt(daysColumn[dayIndex].split("月")[1]))
      .hour(Number(hoursColumn[hourIndex].replace("时", "")))
      .minute(Number(minutesColumn[minuteIndex].replace("分", "")));

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
  };

  const dateTimeOptions = generateDateTimeOptions();
  const currentValue = value ? dayjs(value) : dayjs();

  return (
    <View className="time-selector">
      {showLabel && <Text className="label">{label}</Text>}{" "}
      {/* 根据 showLabel 控制显示 */}
      <View className="value-wrapper">
        <Picker
          mode="multiSelector"
          range={dateTimeOptions}
          value={[
            dateTimeOptions[0].findIndex(
              (item) => item === currentValue.format("MM月DD日")
            ),
            currentValue.hour(),
            currentValue.minute(),
          ]}
          onChange={handleChange}
        >
          <View className="value">
            <Text>{currentValue.format("YYYY年MM月DD日 HH:mm")}</Text>
            <ArrowRight />
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
