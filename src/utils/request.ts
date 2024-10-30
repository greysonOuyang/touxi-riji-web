import Taro from '@tarojs/taro';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

// 请求超时时间
axios.defaults.timeout = 120000;
// post请求头
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded;charset=UTF-8';

axios.interceptors.request.use(
  (config) => {
    // 获取 token
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

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 这里根据后端返回的状态码进行处理
    return response;
  },
  function (error) {
    console.log(error);
    return Promise.reject(error);
  }
);

/*
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };

    axios
      .post(url, params, { headers })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * put方法，对应put请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function put(url, params) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    axios
      .put(url, params, { headers })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}

/**
 * delete方法，对应delete请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function deleted(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, {
        params: params,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}