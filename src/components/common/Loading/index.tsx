import React from 'react';
import { View } from '@tarojs/components';
import './index.scss';

interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 32, color = '#92A3FD' }) => {
  return (
    <View className="loading-container">
      <View 
        className="loading-spinner"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderColor: color
        }}
      />
    </View>
  );
};

export default Loading; 