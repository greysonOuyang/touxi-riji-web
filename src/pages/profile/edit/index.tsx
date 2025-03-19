import React, { useState, useEffect } from "react";
import { View, Text, Image, Input, Picker } from "@tarojs/components";
import { getUserProfile, updateUserProfile } from "@/api/profile";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";

// const DEFAULT_AVATAR = "../../assets/images/face.png"; // 删除 DEFAULT_AVATAR 常量

const EditProfile = () => {
  const [profile, setProfile] = useState({
    // avatarUrl: "", // 移除 avatarUrl 字段
    avatarBase64: "",
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
              // avatarUrl: response.data.avatarBase64 || "", // 不再设置 avatarUrl
              avatarBase64: response.data.avatarBase64 || "", // 使用 avatarBase64
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
        const filePath = tempFilePaths[0];
        Taro.getFileSystemManager().readFile({ // 使用 Taro.getFileSystemManager().readFile 读取文件
          filePath,
          encoding: 'base64', // 指定编码为 base64
          success: ({ data }) => {
            const base64Data = `data:image/png;base64,${data}`; //  拼接 Base64 数据格式
            setProfile((prev) => ({ ...prev, avatarBase64: base64Data })); //  只更新 avatarBase64
            handleUpdate("avatarBase64", base64Data); //  更新 avatarBase64 字段
          },
          fail: (error) => {
            console.error("Failed to read image as base64:", error);
            Taro.showToast({
              title: "图片读取失败",
              icon: "error",
              duration: 2000,
            });
          }
        });
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
        await updateUserProfile(userId, { [field]: value }); //  确保 updateUserProfile 接口可以接收 avatarBase64 字段
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
          <Image
            className="profile-avatar"
            src={profile.avatarBase64} //  直接使用 avatarBase64 作为 src
            style={{
              backgroundImage: profile.avatarBase64 ? `none` : `url(../../assets/images/face.png)`,
              backgroundColor: profile.avatarBase64 ? 'transparent' : '#eee',
            }}
          />
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
