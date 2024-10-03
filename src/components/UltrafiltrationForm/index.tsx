import React, { useState, useEffect } from 'react';
import { View } from '@tarojs/components';
import { Popup, Form, Input, Button } from '@nutui/nutui-react-taro';
import { UltrafiltrationData } from 'types';
// import './UltrafiltrationForm.scss';

interface UltrafiltrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UltrafiltrationData) => void;
  initialConcentration: string;
}

const UltrafiltrationForm: React.FC<UltrafiltrationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialConcentration
}) => {
  const [formData, setFormData] = useState({
    concentration: initialConcentration,
    infusionVolume: '',
    drainageVolume: ''
  });

  const [ultrafiltrationVolume, setUltrafiltrationVolume] = useState(0);

  useEffect(() => {
    const infusion = Number(formData.infusionVolume);
    const drainage = Number(formData.drainageVolume);
    if (!isNaN(infusion) && !isNaN(drainage)) {
      setUltrafiltrationVolume(drainage - infusion);
    }
  }, [formData.infusionVolume, formData.drainageVolume]);

  const handleSubmit = () => {
    const { concentration, infusionVolume, drainageVolume } = formData;
    onSubmit({
      concentration,
      infusionVolume: Number(infusionVolume),
      drainageVolume: Number(drainageVolume),
      ultrafiltrationVolume
    });
    onClose();
  };

  return (
    <Popup visible={isOpen} position="bottom" onClose={onClose} style={{ height: '50%' }}>
      <View className="ultrafiltration-form">
        <Form>
          <Form.Item label="浓度">
            <Input 
              placeholder="请输入浓度" 
              value={formData.concentration}
              onChange={(val) => setFormData(prev => ({ ...prev, concentration: val }))}
            />
          </Form.Item>
          <Form.Item label="灌入量">
            <Input 
              placeholder="请输入灌入量" 
              type="number"
              value={formData.infusionVolume}
              onChange={(val) => setFormData(prev => ({ ...prev, infusionVolume: val }))}
            />
          </Form.Item>
          <Form.Item label="引流量">
            <Input 
              placeholder="请输入引流量" 
              type="number"
              value={formData.drainageVolume}
              onChange={(val) => setFormData(prev => ({ ...prev, drainageVolume: val }))}
            />
          </Form.Item>
          <Form.Item label="超滤量">
            <View>{ultrafiltrationVolume} ml</View>
          </Form.Item>
          <Button block type="primary" onClick={handleSubmit}>
            确定
          </Button>
        </Form>
      </View>
    </Popup>
  );
};

export default UltrafiltrationForm;