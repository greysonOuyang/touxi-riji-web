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
    const maxDays = allowFuture ? 365 : 30; // 设置过去30天，如果不允许未来时间
    const days: string[] = [];
    const today = currentDate.startOf("day");

    for (let i = 0; i <= maxDays; i++) {
      const date = today.subtract(maxDays - i, "day"); // 从当前日期开始向过去递增
      days.push(date.format("MM月DD日"));
    }

    const hours = Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    return [days, hours, minutes];
  };

  const handleChange = (e) => {
    const [dayIndex, hourIndex, minuteIndex] = e.detail.value;
    const daysColumn = generateDateTimeOptions()[0];

    const selectedDate = dayjs(daysColumn[dayIndex], "MM月DD日")
      .hour(Number(generateDateTimeOptions()[1][hourIndex]))
      .minute(Number(generateDateTimeOptions()[2][minuteIndex]));

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
  };

  return (
    <View className="form-item time-selector-wrapper">
      <View className="time-selector">
        <Text className="label">{label}</Text>
        <Picker
          mode="multiSelector"
          range={generateDateTimeOptions()}
          value={[
            generateDateTimeOptions()[0].findIndex(
              (item) => item === dayjs(value).format("MM月DD日")
            ),
            dayjs(value).hour(),
            dayjs(value).minute(),
          ]}
          onChange={handleChange}
        >
          <View className="picker-value">
            <Text>{dayjs(value).format("YYYY年MM月DD日 HH:mm")}</Text>
            <Image className="arrow" src="../../assets/icons/right_arrow.png" />
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
