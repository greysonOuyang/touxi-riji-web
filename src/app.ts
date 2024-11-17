// app.ts
import { Component } from 'react'
import { autoLogin } from '@/utils/auth'
import Taro from '@tarojs/taro'

interface IProps {
  children: React.ReactNode
}

class App extends Component<IProps> {
  componentDidMount() {
    this.checkLoginStatus()
  }

  async checkLoginStatus() {
    try {
      const token = Taro.getStorageSync('token')
      if (!token) {
        await autoLogin()
      }
    } catch (error) {
      console.error('登录状态检查失败:', error)
    }
  }

  render() {
    return this.props.children
  }
}

export default App
