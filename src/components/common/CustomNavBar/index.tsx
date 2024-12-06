import React, { useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface CustomNavBarProps {
  title?: string;
  centerContent?: React.ReactNode;
  showBackButton?: boolean;
}

const CustomNavBar: React.FC<CustomNavBarProps> = ({
  title,
  centerContent,
  showBackButton = false,
}) => {
  useEffect(() => {
    Taro.getSystemInfo({
      success: (res) => {
        const statusBarHeight = res.statusBarHeight || 44;
        document.documentElement.style.setProperty(
          "--status-bar-height",
          `${statusBarHeight}px`
        );
      },
    });
  }, []);

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className="custom-nav-bar">
      <View
        className="nav-content"
        style={{ marginTop: "var(--status-bar-height)" }}
      >
        {showBackButton && (
          <View className="back-button" onClick={handleBack}>
            <View className="back-arrow" />
          </View>
        )}
        {centerContent ? (
          <View className="center-content">{centerContent}</View>
        ) : (
          <Text className="nav-title">{title}</Text>
        )}
      </View>
    </View>
  );
};

export default CustomNavBar;
