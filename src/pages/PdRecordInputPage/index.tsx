import React, { useState, useEffect } from "react";
import { View, Text, Input, Picker } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import { addPdRecord, NewPdRecord } from "@/api/pdRecordApi";
import Taro from "@tarojs/taro";
import "./index.scss";

const PdRecordInputPage: React.FC = () => {
  const [plan, setPlan] = useState<PdPlanVO | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [concentration, setConcentration] = useState("");
  const [infusionVolume, setInfusionVolume] = useState("");
  const [drainageVolume, setDrainageVolume] = useState("");
  const [recordTime, setRecordTime] = useState("");

  useEffect(() => {
    fetchPdPlan();
  }, []);

  const fetchPdPlan = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getCurrentPdPlan(userId);
      if (response.isSuccess()) {
        setPlan(response.data);
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        // Find the matching schedule based on current time
        const matchingSchedule = response.data.schedules.find(
          (schedule, index) => {
            const [scheduleHour, scheduleMinute] = schedule.timeSlot
              .split(":")
              .map(Number);
            if (index === response.data.schedules.length - 1) {
              return true; // Last schedule of the day
            }
            const nextSchedule = response.data.schedules[index + 1];
            const [nextHour, nextMinute] = nextSchedule.timeSlot
              .split(":")
              .map(Number);
            return (
              (currentHour > scheduleHour ||
                (currentHour === scheduleHour &&
                  currentMinute >= scheduleMinute)) &&
              (currentHour < nextHour ||
                (currentHour === nextHour && currentMinute < nextMinute))
            );
          }
        );

        if (matchingSchedule) {
          setSequenceNumber(matchingSchedule.sequence);
          setConcentration(matchingSchedule.concentration);
          setInfusionVolume(matchingSchedule.volume.toString());
        }

        setRecordTime(
          `${currentHour.toString().padStart(2, "0")}:${currentMinute
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
      }
    } catch (error) {
      console.error("获取腹透计划时发生错误:", error);
      Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
    }
  };

  const handleSubmit = async () => {
    if (
      !plan ||
      !concentration ||
      !infusionVolume ||
      !drainageVolume ||
      !recordTime
    ) {
      Taro.showToast({ title: "请填写所有必填字段", icon: "none" });
      return;
    }

    const newRecord: NewPdRecord = {
      userId: Taro.getStorageSync("userId"),
      recordDate: new Date().toISOString().split("T")[0],
      recordTime,
      dialysateType: concentration,
      infusionVolume: parseInt(infusionVolume),
      drainageVolume: parseInt(drainageVolume),
    };

    try {
      const response = await addPdRecord(newRecord);
      if (response.isSuccess()) {
        Taro.showToast({ title: "记录添加成功", icon: "success" });
        Taro.navigateBack();
      } else {
        Taro.showToast({ title: "添加记录失败", icon: "none" });
      }
    } catch (error) {
      console.error("添加记录时发生错误:", error);
      Taro.showToast({ title: "添加记录失败", icon: "none" });
    }
  };

  return (
    <View className="pd-record-input">
      <Text className="title">记录腹透数据</Text>
      <View className="form-item">
        <Text className="label">第 {sequenceNumber} 次</Text>
      </View>
      <View className="form-item">
        <Text className="label">浓度</Text>
        <Picker
          mode="selector"
          range={["1.5%", "2.5%", "4.25%"]}
          onChange={(e) => setConcentration(e.detail.value)}
        >
          <View className="picker">{concentration || "请选择"}</View>
        </Picker>
      </View>
      <View className="form-item">
        <Text className="label">进入量 (ml)</Text>
        <Input
          type="number"
          value={infusionVolume}
          onInput={(e) => setInfusionVolume(e.detail.value)}
        />
      </View>
      <View className="form-item">
        <Text className="label">引流量 (ml)</Text>
        <Input
          type="number"
          value={drainageVolume}
          onInput={(e) => setDrainageVolume(e.detail.value)}
        />
      </View>
      <View className="form-item">
        <Text className="label">记录时间</Text>
        <Picker
          mode="time"
          value={recordTime}
          onChange={(e) => setRecordTime(e.detail.value)}
        >
          <View className="picker">{recordTime || "请选择"}</View>
        </Picker>
      </View>
      <View className="submit-button" onClick={handleSubmit}>
        提交
      </View>
    </View>
  );
};

export default PdRecordInputPage;
