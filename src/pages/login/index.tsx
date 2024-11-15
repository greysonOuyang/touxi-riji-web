// pages/login/index.tsx

import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Image, Checkbox, CheckboxGroup, Text } from '@tarojs/components';
import { post } from '@/utils/request';
import './index.scss';

interface User {
  id: number;
  username: string;
  wechatOpenid: string;
  unionid: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  status: number;
  loginType: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  extraInfo?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const handleRedirect = () => {
    const redirectUrl = Taro.getStorageSync('redirectUrl');
    
    if (redirectUrl) {
      Taro.removeStorageSync('redirectUrl');
      Taro.redirectTo({
        url: redirectUrl,
        fail: () => {
          // 如果重定向失败（可能是 tabBar 页面），则使用 switchTab
          Taro.switchTab({
            url: redirectUrl,
            fail: () => {
              // 如果还是失败，返回首页
              Taro.switchTab({
                url: '/pages/health/index'
              });
            }
          });
        }
      });
    } else {
      // 没有重定向地址时返回首页
      Taro.switchTab({
        url: '/pages/health/index'
      });
    }
  };

  const handleLogin = async () => {
    if (!isChecked) {
      Taro.showModal({
        title: '提示',
        content: '请勾选用户协议及隐私政策',
        showCancel: false,
      });
      return;
    }
  
    setLoading(true);
    try {
      const { code } = await Taro.login();
      const response = await post<LoginResponse>('/auth/mini-app/login', { code });
      
      if (response?.isSuccess()) {
        // 清除旧的 token
        Taro.removeStorageSync('token');
        
        // 设置新的 token 和用户信息
        Taro.setStorageSync('token', response.data.token);
        Taro.setStorageSync('user', response.data.user);
        Taro.setStorageSync('userId', response.data.user.id);
        
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟跳转，确保 Toast 显示完成
        setTimeout(() => {
          handleRedirect();
        }, 1500);
      } else {
        Taro.showToast({
          title: response?.msg || '登录失败',
          icon: 'none',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = e => {
    setIsChecked(e.detail.value.length > 0);
  };

  const handleNavigatePolicy = () => {
    Taro.navigateTo({
      url: '/pages/policy/index'
    });
  };

  return (
    <View className='login-container'>
      <Image className='avatar' src='../../assets/images/heart-rate-chart.png' />
      <Text className='welcome-text'>欢迎使用腹透日记</Text>

      <Button 
        className='login-button' 
        onClick={handleLogin} 
        loading={loading}
      >
        微信登录
      </Button>

      <View className='agreement-container'>
        <CheckboxGroup onChange={handleCheckboxChange}>
          <Checkbox value='agree' checked={isChecked} className='checkbox'>
            我已阅读并同意
          </Checkbox>
        </CheckboxGroup>
        <Text className='agreement-link' onClick={handleNavigatePolicy}>
          《用户协议及隐私政策》
        </Text>
      </View>
    </View>
  );
};

export default Login;
