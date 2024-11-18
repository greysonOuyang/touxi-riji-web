import React, { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Form, Input, Text, Textarea } from "@tarojs/components";
import { addBloodPressureRecord } from "@/api/bloodPressureApi";
import {
  FORM_TYPES,
  saveTempFormData,
  getTempFormData,
  clearTempFormData,
} from "@/utils/tempFormStorage";
import TimeSelector from "@/components/TimeSelector";
import "./index.scss";
import CustomTimePicker from "@/components/CustomTimePicker";

interface BloodPressureData {
  systolic: string | number;
  diastolic: string | number;
  heartRate: string | number;
  measureDateTime: string;
  note: string;
}

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

  useEffect(() => {
    const tempData = getTempFormData(FORM_TYPES.BLOOD_PRESSURE);
    if (tempData) {
      setFormData(tempData);
      clearTempFormData(FORM_TYPES.BLOOD_PRESSURE);
    }
  }, []);

  const handleInputChange = (field: keyof BloodPressureData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateTimeChange = (value: string) => {
    handleInputChange("measureDateTime", value);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BloodPressureData, string>> = {};

    if (!formData.systolic) {
      newErrors.systolic = "请输入收缩压";
    } else if (
      Number(formData.systolic) < 60 ||
      Number(formData.systolic) > 250
    ) {
      newErrors.systolic = "收缩压数值异常";
    }

    if (!formData.diastolic) {
      newErrors.diastolic = "请输入舒张压";
    } else if (
      Number(formData.diastolic) < 40 ||
      Number(formData.diastolic) > 150
    ) {
      newErrors.diastolic = "舒张压数值异常";
    }

    if (
      formData.heartRate &&
      (Number(formData.heartRate) < 40 || Number(formData.heartRate) > 200)
    ) {
      newErrors.heartRate = "心率数值异常";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

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
        icon: "success",
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

  // BloodPressureInputPage 组件的 return 部分修改
  return (
    <View className="blood-pressure-input-page">
      <Form onSubmit={handleSubmit}>
        <View className="input-section">
          <View className="form-item">
            <Text className="label">
              收缩压<Text className="required">*</Text>
            </Text>
            <View className="input-wrapper">
              <Input
                type="number"
                className="input"
                value={formData.systolic as string}
                onInput={(e) => handleInputChange("systolic", e.detail.value)}
                placeholder="请输入收缩压"
              />
              <Text className="unit">mmHg</Text>
            </View>
            {errors.systolic && (
              <Text className="error-text">{errors.systolic}</Text>
            )}
          </View>

          <View className="form-item">
            <Text className="label">
              舒张压<Text className="required">*</Text>
            </Text>
            <View className="input-wrapper">
              <Input
                type="number"
                className="input"
                value={formData.diastolic as string}
                onInput={(e) => handleInputChange("diastolic", e.detail.value)}
                placeholder="请输入舒张压"
              />
              <Text className="unit">mmHg</Text>
            </View>
            {errors.diastolic && (
              <Text className="error-text">{errors.diastolic}</Text>
            )}
          </View>

          <View className="form-item">
            <Text className="label">心率</Text>
            <View className="input-wrapper">
              <Input
                type="number"
                className="input"
                value={formData.heartRate as string}
                onInput={(e) => handleInputChange("heartRate", e.detail.value)}
                placeholder="请输入心率"
              />
              <Text className="unit">次/分</Text>
            </View>
            {errors.heartRate && (
              <Text className="error-text">{errors.heartRate}</Text>
            )}
          </View>

          <TimeSelector
            showLabel={false}
            value={formData.measureDateTime}
            onChange={handleDateTimeChange}
            allowFuture={false}
          />
        </View>

        <View className="note-section">
          <Text className="label">备注</Text>
          <View className="textarea-wrapper">
            <Textarea
              className="textarea"
              value={formData.note}
              onInput={(e) => handleInputChange("note", e.detail.value)}
              placeholder="请输入备注信息"
            />
          </View>
        </View>

        <View className="confirm-button" onClick={handleSubmit}>
          保存
        </View>
      </Form>
    </View>
  );
};

export default BloodPressureInputPage;
