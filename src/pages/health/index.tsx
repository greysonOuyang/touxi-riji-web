import React, { useState } from 'react';
import { View, Text } from "@tarojs/components";
import "./index.scss";
import UltrafiltrationView from "@/components/UltrafiltrationView";
import HealthCard from "@/components/HealthCard";
import { cardLayout } from "@/data/healthData";
import { UltrafiltrationData } from 'types';
import { updateUltrafiltrationData } from '@/api/ultrafiltration'; // 假设这是一个API调用函数

const HealthPage: React.FC = () => {
  const [ultrafiltrationData, setUltrafiltrationData] = useState({
    value: 800,
    target: 1000,
    concentration: '1.5%',
    specification: '2000ml',
    currentSession: 1,
    totalSessions: 4
  });

  const handleUltrafiltrationUpdate = async () => {
    try {
      await updateUltrafiltrationData(ultrafiltrationData)
      // 更新成功后的逻辑...
    } catch (error) {
      console.error('Failed to update ultrafiltration data:', error)
      // 错误处理逻辑...
    }
  }

  // const handleUltrafiltrationUpdate = async (data: UltrafiltrationData) => {
  //   try {
  //     // 调用API保存数据
  //     await updateUltrafiltrationData(data);

  //     // 更新本地状态
  //     setUltrafiltrationData(prevData => ({
  //       ...prevData,
  //       value: prevData.value + data.ultrafiltrationVolume,
  //       concentration: data.concentration,
  //       currentSession: prevData.currentSession + 1
  //     }));

  //     // 可以在这里添加成功提示
  //   } catch (error) {
  //     console.error('Failed to update ultrafiltration data:', error);
  //     // 可以在这里添加错误提示
  //   }
  // };

  return (
    <View className="page-container">
      <View className="main-content">
        <View className="health-page">
          <Text className="date-title">{new Date().toLocaleDateString()}</Text>

          <View className="cards-container">
          <UltrafiltrationView
          value={ultrafiltrationData.value}
          target={ultrafiltrationData.target}
          concentration={ultrafiltrationData.concentration}
          specification={ultrafiltrationData.specification}
          currentSession={ultrafiltrationData.currentSession}
          totalSessions={ultrafiltrationData.totalSessions}
          onUpdate={handleUltrafiltrationUpdate}
        />
          </View>

          <View className="health-grid">
            {cardLayout.map((data) => (
              <HealthCard key={data.id} data={data} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default HealthPage;
