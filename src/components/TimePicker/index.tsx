import React, { useState, useEffect } from 'react';
import { DatePicker, type PickerOption } from '@nutui/nutui-react-taro';
import { View, Text, Image } from '@tarojs/components';
import clockIcon from '@/assets/icons/clock.png';
import './index.scss';

interface TimePickerProps {
  onTimeChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [chosenValue, setChosenValue] = useState<string>('');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerKey, setPickerKey] = useState<number>(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleContainerClick = () => {
    setPickerKey((prevKey) => prevKey + 1); // 每次打开时更新 key
    setShowPicker(true);
  };

  const handlePickerConfirm = (options: PickerOption[], values: (string | number)[]) => {
    const value = options.map((option) => option.text).join(':');
    setChosenValue(value);
    setShowPicker(false);
    onTimeChange(value);
  };

  const getDefaultValue = () => {
    const [hours, minutes] = (chosenValue || currentTime).split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes);
    return now;
  };

  return (
    <View className="time-picker" onClick={handleContainerClick}>
      <Image
        src={clockIcon}
        className="clock-icon"
      />
      <Text className="time-text">
        {chosenValue || currentTime}
      </Text>
      <DatePicker
        key={pickerKey}
        title="时间选择"
        type="hour-minutes"
        defaultValue={getDefaultValue()}
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handlePickerConfirm}
      />
    </View>
  );
};

export default TimePicker;
