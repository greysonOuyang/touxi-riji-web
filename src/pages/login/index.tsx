// /pages/login/index.tsx
import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Image, Checkbox, CheckboxGroup, Text } from '@tarojs/components';
import { alogin } from '../../api/auth'; // 确保引入 login 函数
import './index.scss';
import { get } from '../utils/request';

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
      console.log("调用登录接口", code)
      const response = await get('/auth/mini-app/login', code);
      console.log("调用登录接口111111", response)
      if (response.isSuccess()) {
        Taro.setStorageSync('token', response.data.token); // 保存 Token
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
          Taro.switchTab({ url: '/pages/home/index' }); // 默认跳转到首页
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