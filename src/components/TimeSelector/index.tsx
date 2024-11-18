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

  // 生成日期、小时、分钟列的数据
  const generateDateTimeOptions = () => {
    const maxDays = allowFuture ? 365 : 30; // 控制允许选择的天数范围
    const days: string[] = [];
    const today = currentDate.startOf("day");

    for (let i = 0; i <= maxDays; i++) {
      const date = today.subtract(maxDays - i, "day");
      days.push(date.format("MM月DD日")); // 日期保持为 MM月DD日 格式
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

    // 解析选中的日期时间
    const selectedDate = dayjs()
      .month(parseInt(daysColumn[dayIndex].split("月")[0]) - 1) // 月份解析
      .date(parseInt(daysColumn[dayIndex].split("月")[1])) // 日期解析
      .hour(Number(hoursColumn[hourIndex].replace("时", ""))) // 小时解析
      .minute(Number(minutesColumn[minuteIndex].replace("分", ""))); // 分钟解析

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss")); // 输出完整时间格式
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
            currentValue.minute(),
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
