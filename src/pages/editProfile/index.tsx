import React, { useState, useEffect } from "react";
import { View, Text, Image, Input, Picker } from "@tarojs/components";
import { getUserProfile, updateUserProfile } from "../../api/profile";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";

const DEFAULT_AVATAR = "../../assets/images/face.png";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    avatarUrl: DEFAULT_AVATAR,
    userName: "",
    name: "",
    gender: "",
    height: "",
    weight: "",
    birthDate: "",
    pdStartDate: "",
  });

  useDidShow(() => {
    Taro.setNavigationBarTitle({
      title: "个人资料",
    });
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = Taro.getStorageSync("userId");
      if (userId) {
        try {
          const response = await getUserProfile(userId);
          if (response.data) {
            setProfile({
              avatarUrl: response.data.avatarUrl || DEFAULT_AVATAR,
              userName: response.data.userName || "",
              name: response.data.name || "",
              gender: response.data.gender || "",
              height: response.data.height
                ? response.data.height.toString()
                : "",
              weight: response.data.weight
                ? response.data.weight.toString()
                : "",
              birthDate: response.data.birthDate || "",
              pdStartDate: response.data.dialysisStartDate || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          Taro.showToast({
            title: "获取用户信息失败",
            icon: "error",
            duration: 2000,
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        setProfile((prev) => ({ ...prev, avatarUrl: tempFilePaths[0] }));
        // Here you would typically upload the image to your server
        // and update the user's profile with the new avatar URL
      },
    });
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, e) => {
    const newValue = e.detail.value;
    setProfile((prev) => ({ ...prev, [field]: newValue }));
    handleUpdate(field, newValue);
  };

  const handleGenderChange = (e) => {
    const genderOptions = ["男", "女", "未知"];
    const newValue = genderOptions[e.detail.value];
    setProfile((prev) => ({ ...prev, gender: newValue }));
    handleUpdate("gender", newValue);
  };

  const handleUpdate = async (field, value) => {
    const userId = Taro.getStorageSync("userId");
    if (userId) {
      try {
        await updateUserProfile(userId, { [field]: value });
        Taro.showToast({ title: "更新成功", icon: "success", duration: 1500 });
      } catch (error) {
        console.error("Failed to update profile:", error);
        Taro.showToast({ title: "更新失败", icon: "error", duration: 1500 });
      }
    }
  };

  const handleBlur = (field) => {
    handleUpdate(field, profile[field]);
  };

  return (
    <View className="edit-profile-container">
      <View className="edit-profile-content">
        <View className="avatar-section" onClick={handleAvatarChange}>
          <Image className="profile-avatar" src={profile.avatarUrl} />
          <View className="avatar-edit-overlay">
            <Text className="edit-text">编辑</Text>
          </View>
        </View>

        <View className="profile-field">
          <Text className="field-label">昵称</Text>
          <Input
            className="field-input"
            value={profile.userName}
            onInput={(e) => handleInputChange("userName", e.detail.value)}
            onBlur={() => handleBlur("userName")}
          />
        </View>

        <View className="profile-field">
          <Text className="field-label">姓名</Text>
          <Input
            className="field-input"
            value={profile.name}
            onInput={(e) => handleInputChange("name", e.detail.value)}
            onBlur={() => handleBlur("name")}
          />
        </View>

        <View className="profile-field">
          <Text className="field-label">性别</Text>
          <Picker
            mode="selector"
            range={["男", "女", "未知"]}
            onChange={handleGenderChange}
            value={["男", "女", "未知"].indexOf(profile.gender)}
          >
            <View className="picker-value">
              {profile.gender || "请选择性别"}
            </View>
          </Picker>
        </View>

        <View className="profile-field">
          <Text className="field-label">身高 (cm)</Text>
          <Input
            className="field-input"
            type="digit"
            value={profile.height}
            onInput={(e) => handleInputChange("height", e.detail.value)}
            onBlur={() => handleBlur("height")}
          />
        </View>

        <View className="profile-field">
          <Text className="field-label">体重 (kg)</Text>
          <Input
            className="field-input"
            type="digit"
            value={profile.weight}
            onInput={(e) => handleInputChange("weight", e.detail.value)}
            onBlur={() => handleBlur("weight")}
          />
        </View>

        <View className="profile-field">
          <Text className="field-label">出生日期</Text>
          <Picker
            mode="date"
            value={profile.birthDate}
            onChange={(e) => handleDateChange("birthDate", e)}
          >
            <View className="picker-value">
              {profile.birthDate || "请选择日期"}
            </View>
          </Picker>
        </View>

        <View className="profile-field">
          <Text className="field-label">腹透开始日期</Text>
          <Picker
            mode="date"
            value={profile.pdStartDate}
            onChange={(e) => handleDateChange("pdStartDate", e)}
          >
            <View className="picker-value">
              {profile.pdStartDate || "请选择日期"}
            </View>
          </Picker>
        </View>
      </View>
    </View>
  );
};

export default EditProfile;
