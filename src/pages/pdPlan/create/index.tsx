import React from "react";
import { View, Input } from "@tarojs/components";
import TimeSelector from "@/components/TimeSelector";
import TimePicker from "@/components/TimePicker";

const CapsuleSelector = ({ options, selected, onSelect }) => (
  <View className="capsule-selector">
    {options.map((option, index) => (
      <View
        key={index}
        className={`capsule-item ${selected === option ? "active" : ""}`}
        onClick={() => onSelect(option)}
      >
        {option}
      </View>
    ))}
  </View>
);

const PlanForm = ({
  step,
  setStep,
  startDate,
  setStartDate,
  dailyFrequency,
  updateFrequency,
  currentTab,
  setCurrentTab,
  schedules,
  handleScheduleChange,
  handleSubmit,
}) => {
  return (
    <View className="plan-form">
      {step === 0 ? (
        <View className="step-one">
          {/* 开始日期 */}
          <View className="form-row">
            <TimeSelector
              label="开始日期"
              showLabel={true}
              value={startDate}
              onChange={setStartDate}
              allowFuture={false}
            />
          </View>

          {/* 每日透析次数 */}
          <View className="form-row">
            <View className="form-label">每日透析次数:</View>
            <CapsuleSelector
              options={[1, 2, 3, 4, 5, 6]}
              selected={dailyFrequency}
              onSelect={updateFrequency}
            />
          </View>

          {/* 下一步按钮 */}
          <View className="button-group">
            <View className="button primary" onClick={() => setStep(1)}>
              下一步
            </View>
          </View>
        </View>
      ) : (
        <View className="step-two">
          {/* Tab 切换 */}
          <View className="tabs">
            {Array(dailyFrequency)
              .fill(0)
              .map((_, index) => (
                <View
                  key={index}
                  className={`tab ${currentTab === index ? "active" : ""}`}
                  onClick={() => setCurrentTab(index)}
                >
                  {`计划 ${index + 1}`}
                </View>
              ))}
          </View>

          {/* Tab 内容 */}
          <View className="tab-content">
            <View className="form-row">
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

            <View className="form-row">
              <View className="form-label">浓度:</View>
              <CapsuleSelector
                options={["1.5%", "2.5%", "4.25%"]}
                selected={schedules[currentTab].concentration}
                onSelect={(option) =>
                  handleScheduleChange(currentTab, {
                    ...schedules[currentTab],
                    concentration: option,
                  })
                }
              />
            </View>

            <View className="form-row">
              <View className="form-label">透析液容量 (ml):</View>
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
          <View className="button-group vertical">
            <View className="button secondary" onClick={() => setStep(0)}>
              返回
            </View>
            <View className="button primary" onClick={handleSubmit}>
              提交方案
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlanForm;
