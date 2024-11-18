import React from "react";
import { View, Text, Image } from "@tarojs/components";
import AddButton from "../AddButton";
import "./index.scss";

interface UrineVolumeCardProps {
  data: {
    updateTime: string;
    value: number;
  };
}

const UrineVolumeCard: React.FC<UrineVolumeCardProps> = ({ data }) => {
  const onAddClick = () => {
    console.log("onAddClick");
  };

  // UrineVolumeCard.jsx
  return (
    <View className="urine-volume-card">
      <View className="small-card-header">
        <Text className="small-card-title">尿量</Text>
        <AddButton
          size={24}
          className="small-card-add-button"
          onClick={onAddClick}
        />
      </View>
      <View className="content">
        <View className="urine-value-container">
          <Text className="global-value">{data.value}</Text>
          <Text className="global-unit urine-unit">毫升</Text>
        </View>
      </View>
      <View className="footer">
        <Text className="update-time">{data.updateTime} 更新</Text>
        <Image
          src="../../assets/images/water_bottle.png"
          className="urine-icon"
        />
      </View>
    </View>
  );
};

export default UrineVolumeCard;
