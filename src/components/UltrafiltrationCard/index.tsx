import React, { useState, useEffect } from 'react';
import { View, Slider } from '@tarojs/components';
import { Popup, InputNumber, Button, Progress } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import './index.scss';

interface UltrafiltrationData {
  concentration: number;
  infusionVolume: number;
  drainageVolume: number;
}

interface UltrafiltrationCardProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: UltrafiltrationData) => void;
  initialData: UltrafiltrationData;
}

interface InputRowProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  unit: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

const UltrafiltrationCard: React.FC<UltrafiltrationCardProps> = ({ isVisible, onClose, onSave, initialData }) => {
  const [concentration, setConcentration] = useState<number>(initialData.concentration);
  const [infusionVolume, setInfusionVolume] = useState<number>(initialData.infusionVolume);
  const [drainageVolume, setDrainageVolume] = useState<number>(initialData.drainageVolume);
  const [ultrafiltrationVolume, setUltrafiltrationVolume] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setUltrafiltrationVolume(drainageVolume - infusionVolume);
  }, [infusionVolume, drainageVolume]);

  useEffect(() => {
    setConcentration(initialData.concentration);
    setInfusionVolume(initialData.infusionVolume);
    setDrainageVolume(initialData.drainageVolume);
    setErrors({});
  }, [initialData]);

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (concentration < 0 || concentration > 100) newErrors.concentration = '浓度应在0-100%之间';
    if (infusionVolume < 0) newErrors.infusionVolume = '灌入量不能为负数';
    if (drainageVolume < 0) newErrors.drainageVolume = '引流量不能为负数';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateInputs()) {
      onSave({ concentration, infusionVolume, drainageVolume });
      onClose();
    } else {
      Taro.showToast({ title: '请修正输入错误', icon: 'none' });
    }
  };

  const progressPercentage = Math.min(Math.abs(ultrafiltrationVolume) / 1000 * 100, 100);

  return (
    <Popup 
      visible={isVisible} 
      position="bottom" 
      onClose={onClose} 
      round 
      overlayStyle={{ zIndex: 999 }} 
      style={{ 
        zIndex: 1000, 
        height: 'auto',  // 自动高度
        backgroundColor: '#f5f5f5', 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px', 
      }} 
    >
   <View className="ultrafiltration-card"> 
        <View className="card-header">
          <View className="title">超滤量设置</View>
        </View>
        <View className="card-content">
        <View className="input-row">
  <View className="input-label">浓度</View>
  <View className="input-container">
    <Slider 
      value={concentration} 
      min={0} 
      max={100} 
      step={0.1} 
      onChange={(value) => setConcentration(value)} 
    />
    <View className="unit-label">%</View>
  </View>
  {errors.concentration && (
    <View className="error-message">{errors.concentration}</View>
  )}
</View>
          <InputRow
            label="灌入量"
            value={infusionVolume}
            setValue={setInfusionVolume}
            unit="ml"
            min={0}
            error={errors.infusionVolume}
          />
          <InputRow
            label="引流量"
            value={drainageVolume}
            setValue={setDrainageVolume}
            unit="ml"
            min={0}
            error={errors.drainageVolume}
          />
          <View className="result-container">
            <View className="result-title">超滤量</View>
            <Progress 
              percent={progressPercentage}
              color={ultrafiltrationVolume >= 0 ? '#4CAF50' : '#F44336'}
            />
            <View className="result-value" style={{
              color: ultrafiltrationVolume >= 0 ? '#4CAF50' : '#F44336'
            }}>
              {ultrafiltrationVolume} ml
            </View>
          </View>
        </View>
        <View className="card-footer">
          <Button type="primary" onClick={handleSave} className="save-button">
            保存 
          </Button>
        </View>
      </View>
    </Popup>
  );
};

const InputRow: React.FC<InputRowProps> = ({ label, value, setValue, unit, error, ...props }) => {
  const handleChange = (value: number) => {
    // 控制浓度小数点后一位
    if (label === '浓度') {
      setValue(parseFloat(value.toFixed(1)));
    } else {
      setValue(Math.floor(value)); // 使用 Math.floor 确保其他输入为整数
    }
  };


  return (
    <View className="input-row">
      <View className="input-label">{label}</View>
      <View className="input-container">
        <View className="input-wrapper">
          <InputNumber 
            value={value} 
            onChange={handleChange} 
            {...props} 
          />
        </View>
        <View className="unit-label">
          {unit}
        </View>
      </View>
      {error && (
        <View className="error-message">{error}</View>
      )}
    </View>
  );
};

export default UltrafiltrationCard;