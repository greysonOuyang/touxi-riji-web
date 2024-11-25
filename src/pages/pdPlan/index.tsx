// src/pages/CreatePlan.tsx
import React, { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import { createPdPlan, getCurrentPdPlan } from "@/api/pdPlanApi"; // 导入API方法
import PlanForm from "@/pages/pdPlan/create";
import PlanOverview from "@/components/PlanOverview";
import { PdPlanDTO, PdPlanVO } from "@/api/pdPlanApi"; // 导入类型定义
import "./index.scss";
import { View } from "@tarojs/components";

const CreatePlan: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [hasPlan, setHasPlan] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [dailyFrequency, setDailyFrequency] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setUserId(Taro.getStorageSync("userId"));

      // 获取当前透析方案
      if (userId) {
        try {
          const response = await getCurrentPdPlan(userId);
          if (response.code === 200 && response.data) {
            const plan: PdPlanVO = response.data;
            setHasPlan(true);
            setDailyFrequency(plan.dailyFrequency);
            setStartDate(plan.startDate);
            setSchedules(plan.schedules);
          } else {
            console.error(response.msg);
          }
        } catch (error) {
          console.error("获取透析方案失败", error);
        }
      }
    };

    fetchData();
  }, [userId]);

  const handleFrequencyChange = (frequency: number) => {
    const newSchedules = Array(frequency).fill({
      timeSlot: "",
      concentration: "1.5%",
      volume: 2000,
      dwellTime: 240,
    });
    setSchedules(newSchedules);
    setDailyFrequency(frequency);
  };

  const handleScheduleChange = (index: number, newSchedule: any) => {
    const newSchedules = [...schedules];
    newSchedules[index] = newSchedule;
    setSchedules(newSchedules);
  };

  const handleSubmit = async () => {
    const planData: PdPlanDTO = {
      userId,
      dailyFrequency,
      startDate,
      schedules,
    };

    try {
      if (hasPlan) {
        // 更新方案
        // await updatePdPlan(userId, planData); // 假设有 planId
        Taro.showToast({ title: "方案已更新", icon: "success" });
      } else {
        // 创建新方案
        await createPdPlan(planData);
        Taro.showToast({ title: "方案已创建", icon: "success" });
      }
      setHasPlan(true);
      setIsEditing(false);
    } catch (error) {
      Taro.showToast({ title: "保存失败，请重试", icon: "none" });
      console.error("保存透析方案失败", error);
    }
  };

  return (
    <View className="pd-plan-container">
      {hasPlan && !isEditing ? (
        <PlanOverview
          dailyFrequency={dailyFrequency}
          startDate={startDate}
          onEdit={() => setIsEditing(true)}
        />
      ) : (
        <PlanForm
          dailyFrequency={dailyFrequency}
          startDate={startDate}
          schedules={schedules}
          onFrequencyChange={handleFrequencyChange}
          onStartDateChange={setStartDate}
          onScheduleChange={handleScheduleChange}
          onSubmit={handleSubmit}
        />
      )}
    </View>
  );
};

export default CreatePlan;
