import React, { useEffect, useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import { getUserProfile } from "../../api/profile";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";
import ArrowRight from "@/components/common/ArrowRight";

const DEFAULT_AVATAR = "../../assets/images/face.png";
const ICON_PROFILE = "../../assets/icons/icon-profile.png";

const calculatePdDays = (startDate: string | null): number => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    avatarUrl: DEFAULT_AVATAR,
    name: "",
    height: 0,
    weight: 0,
    age: 0,
    gender: "",
    pdDays: 0,
  });

  const fetchProfileData = async () => {
    const userId = Taro.getStorageSync("userId");
    if (userId) {
      try {
        const response = await getUserProfile(userId);
        if (response.data) {
          const apiData = response.data;
          setProfile({
            username: apiData.userName || "",
            avatarUrl: apiData.avatarUrl || DEFAULT_AVATAR,
            name: apiData.name || "",
            height: apiData.height || 0,
            weight: apiData.weight || 0,
            age: apiData.age || 0,
            gender: apiData.gender || "",
            pdDays: calculatePdDays(apiData.dialysisStartDate),
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        Taro.showToast({
          title: "获取个人信息失败",
          icon: "none",
          duration: 2000,
        });
      }
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useDidShow(() => {
    Taro.setNavigationBarTitle({
      title: "个人设置",
    });
    fetchProfileData();
  });

  const handleEditProfile = () => {
    Taro.navigateTo({ url: "/pages/profile/edit/index" });
  };

  const handlePdPlanClick = () => {
    Taro.navigateTo({ url: "/pages/pdPlan/planManage/index" });
  };

  return (
    <View className="profile-container">
      {/* 个人信息 */}
      <View className="profile-header" onClick={handleEditProfile}>
        <Image className="profile-avatar" src={profile.avatarUrl} />
        <View className="profile-info">
          <Text className="profile-name">{profile.username}</Text>
          <Text className="profile-details">
            {profile.gender}
            {profile.gender && profile.age ? " · " : ""}
            {profile.age ? `${profile.age} 岁` : ""}
          </Text>
        </View>
        <View className="profile-link">
          <Text className="link-text">个人主页</Text>
          <ArrowRight />
        </View>
      </View>

      {/* 数据卡片 */}
      <View className="profile-stats" onClick={handleEditProfile}>
        <View className="profile-stat-card">
          <Text className="stat-value-unit">{profile.height || 0} cm</Text>
          <Text className="stat-label">身高</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value-unit">{profile.weight || 0} kg</Text>
          <Text className="stat-label">体重</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value-unit">{profile.pdDays || 0} 天</Text>
          <Text className="stat-label">腹透</Text>
        </View>
      </View>

      {/* 个人设置 */}
      <View className="profile-settings">
        <Text className="settings-title">个人设置</Text>
        <View className="settings-item" onClick={handlePdPlanClick}>
          <View className="item-label">
            {/* <Image className="item-icon" src={ICON_PROFILE} /> */}
            <Text>腹透方案</Text>
          </View>
          <ArrowRight />
        </View>
      </View>
    </View>
  );
};

export default Profile;
