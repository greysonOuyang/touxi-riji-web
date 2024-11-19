import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import CustomPopup from "../CustomPopup";
import NumericInput from "../NumericInputProps";
import { addUrineRecord } from "../../api/urineApi";
import "./index.scss";
import Taro from "@tarojs/taro";

interface UrineInputPopupProps {
  isOpened: boolean; // 弹窗是否打开
  onClose: () => void; // 关闭弹窗回调
  onSuccess: () => void; // 添加数据成功后的回调（通知父组件更新）
  initialValue?: number; // 初始尿量值（可选）
}

const UrineInputPopup: React.FC<UrineInputPopupProps> = ({
  isOpened,
  onClose,
  onSuccess,
  initialValue = 0,
}) => {
  const [value, setValue] = useState<string>(initialValue.toString()); // 数字输入状态
  const [loading, setLoading] = useState<boolean>(false); // 按钮加载状态

  // 确认按钮点击事件
  const handleConfirm = async () => {
    const numericValue = parseInt(value, 10) || 0; // 将输入的值转换为数字

    if (numericValue <= 0) {
      // 简单校验：尿量必须大于 0
      console.error("尿量必须大于 0");
      return;
    }

    setLoading(true);

    try {
      // 调用接口添加尿量记录
      await addUrineRecord({
        userId: Taro.getStorageSync("userId"),
        volume: numericValue,
        recordedTime: new Date().toISOString(), // 使用当前时间戳
      });

      setLoading(false);
      onSuccess(); // 通知父组件数据已更新
      onClose(); // 关闭弹窗
    } catch (error) {
      console.error("添加尿量记录失败", error);
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
        {/* 数字输入组件 */}
        <NumericInput value={value} onChange={setValue} unit="毫升" />

        {/* 当前输入值展示 */}
        <View className="current-input-display">
          <Text className="display-text">当前尿量：{value || "0"} 毫升</Text>
        </View>
      </View>
    </CustomPopup>
  );
};

export default UrineInputPopup;
