// utils/auth.ts

import Taro from "@tarojs/taro";

interface AuthRequestOptions {
  onBeforeRequest?: () => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
  saveState?: () => any;
  showErrorToast?: boolean;
  loginMessage?: string;
}

export const isLoggedIn = () => {
  return !!Taro.getStorageSync('token');
};

// 保存当前页面状态
const saveCurrentPageState = (saveState?: () => any) => {
  if (saveState) {
    const state = saveState();
    Taro.setStorageSync('tempState', state);
  }

  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage) {
    const path = `/${currentPage.route}`;
    console.log('保存重定向路径:', path);
    Taro.setStorageSync('redirectUrl', path);
  }
};

// 显示登录确认框
const showLoginConfirm = (message: string = '请先登录') => {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '提示',
      content: message,
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({
            url: '/pages/login/index'
          });
        }
        resolve(res.confirm);
      }
    });
  });
};

export const withAuth = (
  requestFn: (...args: any[]) => Promise<any>,
  options: AuthRequestOptions = {}
) => {
  return async (...args: any[]) => {
    const {
      onBeforeRequest,
      onSuccess,
      onError,
      onComplete,
      saveState,
      showErrorToast = true,
      loginMessage
    } = options;

    try {
      onBeforeRequest?.();

      const token = Taro.getStorageSync('token');
      if (!token) {
        saveCurrentPageState(saveState);
        await showLoginConfirm(loginMessage);
        return null;
      }

      const response = await requestFn(...args);
      onSuccess?.(response);
      return response;
    } catch (error) {
      console.error('请求错误:', error);
      
      if (error.response?.status === 401) {
        Taro.removeStorageSync('token');
        saveCurrentPageState(saveState);
        await showLoginConfirm('登录已过期，请重新登录');
        return null;
      }

      onError?.(error);
      if (showErrorToast) {
        Taro.showToast({
          title: error.message || '请求失败',
          icon: 'none',
          duration: 2000
        });
      }
      throw error;
    } finally {
      onComplete?.();
    }
  };
};

// 用于普通登录检查的包装器
export const withLoginCheck = (
  callback: Function,
  message?: string
) => {
  return async (...args: any[]) => {
    if (!isLoggedIn()) {
      const confirmed = await showLoginConfirm(message);
      if (!confirmed) return;
      return;
    }
    return callback(...args);
  };
};
