import React, { useState } from 'react';
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import CustomPopup from '../CustomPopup';
import { addWeightRecord, NewWeightRecord } from '../../api/weightApi';
import './index.scss';

interface WeightInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAfterSubmit: () => void;
}

// 简化后的 FormState，只包含表单需要的字段
interface FormState {
  weight: string; // 前端输入时用string类型
  measurementDatetime: string;
  displayDateTime: string; // 用于显示的日期时间格式
}

const WeightInputPopup: React.FC<WeightInputPopupProps> = ({
  isOpen,
  onClose,
  onAfterSubmit,
}) => {
  const now = dayjs();
  const [formData, setFormData] = useState<FormState>({
    weight: '60.0',
    measurementDatetime: now.format('YYYY-MM-DD HH:mm:ss'),
    displayDateTime: now.format('YYYY年MM月DD日 HH:mm')
  });

  const generateDateTimeColumns = () => {
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
    const days = Array.from({ length: 31 }, (_, i) => `${i + 1}日`);
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    return [months, days, hours, minutes];
  };

  const generateWeightColumns = () => {
    const integers = Array.from({ length: 151 }, (_, i) => i.toString().padStart(2, '0'));
    const decimals = Array.from({ length: 10 }, (_, i) => i.toString());
    return [integers, ['.'], decimals, ['公斤']];
  };

  const handleDateTimeChange = (e) => {
    const [month, day, hour, minute] = e.detail.value;
    const dateTimeValue = now
      .month(month)
      .date(day + 1)
      .hour(Number(hour))
      .minute(Number(minute));
      
    setFormData(prev => ({
      ...prev,
      measurementDatetime: dateTimeValue.format('YYYY-MM-DD HH:mm:ss'),
      displayDateTime: dateTimeValue.format('YYYY年MM月DD日 HH:mm')
    }));
  };

  const handleWeightChange = (e) => {
    const [integer, , decimal] = e.detail.value;
    const weightValue = `${integer}.${decimal}`;
    setFormData(prev => ({ ...prev, weight: weightValue }));
  };

  const handleSubmit = async () => {
    const userId = Taro.getStorageSync('userId');
      
      const requestData: NewWeightRecord = {
        userId,
        weight: parseFloat(formData.weight),
        measurementDatetime: formData.measurementDatetime,
        scaleType: 'MANUAL'
      };
  
      const response = await addWeightRecord(requestData);
      
      if (response?.isSuccess()) {
        await Taro.showToast({
          title: '添加成功',
          icon: 'success',
          mask: true,
          duration: 1000
        });
        onAfterSubmit();
        onClose();
      } else {
        await Taro.showToast({
          title: response?.msg || '添加失败',
          icon: 'error',
          mask: true,
          duration: 2000
        });
      }
  };
  
  return (
    <CustomPopup
      isOpened={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title="记录体重"
    >
      <View className="weight-input-popup">
        <View className="form-item">
          <Text className="label">体重</Text>
          <View className="value-wrapper">
            <Picker
              mode="multiSelector"
              range={generateWeightColumns()}
              value={[60, 0, 0, 0]}
              onChange={handleWeightChange}
            >
              <View className="value">
                <Text>{formData.weight}公斤</Text>
                <Text className="arrow">›</Text>
              </View>
            </Picker>
          </View>
        </View>

        <View className="form-item">
          <Text className="label">测量时间</Text>
          <View className="value-wrapper">
            <Picker
              mode="multiSelector"
              range={generateDateTimeColumns()}
              value={[now.month(), now.date() - 1, now.hour(), now.minute()]}
              onChange={handleDateTimeChange}
            >
              <View className="value">
                <Text>{formData.displayDateTime}</Text>
                <Text className="arrow">›</Text>
              </View>
            </Picker>
          </View>
        </View>
      </View>
    </CustomPopup>
  );
};

export default WeightInputPopup;
