import React from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Popup: React.FC<PopupProps> = ({ visible, onClose, children, title }) => {
  if (!visible) return null;

  return (
    <View className="popup-overlay">
      <View className="popup-content">
        <View className="popup-header">
          <Text className="popup-title">{title}</Text>
          <View className="popup-close" onClick={onClose}>
            ×
          </View>
        </View>
        {children}
      </View>
    </View>
  );
};

export default Popup;
