import React, { useState } from "react";
import { View, Text, Input, Image } from "@tarojs/components";
import "./index.scss";

interface FormItemProps {
  icon?: string;
  label: string;
  placeholder?: string;
  value?: string | number | null;
  units?: string[];
  onChange?: (value: string) => void;
  onUnitChange?: (value: string, unit: string) => string;
  required?: boolean;
  error?: string;
  type?: string;
}

const FormItem: React.FC<FormItemProps> = ({
  icon,
  label,
  placeholder,
  value,
  units = [],
  onChange,
  onUnitChange,
  required,
  error,
}) => {
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);

  const handleUnitChange = () => {
    const nextIndex = (currentUnitIndex + 1) % units.length;
    setCurrentUnitIndex(nextIndex);

    if (onUnitChange && value !== undefined && value !== null) {
      const newValue = onUnitChange(String(value), units[nextIndex]);
      onChange && onChange(newValue);
    }
  };

  return (
    <View className="form-item-wrapper">
      <View className="form-item">
        <View className="left-section">
          {icon && <Image className="icon" src={icon} />}
          <Text className="label">
            {label}
            {required && <Text className="required">*</Text>}
          </Text>
        </View>
        <View className="right-section">
          <Input
            type="text"
            className="input-box"
            placeholder={placeholder || ""}
            value={value === undefined || value === null ? "" : String(value)}
            onInput={(e) => onChange && onChange(e.detail.value)}
          />
          {units.length > 0 && (
            <View className="unit-box" onClick={handleUnitChange}>
              {units[currentUnitIndex]}
            </View>
          )}
        </View>
      </View>
      {error && <Text className="error-text">{error}</Text>}
    </View>
  );
};

export default FormItem;
