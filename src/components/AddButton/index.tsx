// AddButton.tsx
import React from 'react';
import { View } from '@tarojs/components';
import './index.scss';

interface AddButtonProps {
  size?: number; // 自定义按钮大小，默认32
  onClick?: () => void; // 点击事件处理函数
}

const AddButton: React.FC<AddButtonProps> = ({ size = 32, onClick }) => {
  return (
    <View
      className="add-button"
      style={{ width: `${size}px`, height: `${size}px`, borderRadius: `${size / 2}px` }}
      onClick={onClick}
    >
      <View
        className="plus-icon"
        style={{ width: `${size / 2}px`, height: `${size / 2}px` }}
      />
    </View>
  );
};

export default AddButton;
