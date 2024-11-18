import React from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";

interface TimeSelectorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  allowFuture?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label = "测量时间",
  value,
  onChange,
  allowFuture = false,
}) => {
  const currentDate = dayjs();

  // 生成日期+时间的列数据
  const generateDateTimeOptions = () => {
    const maxDays = allowFuture ? 365 : 30;
    const days: string[] = [];
    const today = currentDate.startOf("day");

    for (let i = 0; i <= maxDays; i++) {
      const date = today.subtract(maxDays - i, "day");
      days.push(date.format("MM月DD日"));
    }

    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const hourUnits = ["时"];

    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const minuteUnits = ["分"];

    return [days, hours, hourUnits, minutes, minuteUnits];
  };

  const handleChange = (e) => {
    const [dayIndex, hourIndex, , minuteIndex] = e.detail.value;
    const daysColumn = generateDateTimeOptions()[0];
    const hoursColumn = generateDateTimeOptions()[1];
    const minutesColumn = generateDateTimeOptions()[3];

    // 使用当前年份构建完整日期
    const selectedDate = dayjs()
      .month(parseInt(daysColumn[dayIndex].split("月")[0]) - 1)
      .date(parseInt(daysColumn[dayIndex].split("月")[1]))
      .hour(Number(hoursColumn[hourIndex]))
      .minute(Number(minutesColumn[minuteIndex]));

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
  };

  const dateTimeOptions = generateDateTimeOptions();
  const currentValue = value ? dayjs(value) : dayjs();

  return (
    <View className="form-item time-selector-wrapper">
      <View className="time-selector">
        <Text className="label">{label}</Text>
        <Picker
          mode="multiSelector"
          range={dateTimeOptions}
          value={[
            dateTimeOptions[0].findIndex(
              (item) => item === currentValue.format("MM月DD日")
            ),
            currentValue.hour(),
            0, // 时单位列的固定索引
            currentValue.minute(),
            0, // 分单位列的固定索引
          ]}
          onChange={handleChange}
        >
          <View className="picker-value">
            <Text>{currentValue.format("YYYY年MM月DD日 HH:mm")}</Text>
            <Image className="arrow" src="../../assets/icons/right_arrow.png" />
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
