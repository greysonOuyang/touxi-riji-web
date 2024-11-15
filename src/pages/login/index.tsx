// /pages/login/index.tsx
import React, { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Button, Image, Checkbox, CheckboxGroup, Text } from '@tarojs/components';
import { get, post } from '@/utils/request';
import { restoreAllTempFormData, hasUnsubmittedData } from '@/utils/tempFormStorage';
import './index.scss';

interface User {
  id: number;
  username: string;
  passwordHash: string;
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
  const [hasTemp, setHasTemp] = useState(false);

  useDidShow(() => {
    const hasTempData = hasUnsubmittedData();
    setHasTemp(hasTempData);
  });

  const handleRedirect = () => {
    try {
      // 不在登录成功时清除临时表单数据
      // 返回上一页，让表单页面处理数据的提交和清除
      Taro.navigateBack({
        delta: 1,
        success: () => {
          console.log('成功返回上一页');
        },
        fail: (error) => {
          console.error('返回上一页失败:', error);
          // 如果返回失败，则跳转到首页
          Taro.switchTab({
            url: '/pages/health/index'
          });
        }
      });
    } catch (error) {
      console.error('重定向错误:', error);
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
        
        // 显示成功提示并立即处理重定向
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 登录成功后直接返回上一页
            handleRedirect();
          }
        });
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

      {hasTemp && (
        <View className='temp-data-tip'>
          检测到未保存的表单数据，登录后将自动恢复
        </View>
      )}

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
