import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import { Button, Toast, Picker, Field } from '@antmjs/vantui';
import Taro from '@tarojs/taro';
import { addBloodPressureRecord } from '@/api';
import './index.scss';

const BloodPressureInputPage = () => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [measurementTime, setMeasurementTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // 时间选择器的选项
  const now = new Date();
  const dateOptions = [
    `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
  ];

  // 校验输入值
  const validateInputs = () => {
    if (!systolic || !diastolic || !heartRate || !measurementTime) {
      Toast.fail('请填写所有数据');
      return false;
    }
    if (parseInt(systolic, 10) <= 0 || parseInt(diastolic, 10) <= 0 || parseInt(heartRate, 10) <= 0) {
      Toast.fail('数值必须大于 0');
      return false;
    }
    return true;
  };

  // 确认按钮点击事件
  const handleConfirm = async () => {
    if (!validateInputs()) return;

    try {
      const user = Taro.getStorageSync('user');
      const newRecord = {
        systolic: parseFloat(systolic),
        diastolic: parseFloat(diastolic),
        heartRate: parseFloat(heartRate),
        userId: user.id,
        measurementTime,
      };

      const response = await addBloodPressureRecord(newRecord);
      if (response.isSuccess()) {
        Taro.showToast({ title: '记录添加成功', icon: 'success', duration: 2000 });
        Taro.navigateBack(); // 返回上一个页面
      } else {
        throw new Error(response.msg || '添加记录失败');
      }
    } catch (error) {
      Toast.fail(error.message || '网络错误，请稍后重试');
    }
  };

  // 取消按钮点击事件
  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className="blood-pressure-input-page">
      <Text className="title">选择日期和时间</Text>
      <Picker
        columns={dateOptions}
        onChange={(value) => {
          setMeasurementTime(value[0]); // 这里可以根据实际需求处理时间格式
          setShowPicker(false);
        }}
        show={showPicker}
        onCancel={() => setShowPicker(false)}
      >
        <Button onClick={() => setShowPicker(true)} className="picker-button">
          {measurementTime || '请选择日期和时间'}
        </Button>
      </Picker>

      <Field
        label="高压 (mmHg)"
        value={systolic}
        onChange={(e) => setSystolic(e.detail.value)}
        placeholder="请输入高压值"
        type="number"
      />
      <Field
        label="低压 (mmHg)"
        value={diastolic}
        onChange={(e) => setDiastolic(e.detail.value)}
        placeholder="请输入低压值"
        type="number"
      />
      <Field
        label="心率 (BPM)"
        value={heartRate}
        onChange={(e) => setHeartRate(e.detail.value)}
        placeholder="请输入心率值"
        type="number"
      />

      <View className="button-group">
        <Button onClick={handleCancel} className="cancel-button">取消</Button>
        <Button onClick={handleConfirm} className="confirm-button">确认</Button>
      </View>
    </View>
  );
};

export default BloodPressureInputPage;