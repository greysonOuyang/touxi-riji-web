import React, { useState, useEffect } from 'react';
import { View, ScrollView } from '@tarojs/components';
import { Popup, InputNumber, Button } from '@nutui/nutui-react-taro';
import Taro from '@tarojs/taro';
import './index.scss';

const UltrafiltrationCard = ({ isVisible, onClose, onSave, initialData }) => {
  const [concentration, setConcentration] = useState(initialData.concentration);
  const [infusionVolume, setInfusionVolume] = useState(initialData.infusionVolume);
  const [drainageVolume, setDrainageVolume] = useState(initialData.drainageVolume);
  const [ultrafiltrationVolume, setUltrafiltrationVolume] = useState(0);

  useEffect(() => {
    setUltrafiltrationVolume(drainageVolume - infusionVolume);
  }, [infusionVolume, drainageVolume]);

  useEffect(() => {
    setConcentration(initialData.concentration);
    setInfusionVolume(initialData.infusionVolume);
    setDrainageVolume(initialData.drainageVolume);
  }, [initialData]);

  const handleSave = () => {
    if (concentration < 0 || infusionVolume < 0 || drainageVolume < 0) {
      Taro.showToast({ title: '请输入有效的数值', icon: 'none' });
      return;
    }
    onSave({ concentration, infusionVolume, drainageVolume });
    onClose();
  };

  return (
    <Popup
      visible={isVisible}
      position="bottom"
      onClose={onClose}
      round
      overlayStyle={{ zIndex: 999 }}
      style={{ zIndex: 1000, height: '80%' }}
    >
      <ScrollView scrollY className="ultrafiltration-card">
        <View className="title">超滤量设置</View>
        <InputRow label="浓度：" value={concentration} setValue={setConcentration} unit="%" min={0} max={100} step={0.1} precision={1} />
        <InputRow label="灌入量：" value={infusionVolume} setValue={setInfusionVolume} unit="ml" min={0} />
        <InputRow label="引流量：" value={drainageVolume} setValue={setDrainageVolume} unit="ml" min={0} />
        <View className="result-row">
          <View className="label">超滤量：</View>
          <View className="value">{ultrafiltrationVolume} ml</View>
        </View>
        <View className="button-container">
          <Button type="primary" onClick={handleSave} className="custom-nutui-button">保存</Button>
        </View>
      </ScrollView>
    </Popup>
  );
};

const InputRow = ({ label, value, setValue, unit, ...props }) => {
  const handleChange = (setter) => (value) => {
    const numValue = Number(value);
    setter(isNaN(numValue) ? 0 : numValue);
  };

  return (
    <View className="input-row">
      <View className="label">{label}</View>
      <View className="input-with-unit">
        <InputNumber value={value} onChange={handleChange(setValue)} {...props} />
        <View className="unit">{unit}</View>
      </View>
    </View>
  );
};

export default UltrafiltrationCard;
