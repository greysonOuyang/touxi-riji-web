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
        try {
          const start = startOfWeek(validDate, { weekStartsOn: 1, locale: zhCN })
          const end = endOfWeek(validDate, { weekStartsOn: 1, locale: zhCN })
          return `${format(start, 'MM月dd日')} - ${format(end, 'MM月dd日')}`
        } catch (error) {
          console.error('周日期计算错误:', error)
          return format(validDate, 'yyyy年MM月')
        }
      }
      case 'month':
        return format(validDate, 'yyyy年MM月')
      default:
        return ''
    }
  }

  return (
    <View className="date-navigation">
      <View className="nav-button" onClick={() => onNavigate('prev')}>
        <AtIcon value='chevron-left' size='16' color='#92A3FD'></AtIcon>
      </View>
      <View className="date-range-container" onClick={onReset}>
        <AtIcon value='calendar' size='14' color='#92A3FD' className="calendar-icon"></AtIcon>
        <Text className="date-range">{getDateRangeText()}</Text>
      </View>
      <View className="nav-button" onClick={() => onNavigate('next')}>
        <AtIcon value='chevron-right' size='16' color='#92A3FD'></AtIcon>
      </View>
    </View>
  )
}

export default DateNavigator 