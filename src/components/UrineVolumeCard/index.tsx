import React, { useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import AddButton from "../AddButton";
import UrineInputPopup from "../UrineInputPopup";
import "./index.scss";

interface UrineVolumeCardProps {
  data: {
    updateTime: string;
    value: number;
  };
}

const UrineVolumeCard: React.FC<UrineVolumeCardProps> = ({ data }) => {
  // 弹窗控制状态
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // 添加按钮点击事件，打开弹窗
  const onAddClick = () => {
    setIsPopupVisible(true);
  };

  // 弹窗关闭回调
  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };
  const handleAddSuccess = () => {};

  // 弹窗确认回调
  const handlePopupConfirm = (record: {
    volume: number;
    time: string;
    tag: string;
  }) => {
    console.log("尿量记录提交：", record);
    setIsPopupVisible(false);
    // TODO: 在这里调用接口提交数据或更新显示
  };

  return (
    <View className="urine-volume-card">
      {/* 卡片头部 */}
      <View className="small-card-header">
        <Text className="small-card-title">尿量</Text>
        <AddButton
          size={24}
          className="small-card-add-button"
          onClick={onAddClick}
        />
      </View>

      {/* 卡片内容 */}
      <View className="content">
        <View className="urine-value-container">
          <Text className="global-value">{data.value}</Text>
          <Text className="global-unit urine-unit">毫升</Text>
        </View>
      </View>

      {/* 卡片底部 */}
      <View className="footer">
        <Text className="update-time">{data.updateTime} 更新</Text>
        <Image
          src="../../assets/images/water_bottle.png"
          className="urine-icon"
        />
      </View>

      {/* 弹窗组件 */}
      <UrineInputPopup
        isOpened={isPopupVisible}
        onClose={handlePopupClose}
        onSuccess={handleAddSuccess}
      />
    </View>
  );
};

export default UrineVolumeCard;
