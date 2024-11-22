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
const MAX_TAG_COUNT = 8; // Maximum number of tags allowed

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
      if (response?.isSuccess && response.data?.length) {
        setUserTags(response.data);
      } else {
        setUserTags(DEFAULT_VOLUME_TAGS.map(String)); // 使用默认标签
      }
    } catch (error) {
      console.error("加载标签失败", error);
      setUserTags(DEFAULT_VOLUME_TAGS.map(String)); // 使用默认标签
    }
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
          await saveWaterTags(userId, newTags.join(","));
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
    const inputValue = e.target.value.replace(/^0+/, "").slice(0, 4);
    setNewTagValue(inputValue);
  };

  const handleTagInputConfirm = async () => {
    const numericTag = parseInt(newTagValue, 10);
    if (!numericTag || isNaN(numericTag)) {
      Taro.showToast({ title: "请输入有效的整数", icon: "none" });
      return;
    }

    if (userTags.includes(numericTag.toString())) {
      Taro.showToast({ title: "标签已存在", icon: "none" });
      return;
    }

    if (userTags.length >= MAX_TAG_COUNT) {
      Taro.showToast({ title: "标签已达到最大数量", icon: "none" });
      setIsEditingNewTag(false);
      return;
    }

    const updatedTags = [...userTags, numericTag.toString()];
    setUserTags(updatedTags);

    const userId = Taro.getStorageSync("userId");
    try {
      await saveWaterTags(userId, updatedTags.join(","));
      setIsEditingNewTag(false);
    } catch (error) {
      Taro.showToast({ title: "添加失败", icon: "error" });
    }
  };

  const handleCancelNewTag = () => {
    setIsEditingNewTag(false);
    setNewTagValue("0");
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

      const requestData = {
        userId,
        amount: numericValue,
        intakeTime,
      };

      await addWaterIntakeRecord(requestData);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("添加喝水记录失败", error);
      Taro.showToast({ title: "添加失败", icon: "error" });
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
        handleCancelNewTag();
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
          {userTags.map((volume) => (
            <View
              key={volume}
              className="volume-tag"
              onClick={() => handleVolumeTagClick(volume)}
              onLongPress={() => handleLongPressTag(volume)}
            >
              {volume} ml
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
                />
                <View className="tag-input-cancel" onClick={handleCancelNewTag}>
                  取消
                </View>
              </View>
            </View>
          )}

          {!isEditingNewTag && userTags.length < MAX_TAG_COUNT && (
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
