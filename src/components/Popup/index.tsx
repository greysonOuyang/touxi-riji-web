import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <View className="popup-overlay">
      <View className="popup-content">
        <View className="popup-close" onClick={onClose}>
          ×
        </View>
        {children}
      </View>
    </View>
  );
};

export default Popup;
