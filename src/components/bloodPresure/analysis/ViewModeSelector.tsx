import React from "react"
import { View, Text } from "@tarojs/components"

interface ViewModeSelectorProps {
  viewMode: "day" | "week" | "month"
  onViewModeChange: (mode: "day" | "week" | "month") => void
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <View className="view-type-selector">
      <View 
        className={`selector-item ${viewMode === "day" ? "active" : ""}`}
        onClick={() => onViewModeChange("day")}
      >
        日视图
      </View>
      <View 
        className={`selector-item ${viewMode === "week" ? "active" : ""}`}
        onClick={() => onViewModeChange("week")}
      >
        周视图
      </View>
      <View 
        className={`selector-item ${viewMode === "month" ? "active" : ""}`}
        onClick={() => onViewModeChange("month")}
      >
        月视图
      </View>
    </View>
  )
}

export default ViewModeSelector 