import React, { useEffect, useState } from "react";
import { Text, Image } from "@tarojs/components"; // Taro Text 和 Image 组件
import Taro from "@tarojs/taro"; // 导入 Taro，用于获取缓存
import { getUserProfile, UserProfileVO } from "../../api/profile"; // 导入 API 调用和 UserProfileVO 类型

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfileVO | null>(null); // 存储从API获取的用户信息
  const [stats, setStats] = useState({
    height: 0, // 身高
    weight: 0, // 体重
    age: 0, // 年龄
  });

  // 默认头像路径
  const defaultAvatar = "../../assets/images/heart-rate-chart.png";

  // 从缓存获取 userId
  const userId = Taro.getStorageSync("userId");

  useEffect(() => {
    // 确保 userId 存在
    if (!userId) {
      console.error("用户未登录，无法获取用户信息");
      return;
    }

    // 调用 API 获取用户信息
    getUserProfile(userId)
      .then((response) => {
        if (response.code === 200) {
          const profileData = response.data;
          setUserProfile(profileData);

          // 设置身高、体重、年龄等状态数据
          setStats({
            height: profileData.height || 0, // 默认值为 0
            weight: profileData.weight || 0, // 默认值为 0
            age: profileData.age || 0, // 默认值为 0
          });
        }
      })
      .catch((error) => {
        console.error("获取用户信息失败:", error);
      });
  }, [userId]);

  // 渲染组件
  return (
    <div className="profile">
      {userProfile && (
        <>
          {/* 头像，若没有则使用默认头像 */}
          <Image
            className="avatar"
            src={userProfile.avatarUrl || defaultAvatar}
          />

          {/* 用户名 */}
          <Text className="name">{userProfile.username || "未知用户"}</Text>

          {/* 如果姓名不为空，展示姓名标签 */}
          {userProfile.name && (
            <Text className="program">{userProfile.name}</Text>
          )}

          {/* 用户的状态信息，身高、体重和年龄 */}
          <div className="stats">
            <div className="stat">
              <Text className="stat-label">身高</Text>
              <Text className="stat-value">{stats.height || 0} cm</Text>
            </div>
            <div className="stat">
              <Text className="stat-label">体重</Text>
              <Text className="stat-value">{stats.weight || 0} kg</Text>
            </div>
            <div className="stat">
              <Text className="stat-label">年龄</Text>
              <Text className="stat-value">{stats.age || 0} 岁</Text>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
