import Taro from "@tarojs/taro";

// utils/auth.ts
interface AuthRequestOptions {
  onBeforeRequest?: () => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
  saveState?: () => any;
  showErrorToast?: boolean;
}

// utils/auth.ts
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
      showErrorToast = true
    } = options;

    try {
      onBeforeRequest?.();

      const token = Taro.getStorageSync('token');
      if (!token) {
        if (saveState) {
          const state = saveState();
          Taro.setStorageSync('tempState', state);
        }

        // 保存当前页面路径
        const pages = Taro.getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage) {
          const path = `/${currentPage.route}`;
          console.log('保存重定向路径:', path);
          Taro.setStorageSync('redirectUrl', path);
        }

        Taro.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/login/index'
              });
            }
          }
        });
        return null;
      }

      const response = await requestFn(...args);
      onSuccess?.(response);
      return response;
    } catch (error) {
      console.error('请求错误:', error);
      
      // 处理 401 错误
      if (error.response?.status === 401) {
        // 清除失效的 token
        Taro.removeStorageSync('token');
        
        if (saveState) {
          const state = saveState();
          Taro.setStorageSync('tempState', state);
        }

        // 保存当前页面路径
        const pages = Taro.getCurrentPages();
        const currentPage = pages[pages.length - 1];
        if (currentPage) {
          const path = `/${currentPage.route}`;
          Taro.setStorageSync('redirectUrl', path);
        }

        Taro.showModal({
          title: '提示',
          content: '登录已过期，请重新登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/login/index'
              });
            }
          }
        });
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
