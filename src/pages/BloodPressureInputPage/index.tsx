
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Button, Form, Input, Text, Picker,Image } from '@tarojs/components';
import { addBloodPressureRecord } from '@/api/bloodPressureApi';
import { FORM_TYPES, saveTempFormData, getTempFormData, clearTempFormData } from '@/utils/tempFormStorage';
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
  // 初始化表单数据函数
  const initFormData = () => {
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    return {
      systolic: '',
      diastolic: '',
      heartRate: '',
      measureDate: defaultDate,
      measureTime: defaultTime,
      note: ''
    };
  };

  const [formData, setFormData] = useState<BloodPressureData>(initFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof BloodPressureData, string>>>({});

// 修改 useEffect
useEffect(() => {
  const tempData = getTempFormData(FORM_TYPES.BLOOD_PRESSURE);
  if (tempData) {
    setFormData(tempData);
    // 恢复后清除临时数据
    clearTempFormData(FORM_TYPES.BLOOD_PRESSURE);
  }
}, []);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    // 检查登录状态
    const token = Taro.getStorageSync('token');
    if (!token) {
      // 保存临时数据
      saveTempFormData(FORM_TYPES.BLOOD_PRESSURE, formData);
      // 保存当前页面路径，登录后需要返回到这个页面
      Taro.setStorageSync('redirectUrl', '/pages/BloodPressureInputPage/index');
      // 跳转到登录页
      Taro.navigateTo({
        url: '/pages/login/index'
      });
      return;
    }
  
    try {
      // 显示加载提示
      Taro.showLoading({
        title: '提交中...',
        mask: true
      });
  
      const measureDateTime = `${formData.measureDate} ${formData.measureTime}`;
      
      const submitData = {
        ...formData,
        systolic: Number(formData.systolic),
        diastolic: Number(formData.diastolic),
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        measureTime: measureDateTime,
        userId: Taro.getStorageSync('userId')
      };
  
      // 提交数据
      await addBloodPressureRecord(submitData);
  
      // 隐藏加载提示
      Taro.hideLoading();
  
      // 清除临时表单数据
      clearTempFormData(FORM_TYPES.BLOOD_PRESSURE);
  
      // 显示成功提示并跳转到首页
      await Taro.showToast({
        title: '添加成功',
        icon: 'success',
        mask: true,
        duration: 1000
      });
  
      // 确保 Toast 显示后跳转到首页
      setTimeout(() => {
        Taro.reLaunch({
          url: '/pages/health/index',
          fail: (error) => {
            console.error('跳转失败:', error);
            Taro.redirectTo({
              url: '/pages/health/index'
            });
          }
        });
      }, 1000);
  
    } catch (error) {
      // 隐藏加载提示
      Taro.hideLoading();
      
      console.error('提交失败:', error);
      Taro.showToast({
        title: '提交失败',
        icon: 'none',
        duration: 2000
      });
    }
  };
  

  return (
    <View className='blood-pressure-input-page'>
      <Form onSubmit={handleSubmit}>

      <View className='datetime-group'>
      <View className='datetime-item'>
        <View className='datetime-header'>
          <Image className='icon' src='../../assets/icons/calendar_icon.png' />
          <Text className='title'>测量日期</Text>
        </View>
        <View className='picker-wrapper'>
          <Picker
            mode='date'
            value={formData.measureDate}
            onChange={handleDateChange}
          >
            <View className='picker-content'>
              {formData.measureDate || '请选择日期'}
            </View>
          </Picker>
        </View>
      </View>

      <View className='datetime-item'>
        <View className='datetime-header'>
          <Image className='icon' src='../../assets/icons/clock.png' />
          <Text className='title'>测量时间</Text>
        </View>
        <View className='picker-wrapper'>
          <Picker
            mode='time'
            value={formData.measureTime}
            onChange={handleTimeChange}
          >
            <View className='picker-content'>
              {formData.measureTime || '请选择时间'}
            </View>
          </Picker>
        </View>
      </View>
    </View>
    {errors.measureDate && <Text className='error-text datetime-error'>{errors.measureDate}</Text>}
    {errors.measureTime && <Text className='error-text datetime-error'>{errors.measureTime}</Text>}

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
          <Text className='label'>备注</Text>
          <Input
            className='input'
            value={formData.note}
            onInput={e => handleInputChange('note', e.detail.value)}
            placeholder='请输入备注（选填）'
          />
        </View>

        <View
          className='confirm-button'
        >
          确认
        </View>
      </Form>
    </View>
  );
};

export default BloodPressureInputPage;
