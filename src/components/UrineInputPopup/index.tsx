import React, { useState, useEffect } from "react";
import { View } from "@tarojs/components";
import CustomPopup from "../CustomPopup";
import NumericInput from "../NumericInputProps";
import { addUrineRecord } from "../../api/urineApi";
import "./index.scss";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";

interface UrineInputPopupProps {
  isOpened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValue?: number;
}

// 时间段配置
const TIME_PERIODS = [
  { label: "早上 6:00-9:00", tag: "morning", range: [6, 9] },
  { label: "上午 9:00-12:00", tag: "forenoon", range: [9, 12] },
  { label: "下午 12:00-18:00", tag: "afternoon", range: [12, 18] },
  { label: "晚上 18:00-22:00", tag: "evening", range: [18, 22] },
  { label: "夜间 22:00-6:00", tag: "night", range: [22, 6] },
];

const UrineInputPopup: React.FC<UrineInputPopupProps> = ({
  isOpened,
  onClose,
  onSuccess,
  initialValue = 0,
}) => {
  const [value, setValue] = useState<string>(initialValue.toString());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  // 根据时间判断时间段
  const determineTimePeriod = (hour: number) => {
    return TIME_PERIODS.findIndex(({ range }) => {
      const [start, end] = range;
      if (end > start) {
        return hour >= start && hour < end;
      } else {
        return hour >= start || hour < end;
      }
    });
  };

  // 初始化时根据当前时间自动选择时间段
  useEffect(() => {
    const currentHour = dayjs().hour();
    const periodIndex = determineTimePeriod(currentHour);
    if (periodIndex !== -1) {
      setSelectedPeriod(periodIndex);
    }

    // Reset the value when the popup is opened
    setValue(initialValue.toString());
  }, [isOpened, initialValue]); // Reset value on popup open

  // 处理时间段选择
  const handlePeriodSelect = (index: number) => {
    setSelectedPeriod(index);
  };

  const handleConfirm = async () => {
    const numericValue = parseInt(value, 10) || 0;

    if (numericValue <= 0) {
      Taro.showToast({
        title: "尿量必须大于0",
        icon: "none",
      });
      return;
    }

    if (selectedPeriod === null) {
      Taro.showToast({
        title: "请选择时间段",
        icon: "none",
      });
      return;
    }

    setLoading(true);

    try {
      await addUrineRecord({
        userId: Taro.getStorageSync("userId"),
        volume: numericValue,
        tag: TIME_PERIODS[selectedPeriod].tag,
        recordedTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      });

      Taro.showToast({
        title: "添加成功",
        icon: "none",
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("添加尿量记录失败", error);
      Taro.showToast({
        title: "添加失败",
        icon: "error",
      });
      setLoading(false);
    }
  };

  return (
    <CustomPopup
      isOpened={isOpened}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="设置尿量"
      confirmText={loading ? "提交中..." : "确认"}
      cancelText="取消"
    >
      <View className="urine-input-popup">
        <View className="period-tags">
          {TIME_PERIODS.map((period, index) => (
            <View
              key={period.label}
              className={`period-tag ${
                selectedPeriod === index ? "active" : ""
              }`}
              onClick={() => handlePeriodSelect(index)}
            >
              {period.label}
            </View>
          ))}
        </View>

        <View className="input-section">
          <NumericInput value={value} onChange={setValue} unit="毫升" />
        </View>
      </View>
    </CustomPopup>
  );
};

export default UrineInputPopup;
