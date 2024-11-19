import React from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  unit: string; // 单位
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  unit,
}) => {
  const handleInput = (key: string) => {
    if (key === "delete") {
      const updatedValue = value.slice(0, -1) || "0";
      onChange(updatedValue);
    } else {
      const newValue = value === "0" ? key : value + key;
      onChange(newValue);
    }
  };

  return (
    <View className="numeric-input">
      {/* 显示区域 */}
      <View className="numeric-display-container">
        <View className="numeric-value-container">
          <Text className="numeric-value">{value || "0"}</Text>
          <View
            className="numeric-underline"
            style={{
              width: `${value.length * 24}px`, // 动态调整下划线宽度
            }}
          />
        </View>
        <Text className="numeric-unit">{unit}</Text>
      </View>

      {/* 键盘区域 */}
      <View className="numeric-keyboard">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"].map((key) => (
          <View
            key={key}
            className="numeric-key"
            onClick={() => handleInput(key)}
          >
            {key}
          </View>
        ))}
        <View
          className="numeric-key delete-key"
          onClick={() => handleInput("delete")}
        >
          删除
        </View>
      </View>
    </View>
  );
};

export default NumericInput;
