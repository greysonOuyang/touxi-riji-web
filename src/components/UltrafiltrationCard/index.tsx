import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import { Popup, InputNumber, Button } from '@nutui/nutui-react-taro';
import './index.scss';

interface UltrafiltrationCardProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: UltrafiltrationData) => void;
  initialData: UltrafiltrationData;
}

interface UltrafiltrationData {
  concentration: number;
  infusionVolume: number;
  drainageVolume: number;
}

const UltrafiltrationCard: React.FC<UltrafiltrationCardProps> = ({
  isVisible,
  onClose,
  onSave,
  initialData
}) => {
  const [concentration, setConcentration] = useState<number>(initialData.concentration);
  const [infusionVolume, setInfusionVolume] = useState<number>(initialData.infusionVolume);
  const [drainageVolume, setDrainageVolume] = useState<number>(initialData.drainageVolume);
  const [ultrafiltrationVolume, setUltrafiltrationVolume] = useState<number>(0);

  useEffect(() => {
    setUltrafiltrationVolume(drainageVolume - infusionVolume);
  }, [infusionVolume, drainageVolume]);

  const handleSave = () => {
    onSave({
      concentration,
      infusionVolume,
      drainageVolume
    });
    onClose();
  };

  return (
    <Popup 
  visible={isVisible} 
  position="bottom" 
  onClose={onClose} 
  round
  overlayStyle={{ zIndex: 999 }}
  style={{ zIndex: 1000 }}
>
      <View className="ultrafiltration-card">
        <View className="title">超滤量设置</View>
        <View className="input-row">
          <View className="label">浓度：</View>
          <InputNumber
            min={0}
            max={100}
            step={0.1}
            precision={1}
            value={concentration}
            onChange={(value) => setConcentration(Number(value))}
          />
          <View className="unit">%</View>
        </View>
        <View className="input-row">
          <View className="label">灌入量：</View>
          <InputNumber
            min={0}
            value={infusionVolume}
            onChange={(value) => setInfusionVolume(Number(value))}
          />
          <View className="unit">ml</View>
        </View>
        <View className="input-row">
          <View className="label">引流量：</View>
          <InputNumber
            min={0}
            value={drainageVolume}
            onChange={(value) => setDrainageVolume(Number(value))}
          />
          <View className="unit">ml</View>
        </View>
        <View className="result-row">
          <View className="label">超滤量：</View>
          <View className="value">{ultrafiltrationVolume} ml</View>
        </View>
        <View className="button-container">
          <Button block type="primary" onClick={handleSave}>
            保存
          </Button>
        </View>
      </View>
    </Popup>
  );
};

export default UltrafiltrationCard;