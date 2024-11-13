import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Input } from '@tarojs/components';
import AddButton from '../AddButton';
import CustomPopup from '../CustomPopup';
import { fetchLatestBloodPressure, addBloodPressureRecord } from '@/api';
import './index.scss';

const BloodPressureCard = ({ data }) => {
  const [bpData, setBpData] = useState(data || { systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [inputValues, setInputValues] = useState({ systolic: '', diastolic: '', heartRate: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchLatestBloodPressure();
        if (response.isSuccess() && response.data) {
          setBpData(response.data); // 直接使用后端返回的数据
        } else {
          setBpData({ systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });
        }
      } catch (error) {
        console.error('获取血压数据时出错:', error);
        setBpData({ systolic: 0, diastolic: 0, heartRate: 0, formattedMeasurementTime: '暂无数据' });
      }
    };

    fetchData();
  }, []);

  const onAddClick = () => {
    setIsPopupVisible(true);
  };

  const handleConfirm = () => {
    const { systolic, diastolic, heartRate } = inputValues;

    const newRecord = {
      systolic: parseFloat(systolic),
      diastolic: parseFloat(diastolic),
      heartRate: parseFloat(heartRate),
      userId: Taro.getStorageSync('user').id,
      measurementTime: new Date().toISOString(),
    };

    addBloodPressureRecord(newRecord)
      .then(response => {
        if (response.isSuccess()) {
          fetchLatestBloodPressure()
            .then(fetchResponse => {
              if (fetchResponse.isSuccess()) {
                setBpData(fetchResponse.data); // 直接使用后端返回的数据
              } else {
                console.error('获取最新血压数据失败:', fetchResponse.msg);
              }
            });
        }
      })
      .catch(error => console.error('Failed to add blood pressure record:', error))
      .finally(() => {
        setIsPopupVisible(false);
        setInputValues({ systolic: '', diastolic: '', heartRate: '' });
      });
  };

  const handleInputChange = (field, value) => {
    setInputValues(prevValues => ({ ...prevValues, [field]: value }));
  };

  return (
    <View className="blood-pressure-card">
      {/* 头部：标题和添加按钮 */}
      <View className="small-card-header">
        <Text className="small-card-title">血压</Text>
        <AddButton size={24} className="small-card-add-button" onClick={onAddClick} />
      </View>

      {/* 内容部分 */}
      <View className="content">
  <View className="value-container">
    <View className="values">
      <Text className={`systolic-value ${bpData.systolic > 130 ? 'high-red' : bpData.systolic < 90 ? 'high-green' : ''}`}>
        {bpData.systolic !== null ? bpData.systolic : 0}
      </Text>
      <Text className="separator">/</Text>
      <Text className={`diastolic-value ${bpData.diastolic > 80 ? 'low-red' : bpData.diastolic < 60 ? 'low-green' : ''}`}>
        {bpData.diastolic !== null ? bpData.diastolic : 0}
      </Text>
      <Text className="blood-unit">mmHg</Text> {/* 单位在同一行 */}
    </View>
    <View className="heart-rate-container">
      <Text className={`heart-rate-value ${bpData.heartRate > 100 ? 'high-red' : bpData.heartRate < 60 ? 'low-green' : ''}`}>
        {bpData.heartRate !== null ? bpData.heartRate : 0}
      </Text>
      <Text className="heart-rate-unit">BPM</Text> {/* 心率单位 */}
    </View>
  </View>
</View>


      {/* 更新时间 */}
      <Text className="update-time">{bpData.formattedMeasurementTime || '暂无数据'}</Text>

      {/* 心脏图标 */}
      <Image src="../../assets/images/heart_icon.png" className="heart-icon" />

      {/* 弹窗组件 */}
      <CustomPopup
        visible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
        onConfirm={handleConfirm}
        height="50%"
      >
        <View className="popup-content">
          <View className="input-group">
            <Text>高压</Text>
            <Input
              type="number"
              value={inputValues.systolic}
              onInput={e => handleInputChange('systolic', e.detail.value)}
              placeholder="请输入高压"
              className="popup-input"
            />
          </View>
          <View className="input-group">
            <Text>低压</Text>
            <Input
              type="number"
              value={inputValues.diastolic}
              onInput={e => handleInputChange('diastolic', e.detail.value)}
              placeholder="请输入低压"
              className="popup-input"
            />
          </View>
          <View className="input-group">
            <Text>脉率</Text>
            <Input
              type="number"
              value={inputValues.heartRate}
              onInput={e => handleInputChange('heartRate', e.detail.value)}
              placeholder="请输入脉率"
              className="popup-input"
            />
          </View>
        </View>
      </CustomPopup>
    </View>
  );
};

export default BloodPressureCard;