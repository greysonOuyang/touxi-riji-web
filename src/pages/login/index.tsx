// /pages/login/index.tsx
import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Image, Checkbox, CheckboxGroup, Text } from '@tarojs/components';

import { get } from '@/utils/request';
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
      const { code } = await Taro.login(); // 调用微信
      console.log("调用登录接口", code);
      
      const response = await get<LoginResponse>('/auth/mini-app/login', { code });
      console.log("调用登录接口返回:", response);
      
      if (response.isSuccess()) {
        console.log('获取数据成功:', response.data);
        
        // 保存 Token 和 User
        Taro.setStorageSync('token', response.data.token); // 保存 Token
        Taro.setStorageSync('user', response.data.user); // 保存 User
    
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000,
        });
        
        // 跳转回之前的页面
        const redirectUrl = Taro.getStorageSync('redirectUrl');
        if (redirectUrl) {
          Taro.redirectTo({ url: redirectUrl });
        } else {
          Taro.switchTab({ url: '/pages/health/index' }); // 默认跳转到首页
        }
      } else {
        console.error('登录失败:', response.msg);
      }
    } catch (error) {
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