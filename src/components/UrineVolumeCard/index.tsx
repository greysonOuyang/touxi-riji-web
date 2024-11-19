import React, { useState, useEffect } from "react";
import { View, Text, Image } from "@tarojs/components";
import AddButton from "../AddButton";
import UrineInputPopup from "../UrineInputPopup";
import { getRecentUrineStats } from "../../api/urineApi";
import { ApiResponse } from "../../utils/request";
import Taro from "@tarojs/taro";
import "./index.scss";

const UrineVolumeCard: React.FC = () => {
  const userId = Taro.getStorageSync("userId"); // Get userId from Taro storage
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [data, setData] = useState({
    value: 0,
    updateTime: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch the latest urine data
  const fetchLatestUrineData = async () => {
    try {
      const response = await getRecentUrineStats(userId);
      if (response.isSuccess()) {
        setData({
          value: response.data.totalVolume,
          updateTime: response.data.latestUpdateTime,
        });
      }
    } catch (error) {
      console.error("Error fetching urine data", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the latest data when the component mounts
  useEffect(() => {
    if (userId) {
      fetchLatestUrineData();
    } else {
      Taro.showToast({
        title: "用户未登录",
        icon: "none",
      });
    }
  }, [userId]);

  // Handle button click to show the input popup
  const onAddClick = () => {
    setIsPopupVisible(true);
  };

  // Close popup callback
  const handlePopupClose = () => {
    setIsPopupVisible(false);
  };

  // Success callback for when a new urine record is added
  const handleAddSuccess = () => {
    // Re-fetch latest urine data after a successful record addition
    fetchLatestUrineData();
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
        {loading ? (
          <Text>加载中...</Text>
        ) : (
          <View className="urine-value-container">
            <Text className="global-value">{data.value}</Text>
            <Text className="global-unit urine-unit">毫升</Text>
          </View>
        )}
      </View>

      {/* 卡片底部 */}
      <View className="footer">
        <Text className="update-time">{data.updateTime}</Text>
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
