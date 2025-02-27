import React from "react"
import { View, Text } from "@tarojs/components"
import { AtIcon } from 'taro-ui'
import { format, startOfWeek, endOfWeek, isValid } from "date-fns"
import { zhCN } from 'date-fns/locale'

interface DateNavigatorProps {
  mode: "day" | "week" | "month"
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next') => void
  onReset: () => void
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ mode, currentDate, onNavigate, onReset }) => {
  // 确保日期有效
  const ensureValidDate = (date: Date): Date => {
    return isValid(date) ? date : new Date()
  }
  
  // 根据不同模式生成日期范围显示文本
  const getDateRangeText = () => {
    const validDate = ensureValidDate(currentDate)
    
    switch (mode) {
      case 'day':
        return format(validDate, 'yyyy年MM月dd日')
      case 'week': {
        // 获取当前日期是星期几 (0是周日，1是周一，以此类推)
        const day = validDate.getDay()
        
        // 计算本周的开始日期（周日）
        const startDate = new Date(validDate)
        startDate.setDate(validDate.getDate() - day)
        
        // 计算本周的结束日期（周六）
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        
        // 如果结束日期超过今天，则使用今天作为结束日期
        const today = new Date()
        const actualEndDate = endDate > today ? today : endDate
        
        return `${format(startDate, 'MM/dd')}-${format(actualEndDate, 'MM/dd')}`
      }
      case 'month':
        return format(validDate, 'yyyy年MM月')
      default:
        return ''
    }
  }

  return (
    <View className="date-navigation">
      <View className="nav-button prev-button" onClick={() => onNavigate('prev')}>
        {/* 使用CSS生成的箭头 */}
      </View>
      <View className="date-range-container" onClick={onReset}>
        <AtIcon value='calendar' size='12' color='#92A3FD' className="calendar-icon"></AtIcon>
        <Text className="date-range">{getDateRangeText()}</Text>
      </View>
      <View className="nav-button next-button" onClick={() => onNavigate('next')}>
        {/* 使用CSS生成的箭头 */}
      </View>
    </View>
  )
}

export default DateNavigator 