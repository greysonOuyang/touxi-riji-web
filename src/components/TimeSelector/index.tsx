import React from "react";
import { View, Text, Picker } from "@tarojs/components";
import dayjs from "dayjs";
import "./index.scss";
import ArrowRight from "../ArrowRight";

interface TimeSelectorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  allowFuture?: boolean; // 是否允许选择未来时间
  showLabel?: boolean; // 显示标签
  mode?: "datetime" | "date"; // 选择模式（包括年月日和时分秒的完整模式，或仅选择年月日）
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label = "时间",
  value,
  onChange,
  allowFuture = false,
  showLabel = true, // 默认值为 true
  mode = "datetime", // 默认使用 datetime 模式
}) => {
  const currentDate = dayjs();

  // 获取每个月的天数
  const getDaysInMonth = (year: number, month: number) => {
    return dayjs(new Date(year, month)).daysInMonth(); // 获取某月的天数
  };

  // 根据 mode 生成不同的选项
  const generateDateTimeOptions = () => {
    const months: string[] = [];
    const days: string[] = [];
    const hours: string[] = [];
    const minutes: string[] = [];

    const currentYear = currentDate.year();
    const currentMonth = currentDate.month();

    // 年份范围处理
    const years: string[] = [];
    if (allowFuture) {
      // 允许选择未来年份：当前年份到未来5年
      for (let i = currentYear; i <= currentYear + 5; i++) {
        years.push(`${i}年`);
      }
    } else {
      // 不允许选择未来年份：仅允许当前年份及过去年份
      for (let i = currentYear - 10; i <= currentYear; i++) {
        years.push(`${i}年`);
      }
    }

    // 生成月份列
    const monthsList: string[] = [];
    for (let i = 1; i <= 12; i++) {
      monthsList.push(`${i}月`);
    }

    // 固定生成31天的日期列
    const daysList: string[] = [];
    for (let i = 1; i <= 31; i++) {
      daysList.push(`${i}日`);
    }

    // 生成时分选项（如果是 datetime 模式）
    if (mode === "datetime") {
      for (let i = 0; i < 24; i++) {
        hours.push(`${i.toString().padStart(2, "0")}时`);
      }
      for (let i = 0; i < 60; i++) {
        minutes.push(`${i.toString().padStart(2, "0")}分`);
      }
    }

    return {
      years,
      months: monthsList,
      days: daysList,
      hours,
      minutes,
    };
  };

  const handleChange = (e) => {
    const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] =
      e.detail.value;
    const { years, months, days, hours, minutes } = generateDateTimeOptions();

    let selectedDate = dayjs()
      .year(parseInt(years[yearIndex].replace("年", ""))) // 根据选择的年份
      .month(monthIndex) // 根据选择的月份
      .date(parseInt(days[dayIndex].replace("日", ""))); // 根据选择的日期

    if (mode === "datetime") {
      selectedDate = selectedDate
        .hour(Number(hours[hourIndex].replace("时", ""))) // 根据选择的小时
        .minute(Number(minutes[minuteIndex].replace("分", ""))); // 根据选择的分钟
    }

    // 校验日期是否有效，若无效则修正日期
    const daysInSelectedMonth = getDaysInMonth(
      selectedDate.year(),
      selectedDate.month()
    );
    if (parseInt(days[dayIndex].replace("日", "")) > daysInSelectedMonth) {
      selectedDate = selectedDate.date(daysInSelectedMonth); // 将日期修正为该月的最后一天
    }

    onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
  };

  const { years, months, days, hours, minutes } = generateDateTimeOptions();
  const currentValue = value ? dayjs(value) : dayjs();

  return (
    <View className="time-selector">
      {showLabel && <Text className="label">{label}</Text>}{" "}
      {/* 根据 showLabel 控制显示 */}
      <View className="value-wrapper">
        <Picker
          mode="multiSelector"
          range={
            mode === "datetime"
              ? [years, months, days, hours, minutes]
              : [years, months, days]
          } // 根据 mode 选择范围
          value={[
            years.findIndex((item) => item === currentValue.format("YYYY年")), // 年份
            months.findIndex((item) => item === currentValue.format("M月")), // 月份
            days.findIndex((item) => item === currentValue.format("D日")), // 日期
            mode === "datetime" ? currentValue.hour() : 0, // 在 date 模式下不显示小时
            mode === "datetime" ? currentValue.minute() : 0, // 在 date 模式下不显示分钟
          ]}
          onChange={handleChange}
        >
          <View className="value">
            <Text>
              {currentValue.format(
                mode === "datetime" ? "YYYY年MM月DD日 HH:mm" : "YYYY年MM月DD日"
              )}
            </Text>
            <ArrowRight />
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
