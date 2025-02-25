import React from "react"
import { View, Text } from "@tarojs/components"
import { AtIcon } from 'taro-ui'

interface DateNavigatorProps {
  dateRange: string
  onPrev: () => void
  onNext: () => void
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ dateRange, onPrev, onNext }) => {
  return (
    <View className="date-navigation">
      <View className="nav-button" onClick={onPrev}></View>
      <View className="date-range-container">
        <AtIcon value='calendar' size='14' color='#92A3FD' className="calendar-icon"></AtIcon>
        <Text className="date-range">{dateRange}</Text>
      </View>
      <View className="nav-button" onClick={onNext}></View>
    </View>
  )
}

export default DateNavigator 