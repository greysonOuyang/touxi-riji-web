import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { getCurrentPdPlan, PdPlanVO } from "@/api/pdPlanApi";
import { addPdRecord, NewPdRecord, isFirstTimeUser } from "@/api/pdRecordApi";
import Taro, { useDidShow } from "@tarojs/taro";
import FormItem from "@/components/common/FormItem";
import CapsuleSelector from "@/components/common/CapsuleSelector";
import NumericInput from "@/components/common/NumericInputProps";
import Popup from "@/components/common/Popup";
import TimeSelector from "@/components/common/TimeSelector";
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
  const [recordDateTime, setRecordDateTime] = useState("");
  
  // 添加数字键盘相关状态
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState<"infusion" | "drainage" | null>(null);
  const [activeFieldLabel, setActiveFieldLabel] = useState("");

  console.log("pdPlan/record rendering");

  useEffect(() => {
    console.log("useEffect hook triggered");
    fetchPdPlan();
    checkFirstTimeUser();
    // 设置当前时间
    const now = new Date();
    setRecordDateTime(now.toISOString());
    
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
      (!isFirstTime && !drainageVolume) ||
      !recordDateTime
    ) {
      Taro.showToast({ title: "请填写所有必填字段", icon: "none" });
      return;
    }

    const recordDate = new Date(recordDateTime);
    const drainageVolumeValue = isFirstTime
        ? 0
        : drainageUnit === "kg"
        ? Math.round(parseFloat(drainageVolume) * 1000)
        : parseInt(drainageVolume);
    
    const infusionVolumeValue = parseInt(infusionVolume);
    const ultrafiltrationValue = drainageVolumeValue - infusionVolumeValue;
    
    const newRecord: NewPdRecord = {
      userId: Taro.getStorageSync("userId"),
      recordDate: recordDate.toISOString().split("T")[0],
      recordTime: recordDate.toTimeString().split(" ")[0],
      dialysateType: concentration,
      infusionVolume: infusionVolumeValue,
      drainageVolume: drainageVolumeValue,
      ultrafiltration: ultrafiltrationValue,
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

  // 修改处理输入值的函数
  const handleInfusionVolumeChange = (value: string) => {
    setInfusionVolume(value);
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
  
  // 添加处理日期时间变化的函数
  const handleDateTimeChange = (value: string) => {
    setRecordDateTime(value);
  };
  
  // 添加显示数字键盘的函数
  const showNumericKeyboard = (field: "infusion" | "drainage") => {
    setActiveField(field);
    setActiveFieldLabel(field === "infusion" ? "引入量" : "引流量");
    setShowKeyboard(true);
  };
  
  // 添加隐藏数字键盘的函数
  const hideNumericKeyboard = () => {
    setShowKeyboard(false);
    setActiveField(null);
  };
  
  // 添加数字键盘完成回调
  const handleNumericInputComplete = () => {
    hideNumericKeyboard();
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

        <View className="form-item-wrapper">
          <View className="form-item">
            <View className="left-section">
              <Text className="label">引入量</Text>
            </View>
            <View className="right-section" onClick={() => showNumericKeyboard("infusion")}>
              <View className="input-box">
                {infusionVolume || "点击输入"}
              </View>
              <View className="unit-box">ml</View>
            </View>
          </View>
        </View>

        {!isFirstTime && (
          <View className="form-item-wrapper">
            <View className="form-item">
              <View className="left-section">
                <Text className="label">引流量</Text>
              </View>
              <View className="right-section" onClick={() => showNumericKeyboard("drainage")}>
                <View className="input-box">
                  {drainageVolume || "点击输入"}
                </View>
                <View className="unit-box" onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡
                  const newUnit = drainageUnit === "ml" ? "kg" : "ml";
                  setDrainageUnit(newUnit);
                  if (drainageVolume) {
                    const newValue = handleDrainageUnitChange(drainageVolume, newUnit);
                    setDrainageVolume(newValue);
                  }
                }}>
                  {drainageUnit}
                </View>
              </View>
            </View>
          </View>
        )}
        
        <View className="time-selector-container">
          <View className="time-item">
            <Text className="label">记录时间</Text>
            <TimeSelector
              showLabel={false}
              value={recordDateTime}
              onChange={handleDateTimeChange}
              allowFuture={false}
              mode="datetime"
              defaultToCurrent={true}
            />
          </View>
        </View>
      </View>

      <View className="button-container">
        <Button text="确认" type="primary" onClick={handleSubmit} />
      </View>
      
      <Popup 
        visible={showKeyboard} 
        onClose={hideNumericKeyboard}
        title={activeFieldLabel}
      >
        <View className="numeric-keyboard-wrapper">
          <NumericInput
            value={activeField === "infusion" ? infusionVolume : drainageVolume}
            onChange={activeField === "infusion" ? handleInfusionVolumeChange : handleDrainageVolumeChange}
            unit={activeField === "infusion" ? "ml" : drainageUnit}
            onComplete={handleNumericInputComplete}
          />
          <View className="safe-area-bottom" />
        </View>
      </Popup>
    </View>
  );
};

export default pdPlanRecord;
