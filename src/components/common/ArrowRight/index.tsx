import React from "react";
import { Image } from "@tarojs/components";
import "./index.scss";

interface ArrowRightProps {
  size?: number; // 可选：箭头大小
  marginLeft?: number; // 可选：左侧间距
}

const ArrowRight: React.FC<ArrowRightProps> = ({
  size = 16,
  marginLeft = 4,
}) => {
  return (
    <Image
      className="arrow"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `${marginLeft}px`,
      }}
      src="../../assets/icons/right_arrow.png"
    />
  );
};

export default ArrowRight;
