import React, { useEffect, useState } from "react";
import { View, Text, Switch, Button } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import Taro from "@tarojs/taro";
import "./index.scss";

const PDPlanDisplay: React.FC = () => {
  const [pdPlan, setPdPlan] = useState<PdPlanVO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPdPlan();
  }, []);

  const fetchPdPlan = async () => {
    setIsLoading(true);
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getCurrentPdPlan(userId);
      if (response.data) {
        setPdPlan(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch PD plan:", error);
      Taro.showToast({
        title: "获取方案失败",
        icon: "none",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: boolean) => {
    if (!pdPlan) return;

    try {
      // Here you would typically call an API to update the plan status
      // For now, we'll just update the local state
      setPdPlan({ ...pdPlan, status: newStatus ? 1 : 0 });
      Taro.showToast({
        title: newStatus ? "方案已启用" : "方案已停用",
        icon: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to update plan status:", error);
      Taro.showToast({
        title: "更新状态失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  const handleAddPlan = () => {
    Taro.navigateTo({ url: "/pages/pdPlanInput/index" });
  };

  const handleLongPress = (planId: number) => {
    Taro.showModal({
      title: "编辑方案",
      content: "是否要编辑此腹透方案？",
      confirmText: "编辑",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({ url: `/pages/pdPlanInput/index?planId=${planId}` });
        }
      },
    });
  };

  const getStatusColor = (status: number) => {
    return status === 1 ? "bg-green" : "bg-gray";
  };

  if (isLoading) {
    return <View className="loading">加载中...</View>;
  }

  if (!pdPlan) {
    return (
      <View className="no-plan">
        <Text>暂无腹透方案</Text>
        <Button className="add-plan-btn" onClick={handleAddPlan}>
          新增方案
        </Button>
      </View>
    );
  }

  return (
    <View className="pd-plan-display">
      <View
        className={`plan-card ${getStatusColor(pdPlan.status)}`}
        onLongPress={() => handleLongPress(pdPlan.id)}
      >
        <View className="card-header">
          <Text className="plan-title">腹透方案 #{pdPlan.id}</Text>
          <Switch
            checked={pdPlan.status === 1}
            onChange={(e) => handleStatusChange(e.detail.value)}
            className="status-switch"
          />
        </View>
        <View className="card-content">
          <Text className="info-item">开始日期: {pdPlan.startDate}</Text>
          <Text className="info-item">每日频次: {pdPlan.dailyFrequency}次</Text>
          <View className="schedules">
            {pdPlan.schedules.map((schedule) => (
              <View key={schedule.sequence} className="schedule-item">
                <Text className="schedule-title">第{schedule.sequence}次</Text>
                <Text className="schedule-detail">
                  时间: {schedule.timeSlot}
                </Text>
                <Text className="schedule-detail">
                  浓度: {schedule.concentration}
                </Text>
                <Text className="schedule-detail">
                  容量: {schedule.volume}ml
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PDPlanDisplay;
