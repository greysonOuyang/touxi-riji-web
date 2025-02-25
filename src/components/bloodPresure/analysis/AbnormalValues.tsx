import React from "react"
import { View, Text } from "@tarojs/components"

interface AbnormalValuesProps {
  abnormalValues: string[]
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ abnormalValues }) => {
  if (abnormalValues.length === 0) return null
  
  return (
    <View className="abnormal-values-container">
      <Text className="abnormal-title">异常值提醒</Text>
      <View className="abnormal-list">
        {abnormalValues.map((message, index) => (
          <Text key={index} className="abnormal-item">{message}</Text>
        ))}
      </View>
    </View>
  )
}

export default AbnormalValues 