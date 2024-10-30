// /utils/auth.ts
import Taro from '@tarojs/taro';

export const checkLogin = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const token = Taro.getStorageSync('token');
    
    if (!token) {
      Taro.showModal({
        title: '提示',
        content: '您还未登录，是否前往登录以保存数据？',
        success: function (res) {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/login/index' // 跳转到登录页面
            });
            resolve(false);
          } else {
            resolve(false);
          }
        },
        fail: function (err) {
          reject(err);
        }
      });
    } else {
      resolve(true);
    }
  });
};