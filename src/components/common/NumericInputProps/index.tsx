import React, { useState } from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  unit: string;
  onComplete?: () => void;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  unit,
  onComplete,
}) => {
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleDeleteLongPress = () => {
    setIsLongPressing(true);
    const timeout = setTimeout(() => {
      if (isLongPressing) {
        onChange("0");
      }
    }, 1000);
    setLongPressTimeout(timeout);
  };

  const handleDeleteEnd = () => {
    setIsLongPressing(false);
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  const handleInput = (key: string) => {
    if (key === "delete") {
      const updatedValue = value.slice(0, -1) || "0";
      onChange(updatedValue);
    } else if (key === ".") {
      if (!value.includes(".")) {
        const newValue = value + ".";
        onChange(newValue);
      }
    } else {
      if (value.length < 5) {
        const newValue = value === "0" ? key : value + key;
        onChange(newValue);
      }
    }
  };

  return (
    <View className="numeric-input">
      <View className="numeric-display-container">
        <View className="numeric-value-container">
          <Text className="numeric-value">{value || "0"}</Text>
          <View className="numeric-underline" />
        </View>
        <Text className="numeric-unit">{unit}</Text>
      </View>

      <View className="numeric-keyboard">
        <View className="numeric-keys">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "00"].map(
            (key) => (
              <View
                key={key}
                className="numeric-key"
                onClick={() => handleInput(key)}
              >
                <Text>{key}</Text>
              </View>
            )
          )}
        </View>
        <View className="action-keys">
          <View
            className="numeric-key delete-key"
            onTouchStart={handleDeleteLongPress}
            onTouchEnd={handleDeleteEnd}
            onClick={() => handleInput("delete")}
          >
            <Text className="delete-icon">←</Text>
          </View>
          <View className="numeric-key complete-key" onClick={onComplete}>
            <Text>完成</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NumericInput;
