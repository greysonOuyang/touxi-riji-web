import React, { useState } from "react";
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
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null); // Track long press timeout
  const [isLongPressing, setIsLongPressing] = useState(false); // Track whether the user is long pressing

  // Handle the long press delete action
  const handleDeleteLongPress = () => {
    // Set long press to true and start the timeout
    setIsLongPressing(true);
    const timeout = setTimeout(() => {
      if (isLongPressing) {
        onChange("0"); // Reset value to 0 after 1 second
      }
    }, 1000); // Trigger reset after 1 second
    setLongPressTimeout(timeout);
  };

  const handleDeleteEnd = () => {
    // Clear long press state and timeout
    setIsLongPressing(false);
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null); // Clean up timeout
    }
  };

  const handleInput = (key: string) => {
    if (key === "delete") {
      // Regular delete: Backspace behavior
      const updatedValue = value.slice(0, -1) || "0";
      onChange(updatedValue);
    } else {
      if (value.length < 5) {
        // Allow only up to 5 digits
        const newValue = value === "0" ? key : value + key;
        onChange(newValue);
      }
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
          onTouchStart={handleDeleteLongPress} // Start long press
          onTouchEnd={handleDeleteEnd} // End long press
          onClick={() => handleInput("delete")} // Regular delete action
        >
          删除
        </View>
      </View>
    </View>
  );
};

export default NumericInput;
