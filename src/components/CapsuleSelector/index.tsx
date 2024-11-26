import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";

interface CapsuleSelectorProps {
  options: Array<number | string>;
  selected: number | string;
  onSelect: (value: number | string) => void;
}

const CapsuleSelector: React.FC<CapsuleSelectorProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <View className="capsule-selector">
      {options.map((option, index) => (
        <View
          key={index}
          className={`capsule-item ${selected === option ? "active" : ""}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </View>
      ))}
    </View>
  );
};

export default CapsuleSelector;
