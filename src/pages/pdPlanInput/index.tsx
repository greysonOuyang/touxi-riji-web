import React, { useEffect, useRef, useState } from "react";
import { View, Input, Image } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector";
import TimePicker from "@/components/TimePicker";
import CapsuleSelector from "@/components/CapsuleSelector";
import "./index.scss";
import FormItem from "@/components/FormItem";
import Taro from "@tarojs/taro";
import { createPdPlan } from "@/api/pdPlanApi"; // 导入API方法
import dayjs from "dayjs"; // 确保引入 dayjs

interface Schedule {
  timeSlot: string;
  concentration: string;
  volume: number;
}

const PlanForm: React.FC = () => {
  const [step, setStep] = useState(0); // 当前步骤：0=基础信息，1=填写计划
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

  const tabsRef = useRef<HTMLDivElement>(null); // tabs容器ref
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]); // 单个tab的refs

  // 添加滚动指示器
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  const handleTabClick = (index: number) => {
    setCurrentTab(index);

    // 添加点击动画类
    const tab = tabRefs.current[index];
    if (tab) {
      tab.classList.add("tab-selected");
    }
  };

  const checkScrollIndicators = () => {
    const tabsContainer = tabsRef.current;
    if (tabsContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;

      // 左侧指示器：当 scrollLeft 大于 0 时显示
      setShowLeftIndicator(scrollLeft > 0);

      // 右侧指示器：当右侧还有内容未显示时显示
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

  const handleSubmit = async () => {
    // 格式化 startDate 为 "YYYY-MM-DD"
    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    // 构建请求参数
    const planData = {
      userId: Taro.getStorageSync("useraId"), // 根据实际情况获取用户ID
      dailyFrequency,
      startDate: formattedStartDate,
      schedules: schedules.map((schedule, index) => ({
        sequence: index + 1, // 序列号从1开始
        timeSlot: schedule.timeSlot,
        concentration: schedule.concentration,
        volume: schedule.volume,
      })),
    };

    try {
      const response = await createPdPlan(planData);
      console.log("方案创建成功，方案ID：", response.data); // 处理成功逻辑
      // 可以在此处添加成功提示或重定向逻辑
      Taro.showToast({
        title: "成功",
        icon: "none",
        duration: 2000,
      });
    } catch (error) {
      console.error("提交方案失败：", error);
      Taro.showToast({
        title: "失败",
        icon: "none",
        duration: 2000,
      });
      // 处理错误逻辑，比如提示用户
    }
  };

  return (
    <View className="plan-form">
      {step === 0 ? (
        <View className="step-one">
          {/* 每日透析次数 */}
          <View className="form-group row">
            <View className="label">每日透析次数</View>
            <CapsuleSelector
              options={[1, 2, 3, 4, 5, 6]}
              selected={dailyFrequency}
              onSelect={(option) => updateFrequency(option as number)}
            />
          </View>

          {/* 开始日期 */}
          <View className="form-group">
            <TimeSelector
              mode="date"
              label="开始日期"
              showLabel={true}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              allowFuture={false}
            />
          </View>
        </View>
      ) : (
        <View className="step-two">
          {/* Tab 切换 */}
          <View className="tabs-wrapper">
            {/* 左滚动指示器 */}
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

            {/* 右滚动指示器 */}
            {showRightIndicator && <View className="scroll-indicator right" />}
          </View>

          {/* Tab 内容 */}
          <View className="tab-content">
            <View className="form-group row">
              <View className="label">浓度</View>
              <CapsuleSelector
                options={["1.5%", "2.5%", "4.25%"]} // 类型是 string[]
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

      {/* 按钮固定在底部 */}
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
              提交方案
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default PlanForm;
