import React from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import "./index.scss";

interface FormItemProps {
  icon?: string;
  label: string;
  placeholder?: string;
  value?: string | number | null;
  unit?: string;
  onChange?: (value: string) => void;
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
    </View>
    <View className="right-section">
      <Input
        type="text"
        className="input-box"
        placeholder={placeholder || ""}
        value={value === undefined || value === null ? "" : String(value)}
        onInput={(e) => onChange && onChange(e.detail.value)}
      />
      {unit && <View className="unit-box">{unit}</View>}
    </View>
  </View>
);

export default FormItem;
