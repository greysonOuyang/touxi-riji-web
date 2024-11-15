// components/LoginPrompt/index.tsx

import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface LoginPromptProps {
  type?: 'banner' | 'modal';
  message?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({
  type = 'banner',
  message = '登录后体验更多功能'
}) => {
  const handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    });
  };

  if (type === 'banner') {
    return (
      <View className='login-prompt-banner'>
        <Text>{message}</Text>
        <Text className='login-btn' onClick={handleLogin}>
          立即登录
        </Text>
      </View>
    );
  }

  return (
    <View className='login-prompt-modal'>
      <View className='content'>
        <Text>{message}</Text>
        <View className='btn-group'>
          <Text 
            className='cancel-btn'
            onClick={() => Taro.navigateBack()}
          >
            取消
          </Text>
          <Text 
            className='confirm-btn'
            onClick={handleLogin}
          >
            去登录
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginPrompt;
