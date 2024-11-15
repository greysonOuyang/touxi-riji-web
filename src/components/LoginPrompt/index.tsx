// components/LoginPrompt/index.tsx
import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const LoginPrompt: React.FC = () => {
  const handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    });
  };

  return (
    <View className='login-prompt-wrapper'>
      <View className='login-prompt'>
        <Text className='dot'>·</Text>
        <Text className='message'>登录后查看完整数据</Text>
        <Text className='login-link' onClick={handleLogin}>登录</Text>
      </View>
    </View>
  );
};

export default LoginPrompt;
