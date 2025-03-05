import Taro from "@tarojs/taro";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { autoLogin } from "./auth";

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

  isSuccess() {
    return this.code === 200;
  }
}

// 基础配置
const instance = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: "https://4yn69go24304.vicp.fun",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 不需要 token 的白名单路径
const whiteList = [
  "/auth/mini-app/login",
  "/auth/register",
  // 添加其他不需要token的路径
];

// 判断是否为白名单路径
const isWhiteListUrl = (url: string): boolean => {
  return whiteList.some((path) => url.includes(path));
};
// 请求拦截器
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 如果不是白名单URL且没有token,尝试自动登录
    if (!isWhiteListUrl(config.url ?? "") && !Taro.getStorageSync("token")) {
      try {
        const app = Taro.getCurrentInstance().app;
        await autoLogin();
      } catch (error) {
        console.error("自动登录失败:", error);
        // 如果不是登录页面,则跳转到登录页
        const currentPath = Taro.getCurrentInstance().router?.path;
        if (currentPath !== "/pages/login/index") {
          Taro.setStorageSync("redirectUrl", currentPath);
          Taro.redirectTo({ url: "/pages/login/index" });
        }
        return Promise.reject(new Error("需要登录"));
      }
    }

    // 获取最新的token
    const token = Taro.getStorageSync("token");
    if (token && !isWhiteListUrl(config.url ?? "")) {
      config.headers.Authorization = `${token}`;
      // console.log("Request headers:", config.headers);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log("Response:", response);

    if (response.data && response.data.code !== 0 && response.data.code !== 200) {
      const error = new Error(response.data.msg || "请求错误");
      (error as any).response = response;
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    console.error("Response error:", error);

    if (error.response?.status === 401) {
      // 清除登录信息
      Taro.removeStorageSync("token");
      Taro.removeStorageSync("user");

      const config = error.config;
      const currentInstance = Taro.getCurrentInstance();
      const currentPath = currentInstance.router?.path;

      // 尝试自动登录
      try {
        console.log("尝试自动登录");
        const app = currentInstance.app;
        await autoLogin();
        // 自动登录成功,重试之前失败的请求
        return instance(config);
      } catch (loginError) {
        // 自动登录失败,处理跳转逻辑
        if (
          config?.method?.toUpperCase() !== "GET" &&
          currentPath &&
          currentPath !== "/pages/login/index" &&
          !isWhiteListUrl(currentPath)
        ) {
          Taro.setStorageSync("redirectUrl", currentPath);

          Taro.showToast({
            title: "请重新登录",
            icon: "none",
            duration: 1500,
          });

          setTimeout(() => {
            Taro.navigateTo({
              url: "/pages/login/index",
            });
          }, 1500);
        }
      }
      return Promise.reject(error);
    }

    // 处理网络错误
    if (!error.response) {
      Taro.showToast({
        title: "网络错误，请稍后重试",
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(error);
    }

    // 其他错误处理
    const errorMessage = error.response.data?.msg || "请求失败";
    Taro.showToast({
      title: errorMessage,
      icon: "none",
      duration: 2000,
    });

    return Promise.reject(error);
  }
);

// 统一响应处理
function handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
  return new ApiResponse<T>(response);
}

// GET 方法封装
export async function get<T>(
  url: string,
  params?: object
): Promise<ApiResponse<T>> {
  const response = await instance.get(url, { params });
  return handleResponse<T>(response);
}

// POST 方法封装
export async function post<T>(
  url: string,
  data: object
): Promise<ApiResponse<T>> {
  const response = await instance.post(url, data);
  return handleResponse<T>(response);
}

// PUT 方法封装
export async function put<T>(
  url: string,
  data: object
): Promise<ApiResponse<T>> {
  const response = await instance.put(url, data);
  return handleResponse<T>(response);
}

// DELETE 方法封装
export async function deleted<T>(
  url: string,
  params?: object
): Promise<ApiResponse<T>> {
  const response = await instance.delete(url, { params });
  return handleResponse<T>(response);
}

// 导出实例以便直接使用
export default instance;
