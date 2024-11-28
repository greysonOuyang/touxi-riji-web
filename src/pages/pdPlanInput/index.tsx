import React, { useEffect, useRef, useState } from "react";
import { View, Input, Image } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector";
import TimePicker from "@/components/TimePicker";
import CapsuleSelector from "@/components/CapsuleSelector";
import "./index.scss";
import FormItem from "@/components/FormItem";
import Taro from "@tarojs/taro";
import { createPdPlan } from "@/api/pdPlanApi";
import dayjs from "dayjs";

interface Schedule {
  timeSlot: string;
  concentration: string;
  volume: number;
}

const PlanForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [dailyFrequency, setDailyFrequency] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>(
    Array(4).fill({
      timeSlot: "",
      concentration: "1.5%",
      volume: 0,
    })
  );
  const [currentTab, setCurrentTab] = useState(0);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTabClick = (index: number) => {
    setCurrentTab(index);
    const tab = tabRefs.current[index];
    if (tab) {
      tab.classList.add("tab-selected");
    }
  };

  const checkScrollIndicators = () => {
    const tabsContainer = tabsRef.current;
    if (tabsContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const handleScroll = () => {
    checkScrollIndicators();
  };

  useEffect(() => {
    checkScrollIndicators();
    const tabsContainer = tabsRef.current;
    if (tabsContainer) {
      tabsContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (tabsContainer) {
        tabsContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [dailyFrequency]);

  const updateFrequency = (frequency: number) => {
    setDailyFrequency(frequency);
    setSchedules(
      Array(frequency).fill({
        timeSlot: "",
        concentration: "1.5%",
        volume: 2000,
      })
    );
  };

  const handleScheduleChange = (index: number, updatedSchedule: Schedule) => {
    const newSchedules = [...schedules];
    newSchedules[index] = updatedSchedule;
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
    const planData = {
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
      const response = await createPdPlan(planData);
      console.log("方案创建成功，方案ID：", response.data);
      Taro.showToast({
        title: "方案创建成功",
        icon: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("提交方案失败：", error);
      Taro.showToast({
        title: "提交方案失败，请重试",
        icon: "none",
        duration: 2000,
      });
    }
  };

  const handleNextStep = () => {
    if (!startDate) {
      Taro.showToast({
        title: "请选择开始日期",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    setStep(1);
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
            {showLeftIndicator && <View className="scroll-indicator left" />}

            <View className="tabs" ref={tabsRef}>
              {Array(dailyFrequency)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    className={`tab ${
                      currentTab === index ? "active-tab" : ""
                    }`}
                    onClick={() => handleTabClick(index)}
                    ref={(el) => (tabRefs.current[index] = el)}
                  >
                    <View className="tab-content">
                      <View className="tab-text">{`第${index + 1}次`}</View>
                      {currentTab === index && (
                        <View className="tab-indicator" />
                      )}
                    </View>
                  </View>
                ))}
            </View>

            {showRightIndicator && <View className="scroll-indicator right" />}
          </View>

          <View className="tab-content">
            <View className="form-group row">
              <View className="label">浓度</View>
              <CapsuleSelector
                options={["1.5%", "2.5%", "4.25%"]}
                selected={schedules[currentTab].concentration}
                onSelect={(option: string) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    concentration: option,
                  })
                }
              />
            </View>

            <View className="form-group row">
              <TimePicker
                label="透析时间"
                value={schedules[currentTab].timeSlot}
                showArrowIcon={true}
                onChange={(time) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    timeSlot: time,
                  })
                }
              />
            </View>

            <FormItem
              label="透析液容量"
              value={String(schedules[currentTab].volume)}
              unit="ml"
              onChange={(newValue) =>
                handleScheduleChange(currentTab, {
                  ...schedules[currentTab],
                  volume: Number(newValue),
                })
              }
            />
          </View>
        </View>
      )}

      <View className="button-container">
        {step === 0 ? (
          <View className="primary-button" onClick={handleNextStep}>
            下一步
          </View>
        ) : (
          <>
            <View className="secondary-button" onClick={() => setStep(0)}>
              返回
            </View>
            <View className="primary-button" onClick={handleSubmit}>
              提交方案
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default PlanForm;
