import React, { useState } from "react";
import { View } from "@tarojs/components";
import "./index.scss";

const AddButton = ({ size = 32, onClick, className = "", style = {} }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // 防止事件冒泡
    setIsActive(true); // 设置按钮为活动状态

    if (onClick) onClick(); // 执行传入的点击函数

    // 恢复状态
    setTimeout(() => {
      setIsActive(false);
    }, 150); // 动效持续时间
  };

  return (
    <View
      className={`add-button ${className} ${isActive ? "active" : ""}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
      onClick={handleClick}
    >
      <View className="plus-icon" />
    </View>
  );
};

export default AddButton;
