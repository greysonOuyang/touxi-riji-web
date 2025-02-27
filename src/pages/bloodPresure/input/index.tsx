import React, { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Form, Text, Textarea } from "@tarojs/components";
import { addBloodPressureRecord } from "@/api/bloodPressureApi";
import {
  FORM_TYPES,
  saveTempFormData,
  getTempFormData,
  clearTempFormData,
} from "@/utils/tempFormStorage";
import { BP_RANGES } from "@/store/bloodPressure";
import TimeSelector from "@/components/common/TimeSelector";
import FormItem from "@/components/common/FormItem";
import "./index.scss";
import Button from "@/components/common/ConfirmButton";

interface BloodPressureData {
  systolic: string;
  diastolic: string;
  heartRate: string;
  measureDateTime: string;
  note: string;
}

// 血压分类标准
const BP_CATEGORIES = {
  NORMAL: { name: "正常", color: "#4CAF50", className: "normal" },
  ELEVATED: { name: "血压偏高", color: "#FFC107", className: "elevated" },
  HYPERTENSION_1: { name: "高血压一级", color: "#FF9800", className: "hypertension-1" },
  HYPERTENSION_2: { name: "高血压二级", color: "#F44336", className: "hypertension-2" },
  HYPERTENSION_CRISIS: { name: "高血压危象", color: "#D32F2F", className: "hypertension-crisis" },
  LOW: { name: "低血压", color: "#2196F3", className: "low" },
};

// 根据收缩压和舒张压判断血压分类
const getBPCategory = (systolic: number, diastolic: number) => {
  // 先判断高血压危象
  if (systolic >= 180 || diastolic >= 120) {
    return BP_CATEGORIES.HYPERTENSION_CRISIS;
  } 
  // 再判断高血压二级
  else if (systolic >= 140 || diastolic >= 90) {
    return BP_CATEGORIES.HYPERTENSION_2;
  } 
  // 再判断高血压一级
  else if (systolic >= 130 || diastolic >= 80) {
    return BP_CATEGORIES.HYPERTENSION_1;
  } 
  // 再判断血压偏高
  else if (systolic >= 120 && diastolic < 80) {
    return BP_CATEGORIES.ELEVATED;
  } 
  // 再判断低血压
  else if (systolic < 90 || diastolic < 60) {
    return BP_CATEGORIES.LOW;
  } 
  // 最后是正常血压
  else {
    return BP_CATEGORIES.NORMAL;
  }
};

const BloodPressureInputPage: React.FC = () => {
  const initFormData = () => {
    const now = new Date();
    return {
      systolic: "",
      diastolic: "",
      heartRate: "",
      measureDateTime: now.toISOString(),
      note: "",
    };
  };

  const [formData, setFormData] = useState<BloodPressureData>(initFormData());
  const [errors, setErrors] = useState<
    Partial<Record<keyof BloodPressureData, string>>
  >({});

  // 添加血压分类状态
  const [bpCategory, setBpCategory] = useState<typeof BP_CATEGORIES[keyof typeof BP_CATEGORIES] | null>(null);
  
  // 更新血压分类的函数
  const updateBPCategory = (showWarning = false) => {
    const systolic = Number(formData.systolic);
    const diastolic = Number(formData.diastolic);
    
    if (systolic > 0 && diastolic > 0) {
      const category = getBPCategory(systolic, diastolic);
      setBpCategory(category);
      
      // 只有在showWarning为true时才显示健康风险提醒
      if (showWarning) {
        // 检查是否需要显示健康风险提醒
        if (category === BP_CATEGORIES.HYPERTENSION_CRISIS) {
          Taro.showModal({
            title: '血压风险提醒',
            content: '您的血压值处于高血压危象范围，这可能对您的健康造成严重威胁。建议您立即就医或联系医生获取专业建议。',
            confirmText: '我知道了',
            showCancel: false,
          });
        } else if (category === BP_CATEGORIES.HYPERTENSION_2) {
          Taro.showModal({
            title: '血压风险提醒',
            content: '您的血压值处于高血压二级范围，建议您尽快咨询医生获取专业建议。',
            confirmText: '我知道了',
            showCancel: false,
          });
        } else if (systolic < 80 || diastolic < 50) {
          // 严重低血压
          Taro.showModal({
            title: '血压风险提醒',
            content: '您的血压值偏低，可能会导致头晕、乏力等症状。如果您感到不适，建议及时就医。',
            confirmText: '我知道了',
            showCancel: false,
          });
        }
      }
    } else {
      setBpCategory(null);
    }
  };

  useEffect(() => {
    const tempData = getTempFormData(FORM_TYPES.BLOOD_PRESSURE);
    if (tempData) {
      setFormData(tempData);
      clearTempFormData(FORM_TYPES.BLOOD_PRESSURE);
    }
  }, []);

  const handleInputChange = (field: keyof BloodPressureData, value: string) => {
    // 只允许输入数字
    if (field !== "note" && field !== "measureDateTime") {
      value = value.replace(/[^\d]/g, '');
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // 实时验证
    if (field === "systolic" && value) {
      const numValue = Number(value);
      if (numValue < BP_RANGES.SYSTOLIC.MIN || numValue > BP_RANGES.SYSTOLIC.MAX) {
        setErrors(prev => ({
          ...prev,
          systolic: "收缩压数值异常"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          systolic: ""
        }));
      }
    } else if (field === "diastolic" && value) {
      const numValue = Number(value);
      if (numValue < BP_RANGES.DIASTOLIC.MIN || numValue > BP_RANGES.DIASTOLIC.MAX) {
        setErrors(prev => ({
          ...prev,
          diastolic: "舒张压数值异常"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          diastolic: ""
        }));
      }
    } else if (field === "heartRate" && value) {
      const numValue = Number(value);
      if (numValue < BP_RANGES.HEART_RATE.MIN || numValue > BP_RANGES.HEART_RATE.MAX) {
        setErrors(prev => ({
          ...prev,
          heartRate: "心率数值异常"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          heartRate: ""
        }));
      }
    }
    
    // 如果是收缩压或舒张压变化，更新血压分类（不显示警告）
    if (field === "systolic" || field === "diastolic") {
      // 使用setTimeout确保状态已更新
      setTimeout(() => {
        updateBPCategory(false); // 传入false，不显示警告
      }, 0);
    }
  };

  const handleDateTimeChange = (value: string) => {
    handleInputChange("measureDateTime", value);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BloodPressureData, string>> = {};

    if (!formData.systolic) {
      newErrors.systolic = "请输入收缩压";
    } else if (
      Number(formData.systolic) < BP_RANGES.SYSTOLIC.MIN ||
      Number(formData.systolic) > BP_RANGES.SYSTOLIC.MAX
    ) {
      newErrors.systolic = "收缩压数值异常";
    }

    if (!formData.diastolic) {
      newErrors.diastolic = "请输入舒张压";
    } else if (
      Number(formData.diastolic) < BP_RANGES.DIASTOLIC.MIN ||
      Number(formData.diastolic) > BP_RANGES.DIASTOLIC.MAX
    ) {
      newErrors.diastolic = "舒张压数值异常";
    }

    if (
      formData.heartRate &&
      (Number(formData.heartRate) < BP_RANGES.HEART_RATE.MIN || 
       Number(formData.heartRate) > BP_RANGES.HEART_RATE.MAX)
    ) {
      newErrors.heartRate = "心率数值异常";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Taro.showToast({
        title: "请检查输入数据",
        icon: "none",
        duration: 2000
      });
      return;
    }

    // 在提交前更新血压分类并显示警告
    updateBPCategory(true);

    // 使用Promise和setTimeout确保弹窗显示后再继续
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500); // 给弹窗一些显示时间
    });

    try {
      Taro.showLoading({
        title: "提交中...",
        mask: true,
      });

      const submitData = {
        ...formData,
        systolic: Number(formData.systolic),
        diastolic: Number(formData.diastolic),
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        measureTime: formData.measureDateTime,
        userId: Taro.getStorageSync("userId"),
      };

      await addBloodPressureRecord(submitData);
      Taro.hideLoading();
      clearTempFormData(FORM_TYPES.BLOOD_PRESSURE);

      await Taro.showToast({
        title: "添加成功",
        icon: "none",
        mask: true,
        duration: 1000,
      });

      setTimeout(() => {
        Taro.reLaunch({
          url: "/pages/health/index",
          fail: (error) => {
            console.error("跳转失败:", error);
            Taro.redirectTo({
              url: "/pages/health/index",
            });
          },
        });
      }, 1000);
    } catch (error) {
      Taro.hideLoading();
      console.error("提交失败:", error);
      Taro.showToast({
        title: "提交失败",
        icon: "none",
        duration: 2000,
      });
    }
  };

  return (
    <View className="blood-pressure-input-page">
      <Form onSubmit={handleSubmit}>
        <View className="input-section">
          <FormItem
            label="收缩压"
            value={formData.systolic}
            units={["mmHg"]}
            onChange={(value) => handleInputChange("systolic", value)}
            placeholder="请输入收缩压"
            error={errors.systolic}
            required
            type="number"
          />

          <FormItem
            label="舒张压"
            value={formData.diastolic}
            units={["mmHg"]}
            onChange={(value) => handleInputChange("diastolic", value)}
            placeholder="请输入舒张压"
            error={errors.diastolic}
            required
            type="number"
          />
          
          {/* 添加血压分类提示 */}
          {bpCategory && (
            <View 
              className={`bp-category-indicator ${bpCategory.className}`}
              style={{ color: bpCategory.color }}
            >
              血压分类：{bpCategory.name}
            </View>
          )}

          <FormItem
            label="心率"
            value={formData.heartRate}
            units={["次/分"]}
            onChange={(value) => handleInputChange("heartRate", value)}
            placeholder="请输入心率"
            error={errors.heartRate}
            type="number"
          />

          <View className="time-item">
            <TimeSelector
              showLabel={false}
              value={formData.measureDateTime}
              onChange={handleDateTimeChange}
              allowFuture={false}
            />
          </View>
        </View>

        <View className="note-section">
          <Text className="label">备注</Text>
          <View className="textarea-wrapper">
            <Textarea
              className="textarea"
              value={formData.note}
              onInput={(e) => handleInputChange("note", e.detail.value)}
              placeholder="可记录今日状态或其他事项，如胸闷、忘吃降压药等"
            />
          </View>
        </View>

        <View className="button-container">
          <Button text="确认" type="primary" onClick={handleSubmit} />
        </View>
      </Form>
    </View>
  );
};

export default BloodPressureInputPage;
