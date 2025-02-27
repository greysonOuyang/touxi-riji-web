import React from "react"
import { View, Text } from "@tarojs/components"
import "./ViewModeSelector.scss"

interface ViewModeSelectorProps {
  viewMode: "day" | "week" | "month"
  onViewModeChange: (mode: "day" | "week" | "month") => void
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <View className="view-mode-selector">
      <View className="selector-container">
        {/* 滑动指示器 */}
        <View className={`slider-indicator ${viewMode}`}></View>
        
        {/* 选项按钮 */}
        <View 
          className={`selector-item ${viewMode === "day" ? "active" : ""}`}
          onClick={() => onViewModeChange("day")}
        >
          <Text>日</Text>
        </View>
        <View 
          className={`selector-item ${viewMode === "week" ? "active" : ""}`}
          onClick={() => onViewModeChange("week")}
        >
          <Text>周</Text>
        </View>
        <View 
          className={`selector-item ${viewMode === "month" ? "active" : ""}`}
          onClick={() => onViewModeChange("month")}
        >
          <Text>月</Text>
        </View>
      </View>
    </View>
  )
}

export default ViewModeSelector 