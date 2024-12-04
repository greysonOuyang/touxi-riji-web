import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import { addPdRecord, NewPdRecord, isFirstTimeUser } from "@/api/pdRecordApi";
import Taro, { useDidShow } from "@tarojs/taro";
import FormItem from "@/components/common/FormItem";
import CapsuleSelector from "@/components/common/CapsuleSelector";
import "./index.scss";
import Button from "@/components/common/ConfirmButton";

const pdPlanRecord: React.FC = () => {
  const [plan, setPlan] = useState<PdPlanVO | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [concentration, setConcentration] = useState("1.5%");
  const [infusionVolume, setInfusionVolume] = useState("2000");
  const [drainageVolume, setDrainageVolume] = useState("");
  const [drainageUnit, setDrainageUnit] = useState("ml");
  const [isFirstTime, setIsFirstTime] = useState(false);

  console.log("pdPlan/record rendering");

  useEffect(() => {
    console.log("useEffect hook triggered");
    fetchPdPlan();
    checkFirstTimeUser();
    Taro.setNavigationBarTitle({
      title: "记录腹透数据",
    });
  }, []);

  useDidShow(() => {
    console.log("useDidShow hook triggered");
    fetchPdPlan();
  });

  const checkFirstTimeUser = async () => {
    console.log("Checking if user is first time user");
    try {
      const userId = Taro.getStorageSync("userId");
      console.log("User ID:", userId);
      const response = await isFirstTimeUser(userId);
      console.log("First time user response:", response);
      if (response.isSuccess()) {
        setIsFirstTime(response.data);
        console.log("Is first time user:", response.data);
      } else {
        console.error("Failed to check if user is first time:", response.msg);
      }
    } catch (error) {
      console.error("Error checking if user is first time:", error);
    }
  };

  const fetchPdPlan = async () => {
    console.log("Fetching PD plan");
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getCurrentPdPlan(userId);
      if (response.isSuccess()) {
        setPlan(response.data);
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        const matchingSchedule = response.data.schedules.find(
          (schedule, index) => {
            const [scheduleHour, scheduleMinute] = schedule.timeSlot
              .split(":")
              .map(Number);
            if (index === response.data.schedules.length - 1) {
              return true;
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
      } else {
        console.error("Failed to fetch PD plan:", response.msg);
        Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
      }
    } catch (error) {
      console.error("Error fetching PD plan:", error);
      Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
    }
  };

  const handleSubmit = async () => {
    if (
      !plan ||
      !concentration ||
      !infusionVolume ||
      (!isFirstTime && !drainageVolume)
    ) {
      Taro.showToast({ title: "请填写所有必填字段", icon: "none" });
      return;
    }

    const now = new Date();
    const newRecord: NewPdRecord = {
      userId: Taro.getStorageSync("userId"),
      recordDate: now.toISOString().split("T")[0],
      recordTime: now.toTimeString().split(" ")[0],
      dialysateType: concentration,
      infusionVolume: parseInt(infusionVolume),
      drainageVolume: isFirstTime
        ? 0
        : drainageUnit === "kg"
        ? Math.round(parseFloat(drainageVolume) * 1000)
        : parseInt(drainageVolume),
    };

    try {
      const response = await addPdRecord(newRecord);
      if (response.isSuccess()) {
        Taro.showToast({ title: "记录添加成功", icon: "success" });
        Taro.setStorageSync("refreshUltrafiltrationView", true);
        Taro.navigateBack();
      } else {
        console.error("Failed to add PD record:", response.msg);
        Taro.showToast({ title: "添加记录失败", icon: "none" });
      }
    } catch (error) {
      console.error("Error adding PD record:", error);
      Taro.showToast({ title: "添加记录失败", icon: "none" });
    }
  };

  const handleInfusionVolumeChange = (value: string) => {
    setInfusionVolume(value.replace(/\D/g, ""));
  };

  const handleDrainageVolumeChange = (value: string) => {
    setDrainageVolume(value);
  };

  const handleDrainageUnitChange = (value: string, unit: string) => {
    setDrainageUnit(unit);
    if (!value) return "";

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";

    if (unit === "kg") {
      return (numValue / 1000).toFixed(2);
    } else {
      return Math.round(numValue * 1000).toString();
    }
  };

  return (
    <View className="pd-record-page">
      <View className="form-container">
        <View className="form-group concentration-group">
          <Text className="label">浓度</Text>
          <CapsuleSelector
            options={["1.5%", "2.5%", "4.25%"]}
            selected={concentration}
            onSelect={(option) => setConcentration(option as string)}
          />
        </View>

        <FormItem
          label="引入量"
          value={infusionVolume}
          units={["ml"]}
          onChange={handleInfusionVolumeChange}
          placeholder="点击输入"
        />

        {!isFirstTime && (
          <FormItem
            label="引流量"
            value={drainageVolume}
            units={["ml", "kg"]}
            onChange={handleDrainageVolumeChange}
            onUnitChange={handleDrainageUnitChange}
            placeholder="点击输入"
          />
        )}
      </View>

      <View className="button-container">
        <Button text="确认" type="primary" onClick={handleSubmit} />
      </View>
    </View>
  );
};

export default pdPlanRecord;
