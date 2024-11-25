import React, { useEffect, useState } from "react";
import { View, Text, Image, Button } from "@tarojs/components";
import { getUserProfile } from "../../api/profile";
import { getCurrentPdPlan } from "../../api/pdPlanApi"; // 导入获取腹透方案的API
import Taro from "@tarojs/taro";
import "./index.scss";

const DEFAULT_AVATAR = "../../assets/images/face.png";
const ICON_PROFILE = "../../assets/icons/icon-profile.png";
const RIGHT_ARROW = "../../assets/icons/right_arrow.png";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    avatarUrl: DEFAULT_AVATAR,
    name: "",
    height: 0,
    weight: 0,
    age: 0,
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

  const handlePdPlanClick = async () => {
    const userId = Taro.getStorageSync("userId");
    if (userId) {
      try {
        const response = await getCurrentPdPlan(userId);
        if (response.code === 200) {
          if (response.data === null) {
            // 没有腹透方案，提示用户
            Taro.showModal({
              title: "提示",
              content: "暂无腹透方案，是否前往添加？",
              success: (res) => {
                if (res.confirm) {
                  // 用户点击确定，跳转到添加方案页面
                  Taro.navigateTo({ url: "/pages/pdPlan/create/index" });
                }
              },
            });
          } else {
            // 已存在腹透方案，跳转到方案列表页面
            Taro.navigateTo({ url: "/pages/pdPlan/index" });
          }
        } else {
          console.error(response.message);
        }
      } catch (error) {
        console.error("获取腹透方案失败", error);
        Taro.showToast({ title: "获取方案失败，请重试", icon: "none" });
      }
    }
  };

  return (
    <View className="profile-container">
      {/* 个人信息 */}
      <View className="profile-header">
        <Image className="profile-avatar" src={profile.avatarUrl} />
        <View className="profile-info">
          <Text className="profile-username">{profile.username}</Text>
          {profile.name && <Text className="profile-name">{profile.name}</Text>}
        </View>
        <Button className="edit-button">编辑</Button>
      </View>

      {/* 数据卡片 */}
      <View className="profile-stats">
        <View className="profile-stat-card">
          <Text className="stat-value">{profile.height || 0}cm</Text>
          <Text className="stat-label">身高</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value">{profile.weight || 0}kg</Text>
          <Text className="stat-label">体重</Text>
        </View>
        <View className="profile-stat-card">
          <Text className="stat-value">{profile.age || 0}岁</Text>
          <Text className="stat-label">年龄</Text>
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
          <Image className="arrow" src={RIGHT_ARROW} />
        </View>
      </View>

      <View className="profile-settings">
        <Text className="settings-title">其他</Text>
        <View className="settings-item" onClick={handlePdPlanClick}>
          <View className="item-label">
            <Image className="item-icon" src={ICON_PROFILE} />
            <Text>意见反馈</Text>
          </View>
          <Image className="arrow" src={RIGHT_ARROW} />
        </View>
      </View>
    </View>
  );
};

export default Profile;
