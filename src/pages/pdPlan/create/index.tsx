import React, { useState, useEffect } from "react";
import { View, Text, Picker, Input, Slider } from "@tarojs/components";
import { AtAccordion } from "taro-ui";
import TimeSelector from "@/components/TimeSelector"; // 用户自定义时间选择组件
import "./index.scss";

interface Schedule {
  timeSlot: string;
  concentration: string;
  volume: number;
  dwellTime: number;
}

const PlanForm: React.FC = () => {
  const [step, setStep] = useState(0); // 当前步骤：0=基础信息，1=填写计划
  const [dailyFrequency, setDailyFrequency] = useState<number>(4); // 默认4次
  const [startDate, setStartDate] = useState<string>(""); // 开始日期
  const [schedules, setSchedules] = useState<Schedule[]>([]); // 透析计划
  const [openTab, setOpenTab] = useState<number>(0); // 当前展开的Tab索引

  // 初始化透析计划
  useEffect(() => {
    const defaultSchedule: Schedule = {
      timeSlot: "",
      concentration: "1.5%",
      volume: 2000,
      dwellTime: 240,
    };
    setSchedules(Array(dailyFrequency).fill(defaultSchedule));
  }, [dailyFrequency]);

  // 更新单次透析计划
  const handleScheduleChange = (
    index: number,
    field: keyof Schedule,
    value: any
  ) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
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
          <View className="form-group">
            <TimeSelector
              label="开始日期"
              showLabel={true}
              value={startDate}
              onChange={(date) => setStartDate(date)}
              allowFuture={false}
            />
          </View>
          <View className="form-group">
            <Text className="label">每日透析次数: {dailyFrequency}</Text>
            <View className="slider-container">
              <View className="slider-value">{dailyFrequency}</View>
              <Slider
                step={1}
                min={1}
                max={6}
                value={dailyFrequency}
                onChange={(e) => setDailyFrequency(e.detail.value as number)}
                className="frequency-slider"
              />
            </View>
          </View>
          <View className="button-container">
            <View
              className="next-button"
              onClick={() => setStep(1)}
              style={{
                opacity: startDate ? 1 : 0.5,
                pointerEvents: startDate ? "auto" : "none",
              }}
            >
              下一步
            </View>
          </View>
        </View>
      ) : (
        // 第二步：填写透析计划
        <View className="step-two">
          {Array(dailyFrequency)
            .fill(0)
            .map((_, index) => (
              <AtAccordion
                key={index}
                open={openTab === index}
                title={`第 ${index + 1} 次透析`}
                onClick={() => setOpenTab(openTab === index ? -1 : index)}
              >
                {openTab === index && (
                  <View className="tab-content">
                    <View className="form-group">
                      <Text className="label">透析时间</Text>
                      <TimeSelector
                        value={schedules[index].timeSlot}
                        onChange={(value) =>
                          handleScheduleChange(index, "timeSlot", value)
                        }
                      />
                    </View>
                    <View className="form-group">
                      <Text className="label">浓度</Text>
                      <Picker
                        mode="selector"
                        range={["1.5%", "2.5%", "4.25%"]}
                        value={["1.5%", "2.5%", "4.25%"].indexOf(
                          schedules[index].concentration
                        )}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "concentration",
                            ["1.5%", "2.5%", "4.25%"][e.detail.value]
                          )
                        }
                      >
                        <View className="picker">
                          {schedules[index].concentration || "请选择浓度"}
                        </View>
                      </Picker>
                    </View>
                    <View className="form-group">
                      <Text className="label">透析液容量 (ml)</Text>
                      <Input
                        type="number"
                        placeholder="请输入容量"
                        value={String(schedules[index].volume || "")}
                        onInput={(e) =>
                          handleScheduleChange(
                            index,
                            "volume",
                            Number(e.detail.value)
                          )
                        }
                      />
                    </View>
                    <View className="form-group">
                      <Text className="label">滞留时间 (分钟)</Text>
                      <Input
                        type="number"
                        placeholder="请输入滞留时间"
                        value={String(schedules[index].dwellTime || "")}
                        onInput={(e) =>
                          handleScheduleChange(
                            index,
                            "dwellTime",
                            Number(e.detail.value)
                          )
                        }
                      />
                    </View>
                  </View>
                )}
              </AtAccordion>
            ))}
          <View className="button-container">
            <View
              className="submit-button"
              onClick={handleSubmit}
              style={{
                opacity: schedules.some(
                  (s) =>
                    !s.timeSlot || !s.concentration || !s.volume || !s.dwellTime
                )
                  ? 0.5
                  : 1,
                pointerEvents: schedules.some(
                  (s) =>
                    !s.timeSlot || !s.concentration || !s.volume || !s.dwellTime
                )
                  ? "none"
                  : "auto",
              }}
            >
              提交方案
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlanForm;
