import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import { InputNumber, Popup, Button } from '@nutui/nutui-react-taro';

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
  };

  return (
    <Popup visible={isVisible} position="bottom" onClose={onClose}>
      <View className="input-container">
        <View className="input-row">
          <View>浓度：</View>
          <InputNumber
            min={0}
            max={100}
            step={0.1}
            precision={1}
            value={concentration}
            onChange={(value) => setConcentration(Number(value))}
          />
          <View>%</View>
        </View>
        <View className="input-row">
          <View>灌入量：</View>
          <InputNumber
            min={0}
            value={infusionVolume}
            onChange={(value) => setInfusionVolume(Number(value))}
          />
          <View>ml</View>
        </View>
        <View className="input-row">
          <View>引流量：</View>
          <InputNumber
            min={0}
            value={drainageVolume}
            onChange={(value) => setDrainageVolume(Number(value))}
          />
          <View>ml</View>
        </View>
        <View className="result-row">
          <View>超滤量：</View>
          <View>{ultrafiltrationVolume} ml</View>
        </View>
        <Button type="primary" onClick={handleSave}>保存</Button>
      </View>
    </Popup>
  );
};

export default UltrafiltrationCard;