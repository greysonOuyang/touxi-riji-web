// src/utils/auth.ts
import Taro from '@tarojs/taro';
import { post } from './request';

// 定义用户接口
export interface User {
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

// 定义登录响应接口
export interface LoginResponse {
  token: string;
  user: User;
}

// 自动登录方法
export async function autoLogin() {
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
      return response.data;
    } else {
      throw new Error(response?.msg || '自动登录失败');
    }
  } catch (error) {
    console.error('自动登录错误:', error);
    throw error;
  }
}

// 检查登录状态
export function checkLoginStatus(): boolean {
  const token = Taro.getStorageSync('token');
  return !!token;
}

// 获取当前用户信息
export function getCurrentUser(): User | null {
  return Taro.getStorageSync('user') || null;
}

// 退出登录
export function logout() {
  Taro.removeStorageSync('token');
  Taro.removeStorageSync('user');
  Taro.removeStorageSync('userId');
}
