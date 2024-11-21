import React, { useState, useEffect } from "react";
import { View, Picker } from "@tarojs/components";
import CustomPopup from "../CustomPopup";
import NumericInput from "../NumericInputProps";
import { addWaterIntakeRecord } from "../../api/waterIntakeApi";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import "./index.scss";

interface WaterInputPopupProps {
  isOpened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValue?: number;
}

// 容量标签配置
const VOLUME_TAGS = [100, 200, 300, 500]; // 单位：毫升

const WaterInputPopup: React.FC<WaterInputPopupProps> = ({
  isOpened,
  onClose,
  onSuccess,
  initialValue = 0,
}) => {
  const [value, setValue] = useState<string>(initialValue.toString());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>(
    dayjs().format("YYYY-MM-DD HH:mm:ss")
  );

  useEffect(() => {
    // 初始化时重置输入值和时间
    setValue(initialValue.toString());
    setSelectedTime(dayjs().format("YYYY-MM-DD HH:mm:ss"));
  }, [isOpened, initialValue]);

  // 点击容量标签，更新输入值
  const handleVolumeTagClick = (volume: number) => {
    setValue(volume.toString());
  };

  // 确认提交
  const handleConfirm = async () => {
    const numericValue = parseInt(value, 10) || 0;

    if (numericValue <= 0) {
      Taro.showToast({
        title: "喝水量必须大于0",
        icon: "none",
      });
      return;
    }

    setLoading(true);

    try {
      await addWaterIntakeRecord({
        userId: Taro.getStorageSync("userId"),
        amount: numericValue,
        intakeTime: selectedTime,
      });

      Taro.showToast({
        title: "添加成功",
        icon: "success",
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("添加喝水记录失败", error);
      Taro.showToast({
        title: "添加失败",
        icon: "error",
      });
      setLoading(false);
    }
  };

  // 时间选择事件处理
  const handleTimeChange = (e) => {
    const selectedDateTime = dayjs(e.detail.value).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    setSelectedTime(selectedDateTime);
  };

  return (
    <CustomPopup
      isOpened={isOpened}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="添加喝水记录"
      confirmText={loading ? "提交中..." : "确认"}
      cancelText="取消"
    >
      <View className="water-input-popup">
        {/* 容量标签 */}
        <View className="volume-tags">
          {VOLUME_TAGS.map((volume) => (
            <View
              key={volume}
              className="volume-tag"
              onClick={() => handleVolumeTagClick(volume)}
            >
              {volume}ml
            </View>
          ))}
        </View>

        {/* 时间选择 */}
        <View className="time-picker">
          <Picker mode="time" value={selectedTime} onChange={handleTimeChange}>
            <View className="picker">
              选择时间：{dayjs(selectedTime).format("YYYY-MM-DD HH:mm")}
            </View>
          </Picker>
        </View>

        {/* 数字键盘输入 */}
        <View className="input-section">
          <NumericInput value={value} onChange={setValue} unit="毫升" />
        </View>
      </View>
    </CustomPopup>
  );
};

export default WaterInputPopup;
