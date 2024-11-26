import React from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import classNames from "classnames";

import "./FormItem.scss";

interface FormItemProps {
  label: string; // 标签文本
  icon?: string; // 可选图标路径
  value: string | number; // 输入框的值
  placeholder?: string; // 输入框的占位符
  unit: string; // 单位文本
  onChange: (value: string) => void; // 输入框值变化时触发的回调
}

const FormItem: React.FC<FormItemProps> = ({
  label,
  icon,
  value,
  placeholder = "",
  unit,
  onChange,
}) => {
  return (
    <View className="form-item">
      <View className="left">
        {icon && <Image className="icon" src={icon} />}
        <Input
          className="input"
          value={String(value)}
          placeholder={placeholder}
          onInput={(e) => onChange(e.detail.value)}
        />
        <Text className="label">{label}</Text>
      </View>
      <View className="right">
        <Text className="unit">{unit}</Text>
      </View>
    </View>
  );
};

export default FormItem;
