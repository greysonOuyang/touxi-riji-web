import React from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import "./index.scss";

interface FormItemProps {
  icon?: string; // 可选的图标
  label: string; // 标签文字
  placeholder?: string; // 输入框占位符
  value?: number | string; // 输入框值
  unit?: string; // 单位文字
  onChange?: (value: string) => void; // 值变更事件
}

const FormItem: React.FC<FormItemProps> = ({
  icon,
  label,
  placeholder,
  value,
  unit,
  onChange,
}) => (
  <View className="form-item">
    <View className="left-section">
      {icon && <Image className="icon" src={icon} />}
      <Text className="label">{label}</Text>
      <Input
        type="number"
        className="input-box"
        placeholder={placeholder || ""}
        value={value === undefined || value === null ? "" : String(value)}
        onInput={(e) => onChange && onChange(e.detail.value)}
      />
    </View>
    <View className="right-section">
      {unit && <View className="unit-box">{unit}</View>}
    </View>
  </View>
);

export default FormItem;
