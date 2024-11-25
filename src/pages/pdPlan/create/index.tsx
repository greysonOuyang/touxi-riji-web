import React, { useState } from "react";
import { View, Text, Picker, Input } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector"; // 自定义时间组件
import "./index.scss";

interface Schedule {
  timeSlot: string;
  concentration: string;
  volume: number;
}

const PlanForm: React.FC = () => {
  const [step, setStep] = useState(0); // 当前步骤：0=基础信息，1=填写计划
  const [dailyFrequency, setDailyFrequency] = useState<number>(4); // 默认4次
  const [startDate, setStartDate] = useState<string>(""); // 默认无值
  const [schedules, setSchedules] = useState<Schedule[]>(
    Array(4).fill({
      timeSlot: "",
      concentration: "1.5%",
      volume: 2000,
    })
  );
  const [currentTab, setCurrentTab] = useState(0); // 当前Tab索引

  // 更新透析次数后动态调整Tab数量
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

  // 更新单次透析计划
  const handleScheduleChange = (index: number, updatedSchedule: Schedule) => {
    const newSchedules = [...schedules];
    newSchedules[index] = updatedSchedule;
    setSchedules(newSchedules);
  };

  // 提交方案
  const handleSubmit = () => {
    console.log("提交数据：", { dailyFrequency, startDate, schedules });
  };

  return (
    <View className="plan-form">
      {step === 0 ? (
        // 第一步：填写基础信息
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
          <View className="form-group">
            <Text className="label">每日透析次数:</Text>
            <View className="capsule-container">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <View
                    key={index}
                    className={`capsule-segment ${
                      dailyFrequency === index + 1 ? "active" : ""
                    }`}
                    onClick={() => updateFrequency(index + 1)}
                  >
                    {index + 1}
                  </View>
                ))}
            </View>
          </View>

          {/* 下一步按钮 */}
          <View className="button-container">
            <View className="next-button" onClick={() => setStep(1)}>
              下一步
            </View>
          </View>
        </View>
      ) : (
        // 第二步：填写透析计划
        <View className="step-two">
          {/* Tab 切换 */}
          <View className="tabs">
            {Array(dailyFrequency)
              .fill(0)
              .map((_, index) => (
                <View
                  key={index}
                  className={`tab ${currentTab === index ? "active-tab" : ""}`}
                  onClick={() => setCurrentTab(index)}
                >
                  {`计划 ${index + 1}`}
                </View>
              ))}
          </View>

          {/* Tab 内容 */}
          <View className="tab-content">
            <View className="form-group">
              <Text className="label">透析时间:</Text>
              <Picker
                mode="time"
                value={schedules[currentTab].timeSlot}
                onChange={(e) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    timeSlot: e.detail.value,
                  })
                }
              >
                <View className="picker">
                  {schedules[currentTab].timeSlot || "请选择时间"}
                </View>
              </Picker>
            </View>
            <View className="form-group">
              <Text className="label">浓度:</Text>
              <View className="capsule-container">
                {["1.5%", "2.5%", "4.25%"].map((option) => (
                  <View
                    key={option}
                    className={`capsule-segment ${
                      schedules[currentTab].concentration === option
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleScheduleChange(currentTab, {
                        ...schedules[currentTab],
                        concentration: option,
                      })
                    }
                  >
                    {option}
                  </View>
                ))}
              </View>
            </View>
            <View className="form-group">
              <Text className="label">透析液容量 (ml):</Text>
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

          {/* 按钮组 */}
          <View className="button-container">
            <View className="back-button" onClick={() => setStep(0)}>
              返回
            </View>
            <View className="submit-button" onClick={handleSubmit}>
              提交方案
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlanForm;
