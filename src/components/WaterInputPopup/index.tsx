import React, { useState, useEffect } from "react";
import { View, Picker, Image, Text } from "@tarojs/components";
import CustomPopup from "../CustomPopup";
import NumericInput from "../NumericInputProps";
import { addWaterIntakeRecord } from "../../api/waterIntakeApi";
import { fetchWaterTags, saveWaterTags } from "../../api/userSettings";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import "./index.scss";

interface WaterInputPopupProps {
  isOpened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValue?: number;
}

const DEFAULT_VOLUME_TAGS = [100, 200, 300, 500];

const WaterInputPopup: React.FC<WaterInputPopupProps> = ({
  isOpened,
  onClose,
  onSuccess,
  initialValue = 0,
}) => {
  const [value, setValue] = useState<string>(initialValue.toString());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [userTags, setUserTags] = useState<string[]>([]);
  const [newTagValue, setNewTagValue] = useState<string>("0");
  const [isEditingNewTag, setIsEditingNewTag] = useState<boolean>(false);

  useEffect(() => {
    const currentTime = dayjs().format("HH:mm");
    setValue(initialValue.toString());
    setSelectedTime(currentTime);
    loadUserTags();
  }, [isOpened, initialValue]);

  const loadUserTags = async () => {
    const userId = Taro.getStorageSync("userId");
    try {
      const response = await fetchWaterTags(userId);
      if (response?.isSuccess) {
        const tags = response.data || [];
        setUserTags(tags);
        if (tags.length === 0) {
          await saveWaterTags(userId, DEFAULT_VOLUME_TAGS.map(String));
        }
      }
    } catch (error) {
      console.error("加载标签失败", error);
    }
  };

  const getDisplayTags = () => {
    return userTags.length > 0 ? userTags : DEFAULT_VOLUME_TAGS.map(String);
  };

  const handleVolumeTagClick = (volume: string) => {
    setValue(volume);
  };

  const handleLongPressTag = (tag: string) => {
    Taro.showModal({
      title: "删除标签",
      content: `确认删除${tag}ml标签？`,
      success: async (res) => {
        if (res.confirm) {
          const newTags = userTags.filter((t) => t !== tag);
          setUserTags(newTags);
          const userId = Taro.getStorageSync("userId");
          await saveWaterTags(userId, newTags.join(",")); // Save updated tags
          Taro.showToast({ title: "删除成功", icon: "success" });
        }
      },
    });
  };

  const handleAddCustomTag = () => {
    setNewTagValue("0");
    setIsEditingNewTag(true);
  };

  const handleTagInputChange = (e) => {
    // Automatically trim leading zeros
    const inputValue = e.target.value.replace(/^0+/, "");
    setNewTagValue(inputValue);
  };

  const handleTagInputConfirm = async () => {
    const numericTag = parseInt(newTagValue, 10);
    if (!numericTag || isNaN(numericTag)) {
      Taro.showToast({
        title: "请输入有效的整数",
        icon: "none",
      });
      return;
    }

    if (userTags.includes(numericTag.toString())) {
      Taro.showToast({ title: "标签已存在", icon: "none" });
      return;
    }

    // Add the new tag without sorting
    const updatedTags = [...userTags, numericTag.toString()];
    setUserTags(updatedTags);

    const userId = Taro.getStorageSync("userId");
    try {
      await saveWaterTags(userId, updatedTags.join(","));
      setIsEditingNewTag(false);
      Taro.showToast({ title: "添加成功", icon: "success" });
    } catch (error) {
      Taro.showToast({ title: "添加失败", icon: "error" });
    }
  };

  const handleCancelNewTag = () => {
    setIsEditingNewTag(false);
    setNewTagValue("0"); // Reset to default
  };

  const handleConfirm = async () => {
    const numericValue = parseInt(value, 10) || 0;
    if (numericValue <= 0) {
      Taro.showToast({
        title: "喝水量必须大于0",
        icon: "none",
      });
      return;
    }

    setLoading(true);
    try {
      const currentDate = dayjs().format("YYYY-MM-DD");
      const intakeTime = `${currentDate} ${selectedTime}:00`;
      const userId = Taro.getStorageSync("userId");

      // Include default tags in the request
      const allTags = [...DEFAULT_VOLUME_TAGS.map(String), ...userTags];

      const requestData = {
        userId,
        amount: numericValue,
        intakeTime,
        tags: allTags.join(","), // Send all tags as a comma-separated string
      };

      await addWaterIntakeRecord(requestData);

      Taro.showToast({
        title: "添加成功",
        icon: "success",
      });
      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("添加喝水记录失败", error);
      Taro.showToast({
        title: "添加失败",
        icon: "error",
      });
      setLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.detail.value);
  };

  return (
    <CustomPopup
      isOpened={isOpened}
      onClose={() => {
        handleCancelNewTag(); // Reset on close
        onClose();
      }}
      onConfirm={handleConfirm}
      title="添加喝水记录"
      confirmText={loading ? "提交中..." : "确认"}
      cancelText="取消"
    >
      <View className="water-input-popup">
        <View className="time-container">
          <Text>时间</Text>
          <Picker mode="time" value={selectedTime} onChange={handleTimeChange}>
            <View className="picker">
              <Image className="clock-icon" src="/assets/icons/clock.png" />
              <Text>{selectedTime}</Text>
            </View>
          </Picker>
        </View>

        <View className="tags-container">
          {getDisplayTags().map((volume) => (
            <View
              key={volume}
              className="volume-tag"
              onClick={() => handleVolumeTagClick(volume)}
              onLongPress={() => handleLongPressTag(volume)}
            >
              {volume}ml
            </View>
          ))}

          {isEditingNewTag && (
            <View className="editing-tag-container">
              <View className="editing-tag">
                <input
                  type="number"
                  className="tag-input"
                  value={newTagValue}
                  onChange={handleTagInputChange}
                  onBlur={handleTagInputConfirm}
                  placeholder="输入数值"
                />
                <View className="tag-input-cancel" onClick={handleCancelNewTag}>
                  取消
                </View>
              </View>
            </View>
          )}

          {!isEditingNewTag && (
            <View className="add-tag-button" onClick={handleAddCustomTag}>
              ＋
            </View>
          )}
        </View>

        <View className="input-section">
          <NumericInput value={value} onChange={setValue} unit="毫升" />
        </View>
      </View>
    </CustomPopup>
  );
};

export default WaterInputPopup;
