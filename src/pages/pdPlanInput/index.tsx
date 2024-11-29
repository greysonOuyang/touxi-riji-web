import React, { useEffect, useState } from "react";
import { View, Text } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector";
import TimePicker from "@/components/TimePicker";
import CapsuleSelector from "@/components/CapsuleSelector";
import FormItem from "@/components/FormItem";
import Taro from "@tarojs/taro";
import {
  createPdPlan,
  updatePdPlan,
  PdPlanVO,
  PdPlanDTO,
} from "@/api/pdPlanApi";
import dayjs from "dayjs";
import "./index.scss";

interface Schedule {
  sequence: number;
  timeSlot: string;
  concentration: string;
  volume: number;
}

const formatTimeToHHMM = (time: string) => {
  return time.substring(0, 5); // This will return just HH:mm
};

const PlanForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [dailyFrequency, setDailyFrequency] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>(
    Array(4)
      .fill(null)
      .map((_, index) => ({
        sequence: index + 1,
        timeSlot: "",
        concentration: "1.5%",
        volume: 2000,
      }))
  );
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [planId, setPlanId] = useState<number | null>(null);

  useEffect(() => {
    const eventChannel =
      Taro.getCurrentInstance()?.page?.getOpenerEventChannel?.();

    if (eventChannel) {
      eventChannel.on(
        "acceptDataFromOpenerPage",
        (data: { plan?: PdPlanVO }) => {
          if (data.plan) {
            setIsEditing(true);
            setPlanId(data.plan.id);
            setDailyFrequency(data.plan.dailyFrequency);
            setStartDate(data.plan.startDate);
            setSchedules(
              data.plan.schedules.map((schedule) => ({
                ...schedule,
                timeSlot: formatTimeToHHMM(schedule.timeSlot),
              }))
            );
          }
        }
      );
    }
  }, []);

  const updateFrequency = (frequency: number) => {
    setDailyFrequency(frequency);
    setSchedules(
      Array(frequency)
        .fill(null)
        .map((_, index) => ({
          sequence: index + 1,
          timeSlot: "",
          concentration: "1.5%",
          volume: 2000,
        }))
    );
  };

  const handleScheduleChange = (
    index: number,
    updatedSchedule: Partial<Schedule>
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], ...updatedSchedule };
    setSchedules(newSchedules);
  };

  const validateForm = () => {
    if (!startDate) {
      Taro.showToast({
        title: "请选择开始日期",
        icon: "none",
        duration: 2000,
      });
      return false;
    }

    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.volume) {
        Taro.showToast({
          title: `请填写第${i + 1}次透析的容量`,
          icon: "none",
          duration: 2000,
        });
        return false;
      }
      if (!schedule.concentration) {
        Taro.showToast({
          title: `请选择第${i + 1}次透析的浓度`,
          icon: "none",
          duration: 2000,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const planData: PdPlanDTO = {
      userId: Taro.getStorageSync("userId"),
      dailyFrequency,
      startDate: formattedStartDate,
      schedules: schedules.map((schedule, index) => ({
        sequence: index + 1,
        timeSlot: schedule.timeSlot,
        concentration: schedule.concentration,
        volume: schedule.volume,
      })),
    };

    try {
      if (isEditing && planId) {
        await updatePdPlan(planId, planData);
        Taro.showToast({
          title: "方案更新成功",
          icon: "success",
          duration: 2000,
        });
      } else {
        await createPdPlan(planData);
        Taro.showToast({
          title: "方案创建成功",
          icon: "success",
          duration: 2000,
        });
      }

      // 触发刷新事件
      const eventChannel =
        Taro.getCurrentInstance()?.page?.getOpenerEventChannel?.();
      eventChannel?.emit("refreshPlanData");

      Taro.navigateBack();
    } catch (error) {
      console.error("提交方案失败：", error);
      Taro.showToast({
        title: isEditing ? "更新方案失败，请重试" : "创建方案失败，请重试",
        icon: "none",
        duration: 2000,
      });
    }
  };

  return (
    <View className="plan-form">
      {step === 0 ? (
        <View className="step-one">
          <View className="form-group row">
            <View className="label">每日透析次数</View>
            <CapsuleSelector
              options={[1, 2, 3, 4, 5, 6]}
              selected={dailyFrequency}
              onSelect={(option) => updateFrequency(option as number)}
            />
          </View>

          <View className="form-group">
            <TimeSelector
              mode="date"
              label="开始日期"
              showLabel={true}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              allowFuture={false}
              defaultToCurrent={false}
            />
          </View>
        </View>
      ) : (
        <View className="step-two">
          <View className="tabs-wrapper">
            <View className="tabs">
              {schedules.map((_, index) => (
                <View
                  key={index}
                  className={`tab ${currentTab === index ? "active-tab" : ""}`}
                  onClick={() => setCurrentTab(index)}
                >
                  <View className="tab-content">
                    <View className="tab-text">{`第${index + 1}次`}</View>
                    {currentTab === index && <View className="tab-indicator" />}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className="tab-content">
            <View className="form-group row">
              <View className="label">浓度</View>
              <CapsuleSelector
                options={["1.5%", "2.5%", "4.25%"]}
                selected={schedules[currentTab].concentration}
                onSelect={(option: string) =>
                  handleScheduleChange(currentTab, { concentration: option })
                }
              />
            </View>

            <View className="form-group row">
              <TimePicker
                label="透析时间"
                value={schedules[currentTab].timeSlot}
                showArrowIcon={true}
                onChange={(time) =>
                  handleScheduleChange(currentTab, { timeSlot: time })
                }
              />
            </View>

            <FormItem
              label="透析液容量"
              value={String(schedules[currentTab].volume)}
              unit="ml"
              onChange={(newValue) =>
                handleScheduleChange(currentTab, { volume: Number(newValue) })
              }
            />
          </View>
        </View>
      )}

      <View className="button-container">
        {step === 0 ? (
          <View className="primary-button" onClick={() => setStep(1)}>
            下一步
          </View>
        ) : (
          <>
            <View className="secondary-button" onClick={() => setStep(0)}>
              返回
            </View>
            <View className="primary-button" onClick={handleSubmit}>
              {isEditing ? "更新方案" : "创建方案"}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default PlanForm;
