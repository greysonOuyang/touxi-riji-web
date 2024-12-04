import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";

interface ButtonProps {
  text: string;
  type?: "primary" | "secondary";
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, type = "primary", onClick }) => {
  return (
    <View className={`custom-button ${type}-button`} onClick={onClick}>
      {text}
    </View>
  );
};

export default Button;
