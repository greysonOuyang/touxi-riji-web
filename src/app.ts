import { Component } from 'react';
import Taro from '@tarojs/taro';
import UCharts from '@qiun/ucharts';
import './app.scss';

global.UCharts = UCharts; // 全局注册 uCharts

interface IProps {
  children: React.ReactNode;
}

class App extends Component<IProps> {
  componentDidMount() {
    this.checkLoginStatus();
  }

  async checkLoginStatus() {
    try {
      const token = Taro.getStorageSync('token');
      if (!token) {
        // 假设 autoLogin 已优化为异步导入或精简
        const { autoLogin } = await import('@/utils/auth');
        await autoLogin();
      }
    } catch (error) {
      console.error('登录状态检查失败:', error);
    }
  }

  render() {
    return this.props.children;
  }
}

export default App;