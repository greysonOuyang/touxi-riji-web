import React, { useEffect, useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import Taro from "@tarojs/taro";
import "./PDPlanDisplay.scss";

const PDPlanDisplay: React.FC = () => {
  const [pdPlan, setPdPlan] = useState<PdPlanVO | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    fetchPdPlan();
  }, []);

  const fetchPdPlan = async () => {
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
      setIsInitialized(true);
    }
  };

  const handleAddPlan = () => {
    Taro.navigateTo({
      url: "/pages/pdPlanInput/index",
      events: {
        // 监听编辑页面返回的事件
        refreshPlanData: fetchPdPlan,
      },
    });
  };

  const handleEditPlan = () => {
    if (!pdPlan) return;
    Taro.navigateTo({
      url: `/pages/pdPlanInput/index`,
      events: {
        // 监听编辑页面返回的事件
        refreshPlanData: fetchPdPlan,
      },
      success: (res) => {
        res.eventChannel.emit("acceptDataFromOpenerPage", { plan: pdPlan });
      },
    });
  };

  const formatTime = (timeSlot: string) => {
    if (!timeSlot) return "";
    const [hours, minutes] = timeSlot.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  if (!isInitialized) {
    return null; // 不渲染任何内容，直到初始化完成
  }

  if (!pdPlan) {
    return (
      <View className="no-plan">
        <Text className="no-plan-text">暂无腹透方案</Text>
        <View className="button-container">
          <View className="primary-button" onClick={handleAddPlan}>
            新增方案
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="pd-plan-display">
      <View className="plan-card">
        <View className="card-header">
          <Text className="plan-title">腹透方案</Text>
          <Image
            src="../../assets/icons/edit_button.png"
            className="edit-icon"
            onClick={handleEditPlan}
          />
        </View>
        <View className="card-content">
          <View className="plan-info">
            <View className="info-item">
              <Text className="info-label">开始日期:</Text>
              <Text className="info-value">{pdPlan.startDate}</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">每日频次:</Text>
              <Text className="info-value">{pdPlan.dailyFrequency}次</Text>
            </View>
          </View>
          <View className="schedules">
            {pdPlan.schedules.map((schedule) => (
              <View key={schedule.sequence} className="schedule-item">
                <View className="schedule-header">
                  <Text className="schedule-title">
                    第{schedule.sequence}次
                  </Text>
                </View>
                <View className="schedule-details">
                  {schedule.timeSlot && (
                    <View className="schedule-detail">
                      <Text className="detail-label">时间:</Text>
                      <Text className="detail-value">
                        {formatTime(schedule.timeSlot)}
                      </Text>
                    </View>
                  )}
                  <View className="schedule-detail">
                    <Text className="detail-label">浓度:</Text>
                    <Text className="detail-value">
                      {schedule.concentration}
                    </Text>
                  </View>
                  <View className="schedule-detail">
                    <Text className="detail-label">容量:</Text>
                    <Text className="detail-value">{schedule.volume}ml</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PDPlanDisplay;
