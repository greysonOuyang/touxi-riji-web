import Taro from '@tarojs/taro';
import axios, { AxiosResponse } from 'axios';

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
    return this.code === 0;
  }
}



axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.timeout = 120000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

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
  (response) => response,
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 泛型处理响应的封装
function handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
  return new ApiResponse<T>(response);
}

/**
 * GET 方法
 * @param url 请求的 URL 地址
 * @param params 请求参数
 */
export function get<T>(url: string, params?: object): Promise<ApiResponse<T>> {
  return axios.get(url, { params })
    .then((response) => handleResponse<T>(response)) // 使用泛型
    .catch((error) => {
      console.error('GET 请求出错', error);
      throw error;
    });
}

/**
 * POST 方法
 * @param url 请求的 URL 地址
 * @param params 请求参数
 */
export function post<T>(url: string, params: object): Promise<ApiResponse<T>> {
  return axios.post(url, params)
    .then((response) => handleResponse<T>(response)) // 使用泛型
    .catch((error) => {
      console.error('POST 请求出错', error);
      throw error;
    });
}

/**
 * PUT 方法
 * @param url 请求的 URL 地址
 * @param params 请求参数
 */
export function put<T>(url: string, params: object): Promise<ApiResponse<T>> {
  return axios.put(url, params)
    .then((response) => handleResponse<T>(response)) // 使用泛型
    .catch((error) => {
      console.error('PUT 请求出错', error);
      throw error;
    });
}

/**
 * DELETE 方法
 * @param url 请求的 URL 地址
 * @param params 请求参数
 */
export function deleted<T>(url: string, params?: object): Promise<ApiResponse<T>> {
  return axios.delete(url, { params })
    .then((response) => handleResponse<T>(response)) // 使用泛型
    .catch((error) => {
      console.error('DELETE 请求出错', error);
      throw error;
    });
}
