// src/components/PlanOverview.tsx
import React from "react";
import { View, Text, Button } from "@tarojs/components";

interface PlanOverviewProps {
  dailyFrequency: number;
  startDate: string;
  onEdit: () => void;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({
  dailyFrequency,
  startDate,
  onEdit,
}) => {
  return (
    <View className="pd-plan-overview">
      <View className="summary">
        <Text className="summary-title">当前方案</Text>
        <Text>每日透析次数: {dailyFrequency}</Text>
        <Text>开始日期: {startDate}</Text>
      </View>
      <Button className="edit-button" onClick={onEdit}>
        修改方案
      </Button>
    </View>
  );
};

export default PlanOverview;
