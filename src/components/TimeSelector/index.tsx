// components/TimeSelector/index.tsx
import React, { ReactNode } from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";

interface TimeSelectorProps {
  label?: ReactNode; // 修改为 ReactNode 类型以支持更灵活的标签内容
  value: string;
  onChange: (value: string) => void;
  allowFuture?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label = "测量时间", // 添加默认值
  value,
  onChange,
  allowFuture = false,
}) => {
  const currentDate = dayjs();

  const generateDateTimeColumns = () => {
    const currentMonth = allowFuture ? 12 : currentDate.month() + 1;
    const months = Array.from({ length: currentMonth }, (_, i) => `${i + 1}月`);

    const getDaysInMonth = (month: number) => {
      // 如果是当前月份且不允许未来时间，则只显示到当前日期
      if (!allowFuture && month === currentDate.month() + 1) {
        return currentDate.date();
      }
      return dayjs()
        .month(month - 1)
        .daysInMonth();
    };

    // 默认使用选中月份的天数
    const selectedMonth = dayjs(value).month() + 1;
    const daysCount = getDaysInMonth(selectedMonth);
    const days = Array.from({ length: daysCount }, (_, i) => `${i + 1}日`);

    // 对于当前日期，限制小时和分钟
    const isCurrentDate =
      !allowFuture &&
      dayjs(value).month() === currentDate.month() &&
      dayjs(value).date() === currentDate.date();

    const maxHours = isCurrentDate ? currentDate.hour() + 1 : 24;
    const hours = Array.from({ length: maxHours }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    const maxMinutes =
      isCurrentDate && dayjs(value).hour() === currentDate.hour()
        ? currentDate.minute() + 1
        : 60;
    const minutes = Array.from({ length: maxMinutes }, (_, i) =>
      i.toString().padStart(2, "0")
    );

    return [months, days, hours, minutes];
  };

  const handleChange = (e) => {
    const [monthIndex, dayIndex, hour, minute] = e.detail.value;
    const selectedDate = dayjs(value)
      .month(monthIndex)
      .date(dayIndex + 1)
      .hour(Number(hour))
      .minute(Number(minute));

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
  };

  const handleColumnChange = (e) => {
    const { column, value: columnValue } = e.detail;
    if (column === 0) {
      // 月份列变化的处理逻辑保持不变
      const selectedMonth = columnValue + 1;
      const daysCount = dayjs()
        .month(selectedMonth - 1)
        .daysInMonth();
    }
  };

  return (
    <View className="time-selector">
      {/* 修改标签渲染方式，支持 ReactNode */}
      <View className="label-wrapper">
        {typeof label === "string" ? <Text>{label}</Text> : label}
      </View>
      <View className="picker-wrapper">
        <Picker
          mode="multiSelector"
          range={generateDateTimeColumns()}
          value={[
            dayjs(value).month(),
            dayjs(value).date() - 1,
            dayjs(value).hour(),
            dayjs(value).minute(),
          ]}
          onChange={handleChange}
          onColumnChange={handleColumnChange}
        >
          <View className="picker-value">
            <Text>{dayjs(value).format("YYYY年M月D日 HH:mm")}</Text>
            <Image className="arrow" src="../../assets/icons/right_arrow.png" />
            {/* 
            <Text className="arrow">›</Text> */}
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
