import React, { useState, useEffect } from "react";
import { View, Text, Picker, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import Popup from "@/components/common/Popup";
import {
  addWeightRecord,
  NewWeightRecord,
  getLatestWeight,
} from "@/api/weightApi";
import TimeSelector from "@/components/common/TimeSelector"; // 引入 TimeSelector 组件
import "./index.scss";
import ArrowRight from "@/components/common/ArrowRight";

interface WeightInputPopupProps {
  isOpened: boolean;
  onClose: () => void;
  onAfterSubmit: () => void;
}

interface FormState {
  weight: string;
  measurementDatetime: string;
  displayDateTime: string;
}

const WeightInputPopup: React.FC<WeightInputPopupProps> = ({
  isOpened,
  onClose,
  onAfterSubmit,
}) => {
  // 初始化状态
  const [formData, setFormData] = useState<FormState>(() => {
    const initialNow = dayjs();
    return {
      weight: "60.0",
      measurementDatetime: initialNow.format("YYYY-MM-DD HH:mm:ss"),
      displayDateTime: initialNow.format("YYYY年MM月DD日 HH:mm"),
    };
  });

  // 每次打开弹窗时更新时间和获取最新体重
  useEffect(() => {
    if (isOpened) {
      const currentTime = dayjs();
      setFormData((prev) => ({
        ...prev,
        measurementDatetime: currentTime.format("YYYY-MM-DD HH:mm:ss"),
        displayDateTime: currentTime.format("YYYY年MM月DD日 HH:mm"),
      }));

      // 获取最新体重
      const fetchLatestWeight = async () => {
        const userId = Taro.getStorageSync("userId");
        const res = await getLatestWeight(userId);
        if (res?.isSuccess() && res.data?.latestWeight) {
          setFormData((prev) => ({
            ...prev,
            weight: res.data.latestWeight.toFixed(1),
          }));
        }
      };
      fetchLatestWeight();
    }
  }, [isOpened]);

  const generateWeightColumns = () => {
    const integers = Array.from({ length: 151 }, (_, i) =>
      i.toString().padStart(2, "0")
    );
    const decimals = Array.from({ length: 10 }, (_, i) => i.toString());
    return [integers, ["."], decimals, ["公斤"]];
  };

  const getWeightPickerValue = () => {
    const [integer, decimal] = formData.weight.split(".");
    return [
      parseInt(integer),
      0, // 小数点的索引
      parseInt(decimal),
      0, // "公斤"的索引
    ];
  };

  const handleWeightChange = async (e) => {
    const [integer, , decimal] = e.detail.value;
    const weightValue = `${integer}.${decimal}`;
    setFormData((prev) => ({ ...prev, weight: weightValue }));
    
    // 直接提交体重记录
    const userId = Taro.getStorageSync("userId");
    const requestData: NewWeightRecord = {
      userId,
      weight: parseFloat(weightValue),
      measurementDatetime: formData.measurementDatetime,
      scaleType: "MANUAL",
    };

    const response = await addWeightRecord(requestData);

    if (response?.isSuccess()) {
      await Taro.showToast({
        title: "添加成功",
        icon: "success",
        mask: true,
        duration: 1000,
      });
      onAfterSubmit();
      onClose();
    } else {
      await Taro.showToast({
        title: response?.msg || "添加失败",
        icon: "error",
        mask: true,
        duration: 2000,
      });
    }
  };

  return (
    <Popup
      visible={isOpened}
      onClose={onClose}
      title={<Text>记录体重</Text>}
    >
      <View className="weight-input-popup">
        <View className="weight-form-item">
          <TimeSelector
            value={formData.measurementDatetime}
            onChange={(newValue) =>
              setFormData((prev) => ({
                ...prev,
                measurementDatetime: newValue,
              }))
            }
          />
        </View>

        <View className="weight-form-item">
          <Text className="label">体重</Text>
          <View className="weight-value-wrapper">
            <Picker
              mode="multiSelector"
              range={generateWeightColumns()}
              value={getWeightPickerValue()}
              onChange={handleWeightChange}
            >
              <View className="value">
                <Text>{formData.weight}公斤</Text>
                <ArrowRight />
              </View>
            </Picker>
          </View>
        </View>
      </View>
    </Popup>
  );
};

export default WeightInputPopup;
