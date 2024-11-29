import React, { useState, useEffect, ChangeEvent } from "react";
import { View, Text } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import { addPdRecord, NewPdRecord } from "@/api/pdRecordApi";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";

const PdRecordInputPage: React.FC = () => {
  const [plan, setPlan] = useState<PdPlanVO | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [concentration, setConcentration] = useState("1.5%");
  const [infusionVolume, setInfusionVolume] = useState("2000");
  const [drainageVolume, setDrainageVolume] = useState("");
  const [isDrainageKg, setIsDrainageKg] = useState(false);

  useEffect(() => {
    fetchPdPlan();
    Taro.setNavigationBarTitle({
      title: "记录腹透数据",
    });
  }, []);

  useDidShow(() => {
    fetchPdPlan();
  });

  const fetchPdPlan = async () => {
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
        Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
      }
    } catch (error) {
      console.error("获取腹透计划时发生错误:", error);
      Taro.showToast({ title: "获取腹透计划失败", icon: "none" });
    }
  };

  const handleSubmit = async () => {
    if (!plan || !concentration || !infusionVolume || !drainageVolume) {
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
      drainageVolume: isDrainageKg
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
        Taro.showToast({ title: "添加记录失败", icon: "none" });
      }
    } catch (error) {
      console.error("添加记录时发生错误:", error);
      Taro.showToast({ title: "添加记录失败", icon: "none" });
    }
  };

  const toggleDrainageUnit = () => {
    setIsDrainageKg(!isDrainageKg);
    if (drainageVolume) {
      if (isDrainageKg) {
        setDrainageVolume((parseFloat(drainageVolume) * 1000).toFixed(0));
      } else {
        setDrainageVolume((parseFloat(drainageVolume) / 1000).toFixed(2));
      }
    }
  };

  const handleDrainageVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isDrainageKg) {
      setDrainageVolume(value.replace(/[^\d.]/g, ""));
    } else {
      setDrainageVolume(value.replace(/\D/g, ""));
    }
  };

  const handleInfusionVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInfusionVolume(e.target.value.replace(/\D/g, ""));
  };

  return (
    <View className="pd-record-page">
      <View className="form-container">
        <View className="form-group">
          <View className="input-row">
            <Text className="label">浓度</Text>
            <View className="concentration-selector">
              {["1.5%", "2.5%", "4.25%"].map((option) => (
                <View
                  key={option}
                  className={`option ${
                    concentration === option ? "selected" : ""
                  }`}
                  onClick={() => setConcentration(option)}
                >
                  {option}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="form-group">
          <View className="input-row">
            <Text className="label">引入量</Text>
            <View className="input-wrapper">
              <View className="input-field">
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={infusionVolume}
                  onChange={handleInfusionVolumeChange}
                  placeholder="点击输入"
                />
              </View>
              <Text className="unit">ml</Text>
            </View>
          </View>
        </View>

        <View className="form-group">
          <View className="input-row">
            <Text className="label">引流量</Text>
            <View className="input-wrapper">
              <View className="input-field">
                <input
                  type="text"
                  inputMode={isDrainageKg ? "decimal" : "numeric"}
                  className="input"
                  value={drainageVolume}
                  onChange={handleDrainageVolumeChange}
                  placeholder="点击输入"
                />
              </View>
              <View className="unit-switch" onClick={toggleDrainageUnit}>
                {isDrainageKg ? "kg" : "ml"}
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="button-container">
        <View className="submit-button" onClick={handleSubmit}>
          确认
        </View>
      </View>
    </View>
  );
};

export default PdRecordInputPage;
