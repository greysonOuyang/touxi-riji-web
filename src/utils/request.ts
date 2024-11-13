import Taro from '@tarojs/taro';
import axios, { AxiosResponse } from 'axios';
import { checkLogin } from './auth';

// 定义接口响应的封装类
export class ApiResponse<T> {
  code: number;
  msg: string;
  data: T;

  constructor(response: AxiosResponse) {
    this.code = response.data.code;
    this.msg = response.data.msg;
    this.data = response.data.data;
  }

  // 判断请求是否成功
  isSuccess() {
    return this.code === 200;
  }
}

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.timeout = 120000;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  (config) => {
    const token = Taro.getStorageSync('token');
    if (token && config.url !== '/auth/mini-app/login') {
      config.headers.Authorization = ` ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log('收到了响应:', response);

    // 检查后端返回的 code 字段是否为 200
    if (response.data && response.data.code !== 200) {
      // 如果 code 不是 200，抛出错误信息到 error 拦截器
      Taro.showToast({
        title: `请求错误: ${response.data.msg || '未知错误'}`,
        icon: 'none',
        duration: 2000,
      });
      return Promise.reject(new Error(response.data.msg || '请求错误'));
    }

    return response; // 正常返回响应
  },
  async (error) => {
    console.log('拦截器触发了'); // 检查拦截器是否执行

    if (error.response) {
      console.log('错误响应：', error.response); // 输出错误的响应信息
      if (error.response.status === 401) {
        console.log('检测到401错误');
        const isLoggedIn = await checkLogin();
        if (!isLoggedIn) {
          console.error('未授权，用户选择不登录或登录失败');
          return Promise.reject(new Error('未授权'));
        }
      } else {
        console.log('非401错误');
        Taro.showToast({
          title: `请求错误: ${error.response.statusText}`,
          icon: 'none',
          duration: 2000,
        });
        console.error('请求出错', error.response);
      }
    } else {
      console.log('无响应的网络错误');
      Taro.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000,
      });
      console.error('网络错误或无响应', error);
    }

    return Promise.reject(error);
  }
);



function handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
  return new ApiResponse<T>(response);
}

// GET 方法封装
export function get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
  return axios
    .get(url, { params })
    .then((response) => handleResponse<T>(response))
    .catch((error) => {
      console.error('GET 请求出错', error);
      throw error;
    });
}

// POST 方法封装
export function post<T>(url: string, params: object): Promise<ApiResponse<T>> {
  return axios
    .post(url, params)
    .then((response) => handleResponse<T>(response))
    .catch((error) => {
      console.error('POST 请求出错', error);
      throw error;
    });
}

// PUT 方法封装
export function put<T>(url: string, params: object): Promise<ApiResponse<T>> {
  return axios
    .put(url, params)
    .then((response) => handleResponse<T>(response))
    .catch((error) => {
      console.error('PUT 请求出错', error);
      throw error;
    });
}

// DELETE 方法封装
export function deleted<T>(url: string, params?: object): Promise<ApiResponse<T>> {
  return axios
    .delete(url, { params })
    .then((response) => handleResponse<T>(response))
    .catch((error) => {
      console.error('DELETE 请求出错', error);
      throw error;
    });
}
