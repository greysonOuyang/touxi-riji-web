// pages/BloodPressureInputPage/index.tsx
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Form, Input, Text, Picker } from '@tarojs/components';
import { withAuth } from '@/utils/auth';
import { addBloodPressureRecord } from '@/api/bloodPressureApi';
import './index.scss';

interface BloodPressureData {
  systolic: string | number;
  diastolic: string | number;
  heartRate: string | number;
  measureDate: string;
  measureTime: string;
  note: string;
}

const BloodPressureInputPage: React.FC = () => {
  // 初始化表单数据
  const [formData, setFormData] = useState<BloodPressureData>(() => {
    const savedData = Taro.getStorageSync('tempBloodPressureData');
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    return savedData || {
      systolic: '',
      diastolic: '',
      heartRate: '',
      measureDate: defaultDate,
      measureTime: defaultTime,
      note: ''
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BloodPressureData, string>>>({});

  // 在组件卸载时保存表单数据
  useEffect(() => {
    return () => {
      if (formData.systolic || formData.diastolic) {
        Taro.setStorageSync('tempBloodPressureData', formData);
      }
    };
  }, [formData]);

  // 处理输入变化
  const handleInputChange = (field: keyof BloodPressureData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BloodPressureData, string>> = {};

    if (!formData.systolic) {
      newErrors.systolic = '请输入收缩压';
    } else if (Number(formData.systolic) < 60 || Number(formData.systolic) > 250) {
      newErrors.systolic = '收缩压数值异常';
    }

    if (!formData.diastolic) {
      newErrors.diastolic = '请输入舒张压';
    } else if (Number(formData.diastolic) < 40 || Number(formData.diastolic) > 150) {
      newErrors.diastolic = '舒张压数值异常';
    }

    if (formData.heartRate && (Number(formData.heartRate) < 40 || Number(formData.heartRate) > 200)) {
      newErrors.heartRate = '心率数值异常';
    }

    if (!formData.measureDate) {
      newErrors.measureDate = '请选择测量日期';
    }

    if (!formData.measureTime) {
      newErrors.measureTime = '请选择测量时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理日期选择
  const handleDateChange = (e: any) => {
    handleInputChange('measureDate', e.detail.value);
  };

  // 处理时间选择
  const handleTimeChange = (e: any) => {
    handleInputChange('measureTime', e.detail.value);
  };

  // 表单提交处理
  const handleSubmit = withAuth(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 合并日期和时间
      const measureDateTime = `${formData.measureDate} ${formData.measureTime}`;
      
      const submitData = {
        ...formData,
        systolic: Number(formData.systolic),
        diastolic: Number(formData.diastolic),
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        measureTime: measureDateTime,
        userId: Taro.getStorageSync('userId')
      };

      await addBloodPressureRecord(submitData);
      
      // 清除临时数据
      Taro.removeStorageSync('tempBloodPressureData');
      Taro.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      });

      // 提交成功后返回首页
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/health/index' // 跳转到首页
        });
      }, 2000);
    } catch (error) {
      console.error('提交失败:', error);
      Taro.showToast({
        title: '提交失败',
        icon: 'none',
        duration: 2000
      });
    }
  }, {
    saveState: () => formData
  });

  return (
    <View className='blood-pressure-input-page'>
      <Form onSubmit={handleSubmit}>
        <View className='input-group'>
          <Text className='label'>收缩压</Text>
          <Input
            type='number'
            className='input'
            value={formData.systolic as string}
            onInput={e => handleInputChange('systolic', e.detail.value)}
            placeholder='请输入收缩压'
          />
          <Text className='unit'>mmHg</Text>
        </View>
        {errors.systolic && <Text className='error-text'>{errors.systolic}</Text>}

        <View className='input-group'>
          <Text className='label'>舒张压</Text>
          <Input
            type='number'
            className='input'
            value={formData.diastolic as string}
            onInput={e => handleInputChange('diastolic', e.detail.value)}
            placeholder='请输入舒张压'
          />
          <Text className='unit'>mmHg</Text>
        </View>
        {errors.diastolic && <Text className='error-text'>{errors.diastolic}</Text>}

        <View className='input-group'>
          <Text className='label'>心率</Text>
          <Input
            type='number'
            className='input'
            value={formData.heartRate as string}
            onInput={e => handleInputChange('heartRate', e.detail.value)}
            placeholder='请输入心率（选填）'
          />
          <Text className='unit'>次/分</Text>
        </View>
        {errors.heartRate && <Text className='error-text'>{errors.heartRate}</Text>}

        <View className='input-group'>
          <Text className='label'>日期</Text>
          <View className='picker-wrapper'>
            <Picker
              mode='date'
              value={formData.measureDate}
              onChange={handleDateChange}
            >
              <View className='picker-content'>
                {formData.measureDate || '请选择测量日期'}
              </View>
            </Picker>
          </View>
        </View>
        {errors.measureDate && <Text className='error-text'>{errors.measureDate}</Text>}

        <View className='input-group'>
          <Text className='label'>时间</Text>
          <View className='picker-wrapper'>
            <Picker
              mode='time'
              value={formData.measureTime}
              onChange={handleTimeChange}
            >
              <View className='picker-content'>
                {formData.measureTime || '请选择测量时间'}
              </View>
            </Picker>
          </View>
        </View>
        {errors.measureTime && <Text className='error-text'>{errors.measureTime}</Text>}

        <View className='input-group'>
          <Text className='label'>备注</Text>
          <Input
            className='input'
            value={formData.note}
            onInput={e => handleInputChange('note', e.detail.value)}
            placeholder='请输入备注（选填）'
          />
        </View>

        <Button
          formType='submit'
          className='confirm-button'
        >
          确认
        </Button>
      </Form>
    </View>
  );
};

export default BloodPressureInputPage;
