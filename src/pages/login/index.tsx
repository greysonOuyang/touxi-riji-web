// /pages/login/index.tsx
import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Image, Checkbox, CheckboxGroup, Text } from '@tarojs/components';

import { get, post } from '@/utils/request';
import './index.scss';

interface User {
  id: number; // 用户唯一标识
  username: string; // 用户名
  passwordHash: string; // 密码的哈希值
  wechatOpenid: string; // 微信用户的OpenID
  unionid: string; // 用户在同一公众号下的唯一标识
  phoneNumber?: string; // 用户的手机号（可选）
  email?: string; // 用户的邮箱地址（可选）
  avatarUrl?: string; // 用户头像的URL（可选）
  status: number; // 用户状态
  loginType: string; // 登录方式标识
  createdAt: string; // 注册时间
  updatedAt: string; // 最后一次信息更新时间
  lastLoginAt?: string; // 最后一次登录时间（可选）
  extraInfo?: string; // 其他扩展信息（可选）
}

interface LoginResponse {
  token: string; // 登录后的 Token
  user: User; // 用户信息
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
// pages/login/index.tsx
const handleRedirect = () => {
  try {
    // 恢复之前保存的表单数据
    const tempState = Taro.getStorageSync('tempState');
    if (tempState) {
      Taro.setStorageSync('tempBloodPressureData', tempState);
      Taro.removeStorageSync('tempState');
    }

    const redirectUrl = Taro.getStorageSync('redirectUrl');
    console.log('重定向URL:', redirectUrl);

    if (redirectUrl) {
      Taro.removeStorageSync('redirectUrl');
      
      // 确保路径格式正确
      const formattedUrl = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
      console.log('格式化后的URL:', formattedUrl);

      // 使用 redirectTo 而不是 navigateTo
      Taro.redirectTo({
        url: formattedUrl,
        success: () => {
          console.log('跳转成功到:', formattedUrl);
        },
        fail: (error) => {
          console.error('跳转失败:', error);
          // 跳转失败时跳转到默认页面
          Taro.switchTab({
            url: '/pages/health/index'
          });
        }
      });
    } else {
      Taro.switchTab({
        url: '/pages/health/index'
      });
    }
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
      // 使用 POST 方法发送登录请求
      const response = await post<LoginResponse>('/auth/mini-app/login', { code });
      
      if (response?.isSuccess()) {
        console.log('获取数据成功:', response.data);
        
        // 先清除旧的 token
        Taro.removeStorageSync('token');
        
        // 设置新的 token 和用户信息
        Taro.setStorageSync('token', response.data.token);
        Taro.setStorageSync('user', response.data.user);
        
        // 打印存储的 token 进行确认
        console.log('存储的token:', Taro.getStorageSync('token'));
    
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        });
        
        // 等待 toast 显示完成后再跳转
        setTimeout(handleRedirect, 1500);
      } else {
        console.error('登录失败:', response?.msg);
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
      url: '/pages/policy/index' // 假设你的用户协议及隐私政策页面路径是 /pages/policy/index
    });
  };

  return (
    <View className="login-container">
      <Image className="avatar" src="../../assets/images/heart-rate-chart.png" />
      <Text className="welcome-text">欢迎使用腹透日记</Text>
      <Button className="login-button" onClick={handleLogin} loading={loading}>
        微信登录
      </Button>
      <CheckboxGroup onChange={handleCheckboxChange}>
        <View className="checkbox-group">
          <Checkbox value="agree" checked={isChecked}></Checkbox>
          <Text>同意 <Text className="link" onClick={handleNavigatePolicy}>《用户协议及隐私政策》</Text></Text>
        </View>
      </CheckboxGroup>
    </View>
  );
};

export default Login;