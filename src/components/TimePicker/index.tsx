import React, { useState, useEffect } from 'react';
import { DatePicker, type PickerOption } from '@nutui/nutui-react-taro';
import { View, Text, Input, Image } from '@tarojs/components';
import clockIcon from '@/assets/icons/clock.png';
// import editIcon from '@/assets/icons/edit.png';
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

  const handleInputChange = (e: any) => {
    setChosenValue(e.detail.value);
  };

  const getDefaultValue = () => {
    const [hours, minutes] = (chosenValue || currentTime).split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes);
    return now;
  };

  return (
    <View className="time-picker">
      <View className="time-display" onClick={handleContainerClick}>
        <Image src={clockIcon} className="clock-icon" />
        <Text className="time-text">{chosenValue || currentTime}</Text>
        {/* <Image src={editIcon} className="clock-icon" /> */}
      </View>
      <DatePicker
        key={pickerKey}
        type="hour-minutes"
        defaultValue={getDefaultValue()}
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onConfirm={handlePickerConfirm}
      />
      {showPicker && (
        <View className="time-input-overlay">
          <Input
            type="text"
            value={chosenValue}
            onInput={handleInputChange}
            className="time-input"
            placeholder="Enter time (HH:MM)"
          />
        </View>
      )}
    </View>
  );
};

export default TimePicker;
