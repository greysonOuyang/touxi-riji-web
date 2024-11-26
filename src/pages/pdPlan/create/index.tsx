import React, { useEffect, useRef, useState } from "react";
import { View, Input } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector";
import TimePicker from "@/components/TimePicker";
import CapsuleSelector from "@/components/CapsuleSelector";
import "./index.scss";

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
      volume: 2000,
    })
  );
  const [currentTab, setCurrentTab] = useState(0);

  const tabsRef = useRef<HTMLDivElement>(null); // tabs容器ref
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]); // 单个tab的refs

  const handleTransitionEnd = (index: number) => {
    const tab = tabRefs.current[index];
    if (tab) {
      tab.classList.remove("tab-selected");
    }
  };

  const scrollToCenter = (index: number) => {
    const tabsContainer = tabsRef.current;
    const selectedTab = tabRefs.current[index];

    if (tabsContainer && selectedTab) {
      const containerWidth = tabsContainer.offsetWidth;
      const tabWidth = selectedTab.offsetWidth;
      const scrollWidth = tabsContainer.scrollWidth;
      const tabOffsetLeft = selectedTab.offsetLeft;

      // 计算理想的滚动位置（将选中的tab居中）
      let targetScrollLeft = tabOffsetLeft - (containerWidth - tabWidth) / 2;

      // 确保不会出现空白（左边界处理）
      targetScrollLeft = Math.max(0, targetScrollLeft);

      // 确保不会出现空白（右边界处理）
      const maxScrollLeft = scrollWidth - containerWidth;
      targetScrollLeft = Math.min(targetScrollLeft, maxScrollLeft);

      tabsContainer.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // 添加滚动指示器
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  // 检查是否需要显示滚动指示器
  const checkScrollIndicators = () => {
    const tabsContainer = tabsRef.current;
    if (tabsContainer) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainer;
      setShowLeftIndicator(scrollLeft > 0);
      setShowRightIndicator(scrollLeft + clientWidth < scrollWidth);
    }
  };

  // 监听滚动事件
  const handleScroll = () => {
    checkScrollIndicators();
  };

  // 组件挂载和更新时检查滚动指示器
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

  const handleSubmit = () => {
    console.log("提交数据：", { dailyFrequency, startDate, schedules });
  };

  return (
    <View className="plan-form">
      {step === 0 ? (
        <View className="step-one">
          {/* 开始日期 */}
          <View className="form-group">
            <TimeSelector
              label="开始日期"
              showLabel={true}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              allowFuture={false}
            />
          </View>

          {/* 每日透析次数 */}
          <View className="form-group row">
            <View className="label">每日透析次数:</View>
            <CapsuleSelector
              options={[1, 2, 3, 4, 5, 6]}
              selected={dailyFrequency}
              onSelect={(option) => updateFrequency(option as number)}
            />
          </View>
        </View>
      ) : (
        <View className="step-two">
          {/* Tab 切换 */}
          <View className="tabs-wrapper">
            <View className="tabs" ref={tabsRef}>
              {Array(dailyFrequency)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    className={`tab ${
                      currentTab === index ? "active-tab" : ""
                    }`}
                    onClick={() => {
                      setCurrentTab(index);
                      scrollToCenter(index);
                      // 添加点击动画类
                      const tab = tabRefs.current[index];
                      if (tab) {
                        tab.classList.add("tab-selected");
                      }
                    }}
                    ref={(el) => (tabRefs.current[index] = el)}
                    onTransitionEnd={() => handleTransitionEnd(index)}
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
          </View>

          {/* Tab 内容 */}
          <View className="tab-content">
            <View className="form-group">
              <TimePicker
                label="透析时间"
                value={schedules[currentTab].timeSlot}
                onChange={(time) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    timeSlot: time,
                  })
                }
              />
            </View>

            <View className="form-group row">
              <View className="label">浓度:</View>
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
              <View className="label">透析液容量 (ml):</View>
              <Input
                type="number"
                placeholder="输入容量"
                value={String(schedules[currentTab].volume)}
                onInput={(e) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    volume: Number(e.detail.value),
                  })
                }
              />
            </View>
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
