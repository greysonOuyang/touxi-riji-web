import React from 'react';
import { View } from '@tarojs/components';
import './index.scss';

type IconType = 'alert-circle' | 'calendar' | 'chevron-left' | 'chevron-right' | 'clock' | 'home';

interface IconProps {
  value: IconType;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ value, size = 20, color = '#666666' }) => {
  return (
    <View 
      className={`icon icon-${value}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderColor: color
      }}
    />
  );
};

export default Icon; 