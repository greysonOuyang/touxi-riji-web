import React, { useEffect } from "react";
import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface CustomNavBarProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const CustomNavBar: React.FC<CustomNavBarProps> = ({
  title,
  showBackButton = true,
  onBack,
}) => {
  useEffect(() => {
    // 获取系统信息设置状态栏高度
    Taro.getSystemInfo({
      success: (res) => {
        const statusBarHeight = res.statusBarHeight || 44;
        // 更新CSS变量
        document.documentElement.style.setProperty(
          "--status-bar-height",
          `${statusBarHeight}px`
        );
      },
    });
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      Taro.navigateBack();
    }
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
        <Text className="nav-title">{title}</Text>
      </View>
    </View>
  );
};

export default CustomNavBar;
