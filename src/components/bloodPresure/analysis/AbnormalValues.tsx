import React from "react"
import { View, Text } from "@tarojs/components"
import "./index.scss"

interface AbnormalValuesProps {
  data?: any[]
}

const AbnormalValues: React.FC<AbnormalValuesProps> = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return null
  }

  const abnormalItems = data.filter(item => 
    item.systolic > 140 || 
    item.diastolic > 90 || 
    (item.heartRate && (item.heartRate < 60 || item.heartRate > 100))
  )

  if (abnormalItems.length === 0) {
    return null
  }

  return (
    <View className="abnormal-values">
      <Text className="title">异常数值提醒</Text>
      {abnormalItems.map((item, index) => (
        <View key={index} className="abnormal-item">
          <Text>时间：{item.timestamp}</Text>
          <Text>收缩压：{item.systolic}mmHg</Text>
          <Text>舒张压：{item.diastolic}mmHg</Text>
          {item.heartRate && <Text>心率：{item.heartRate}bpm</Text>}
        </View>
      ))}
    </View>
  )
}

export default AbnormalValues 