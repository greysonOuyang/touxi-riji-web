import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import UltrafiltrationBall from '../UltrafiltrationBall';
import './index.scss';

interface UltrafiltrationViewProps {
  value: number;
  target: number;
  concentration: string;
  specification: string;
  currentSession: number;
  totalSessions: number;
}

const UltrafiltrationView: React.FC<UltrafiltrationViewProps> = ({
  value,
  target,
  concentration,
  specification,
  currentSession,
  totalSessions
}) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const animationDuration = 2000; // 2秒动画时间
    const startTime = Date.now();

    const animateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animationDuration, 1);
      setCurrentValue(Math.round(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };

    animateValue();
  }, [value]);

  return (
    <View className='ultrafiltration-view'>
      <View className='ultrafiltration-main'>
        <UltrafiltrationBall value={currentValue} maxValue={target} />
        <View className='ultrafiltration-info'>
          <View className='info-label'>超滤量</View>
          <View className='info-value'>{currentValue}ml</View>
        </View>
      </View>
      <View className='ultrafiltration-details'>
        <View className='detail-item'>
          <View className='detail-label'>浓度</View>
          <View className='detail-value'>{concentration}</View>
        </View>
        <View className='detail-item'>
          <View className='detail-label'>规格</View>
          <View className='detail-value'>{specification}</View>
        </View>
        <View className='detail-item'>
          <View className='detail-label'>次数</View>
          <View className='detail-value'>{currentSession}/{totalSessions}</View>
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;