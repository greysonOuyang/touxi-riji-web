import React from "react"
import { View, Text } from "@tarojs/components"

const ChartIndicators: React.FC = () => {
  return (
    <View className="indicators">
      <View className="indicator-item">
        <View className="indicator-dot" style={{ background: "#FF8A8A" }} />
        <Text className="indicator-text">收缩压</Text>
      </View>
      <View className="indicator-item">
        <View className="indicator-dot" style={{ background: "#92A3FD" }} />
        <Text className="indicator-text">舒张压</Text>
      </View>
      <View className="indicator-item">
        <View className="indicator-dot" style={{ background: "#4CAF50" }} />
        <Text className="indicator-text">心率</Text>
      </View>
      <Text className="chart-unit">单位：mmHg</Text>
    </View>
  )
}

export default ChartIndicators 