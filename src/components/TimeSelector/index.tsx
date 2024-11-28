import React, { useEffect } from "react";
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
  mode?: "datetime" | "date"; // 选择模式
  defaultToCurrent?: boolean; // 新增参数
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label = "时间",
  value,
  onChange,
  allowFuture = false,
  showLabel = true,
  mode = "datetime",
  defaultToCurrent = false, // 默认值为 false
}) => {
  const currentDate = dayjs();

  const getDaysInMonth = (year: number, month: number) => {
    return dayjs(new Date(year, month)).daysInMonth();
  };

  const generateDateTimeOptions = () => {
    const years: string[] = [];
    const months: string[] = [];
    const days: string[] = [];
    const hours: string[] = [];
    const minutes: string[] = [];
    const currentYear = currentDate.year();

    if (allowFuture) {
      for (let i = currentYear; i <= currentYear + 5; i++) {
        years.push(`${i}年`);
      }
    } else {
      for (let i = currentYear - 10; i <= currentYear; i++) {
        years.push(`${i}年`);
      }
    }

    for (let i = 1; i <= 12; i++) {
      months.push(`${i}月`);
    }

    for (let i = 1; i <= 31; i++) {
      days.push(`${i}日`);
    }

    if (mode === "datetime") {
      for (let i = 0; i < 24; i++) {
        hours.push(`${i.toString().padStart(2, "0")}时`);
      }
      for (let i = 0; i < 60; i++) {
        minutes.push(`${i.toString().padStart(2, "0")}分`);
      }
    }

    return { years, months, days, hours, minutes };
  };

  useEffect(() => {
    if (!value && defaultToCurrent) {
      onChange(
        currentDate.format(
          mode === "datetime" ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD"
        )
      );
    }
  }, [value, onChange, currentDate, defaultToCurrent, mode]);

  const currentValue = value ? dayjs(value) : currentDate;
  const { years, months, days, hours, minutes } = generateDateTimeOptions();

  return (
    <View className="time-selector">
      {showLabel && <Text className="label">{label}</Text>}
      <View className="value-wrapper">
        <Picker
          mode="multiSelector"
          range={
            mode === "datetime"
              ? [years, months, days, hours, minutes]
              : [years, months, days]
          }
          value={
            value
              ? [
                  years.findIndex(
                    (item) => item === currentValue.format("YYYY年")
                  ),
                  months.findIndex(
                    (item) => item === currentValue.format("M月")
                  ),
                  days.findIndex((item) => item === currentValue.format("D日")),
                  mode === "datetime" ? currentValue.hour() : 0,
                  mode === "datetime" ? currentValue.minute() : 0,
                ]
              : [
                  years.findIndex(
                    (item) => item === currentDate.format("YYYY年")
                  ),
                  months.findIndex(
                    (item) => item === currentDate.format("M月")
                  ),
                  days.findIndex((item) => item === currentDate.format("D日")),
                  mode === "datetime" ? currentDate.hour() : 0,
                  mode === "datetime" ? currentDate.minute() : 0,
                ]
          }
          onChange={(e) => {
            const [yearIndex, monthIndex, dayIndex, hourIndex, minuteIndex] =
              e.detail.value;
            let selectedDate = dayjs()
              .year(parseInt(years[yearIndex].replace("年", "")))
              .month(monthIndex)
              .date(parseInt(days[dayIndex].replace("日", "")));

            if (mode === "datetime") {
              selectedDate = selectedDate
                .hour(parseInt(hours[hourIndex].replace("时", "")))
                .minute(parseInt(minutes[minuteIndex].replace("分", "")));
            }

            const daysInSelectedMonth = getDaysInMonth(
              selectedDate.year(),
              selectedDate.month()
            );
            if (
              parseInt(days[dayIndex].replace("日", "")) > daysInSelectedMonth
            ) {
              selectedDate = selectedDate.date(daysInSelectedMonth);
            }

            onChange(selectedDate.format("YYYY-MM-DD HH:mm:ss"));
          }}
        >
          <View className="value">
            <Text>
              {value
                ? currentValue.format(
                    mode === "datetime"
                      ? "YYYY年MM月DD日 HH:mm"
                      : "YYYY年MM月DD日"
                  )
                : "请选择"}
            </Text>
            <ArrowRight />
          </View>
        </Picker>
      </View>
    </View>
  );
};

export default TimeSelector;
