import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";

interface CapsuleSelectorProps {
  options: (string | number)[];
  selected: string | number;
  onSelect: (option: string | number) => void;
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
