import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { ITouchEvent } from "@tarojs/components/types/common";
import "./index.scss";

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Popup: React.FC<PopupProps> = ({ visible, onClose, children, title }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const animationRef = useRef<Taro.Animation>();
  const isDragging = useRef(false);

  useEffect(() => {
    const animation = Taro.createAnimation({
      duration: 300,
      timingFunction: "ease",
    });
    animationRef.current = animation;

    if (visible) {
      animation.translateY(0).step();
      setAnimationData(animation.export());
      document.body.classList.add("popup-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("popup-open");
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.classList.remove("popup-open");
      document.body.style.overflow = "auto";
    };
  }, [visible]);

  const handleTouchStart = (e: ITouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: ITouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 10) {
      isDragging.current = true;
    }

    if (isDragging.current && diff > 0 && animationRef.current) {
      animationRef.current.translateY(diff).step();
      setAnimationData(animationRef.current.export());
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    if (isDragging.current && diff > 75 && animationRef.current) {
      setIsClosing(true);
      animationRef.current
        .translateY(Taro.getSystemInfoSync().windowHeight)
        .step();
      setAnimationData(animationRef.current.export());
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 300);
    } else if (animationRef.current) {
      animationRef.current.translateY(0).step();
      setAnimationData(animationRef.current.export());
    }

    isDragging.current = false;
  };

  if (!visible && !isClosing) return null;

  return (
    <View className="popup-overlay" catchMove>
      <View
        className="popup-content"
        animation={animationData}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <View className="popup-header">
          <Text className="popup-title">{title}</Text>
          <View className="popup-close" onClick={onClose}>
            ×
          </View>
        </View>
        <View className="popup-body">{children}</View>
      </View>
    </View>
  );
};

export default Popup;
