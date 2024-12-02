import React, { useEffect, useState } from "react";
import { View, Text, Image } from "@tarojs/components";
import { getUserProfile } from "../../api/profile";
import Taro from "@tarojs/taro";
import "./index.scss";
import ArrowRight from "@/components/ArrowRight";

const DEFAULT_AVATAR = "../../assets/images/face.png";
const ICON_PROFILE = "../../assets/images/icon-profile.png";

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

  useEffect(() => {
    const userId = Taro.getStorageSync("userId");
    if (userId) {
      getUserProfile(userId).then((response) => {
        if (response.data) {
          setProfile({
            ...response.data,
            avatarUrl: response.data.avatarUrl || DEFAULT_AVATAR,
          });
        }
      });
    }
  }, []);

  const handleEditProfile = () => {
    Taro.navigateTo({ url: "/pages/editProfile/index" });
  };

  const handlePdPlanClick = () => {
    Taro.navigateTo({ url: "/pages/pdPlan/index" });
  };

  return (
    <View className="profile-container">
      {/* 个人信息 */}
      <View className="profile-header" onClick={handleEditProfile}>
        <Image className="profile-avatar" src={profile.avatarUrl} />
        <View className="profile-info">
          <Text className="profile-name">{profile.username}</Text>
          <Text className="profile-details">
            {profile.gender} · {profile.age}岁
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
          <Text className="stat-value">{profile.height || 0}cm</Text>
          <Text className="stat-label">身高</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value">{profile.weight || 0}kg</Text>
          <Text className="stat-label">体重</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value">{profile.pdDays || 0}天</Text>
          <Text className="stat-label">腹透</Text>
        </View>
      </View>

      {/* 个人设置 */}
      <View className="profile-settings">
        <Text className="settings-title">个人设置</Text>
        <View className="settings-item" onClick={handlePdPlanClick}>
          <View className="item-label">
            <Image className="item-icon" src={ICON_PROFILE} />
            <Text>腹透方案</Text>
          </View>
          <ArrowRight />
        </View>
      </View>

      <View className="profile-settings">
        <Text className="settings-title">其他</Text>
        <View className="settings-item" onClick={handlePdPlanClick}>
          <View className="item-label">
            <Image className="item-icon" src={ICON_PROFILE} />
            <Text>意见反馈</Text>
          </View>
          <ArrowRight />
        </View>
      </View>
    </View>
  );
};

export default Profile;
