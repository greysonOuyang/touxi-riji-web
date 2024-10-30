import Taro from '@tarojs/taro';
import { get } from '../utils/request';

interface LoginParams {
  code: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: any;
  };
}

export async function alogin(params: LoginParams): Promise<LoginResponse> {
  try {
    const response = await get('/auth/mini-app/login', params) as LoginResponse;
    const { token } = response.data;
    if (token) {
      // 使用 Taro 的存储方法来存储 token
      Taro.setStorageSync('token', token);
    }
    return response;
  } catch (error: any) {
    throw new Error(error.message || '登录失败');
  }
}