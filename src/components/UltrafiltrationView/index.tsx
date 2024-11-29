import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import AddButton from "@/components/AddButton";
import { checkLogin } from "@/utils/auth";
import { getLatestPdRecord, LatestPdRecordDTO } from "@/api/pdRecordApi";
import "./index.scss";
import "../../app.scss";
import Taro from "@tarojs/taro";

const defaultRecord: LatestPdRecordDTO = {
  totalUltrafiltration: 0,
  latestConcentration: "",
  sequenceNumber: 0,
  dailyFrequency: 0,
  updateTime: "请记录今日数据",
};

const UltrafiltrationView: React.FC = () => {
  const [latestRecord, setLatestRecord] =
    useState<LatestPdRecordDTO>(defaultRecord);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    fetchLatestRecord();
  }, []);

  const fetchLatestRecord = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getLatestPdRecord(userId);
      if (response.isSuccess()) {
        setLatestRecord(response.data);
      } else {
        console.error("获取最新记录失败:", response.msg);
      }
    } catch (error) {
      console.error("获取最新记录时发生错误:", error);
    }
  };

  const onAddClick = async () => {
    Taro.navigateTo({
      url: "/pages/PdRecordInputPage/index",
    });
  };

  const onViewClick = () => {
    console.log("onViewClick");
  };

  const toggleAnimation = () => {
    setAnimate((prev) => !prev);
  };

  return (
    <View className="ultrafiltration-view">
      <Text className="large_text_semi_bold">超滤量</Text>
      <View className="ultrafiltration-card">
        <Text className="session-info">
          {latestRecord.sequenceNumber} / {latestRecord.dailyFrequency}次
        </Text>
        <View className="ball">
          <UltrafiltrationBall
            value={latestRecord.totalUltrafiltration}
            maxValue={1000}
            animate={animate}
          />
        </View>
        {latestRecord.latestConcentration && (
          <Text className="concentration">
            浓度 {latestRecord.latestConcentration}
          </Text>
        )}
        <Text className="ultrafiltration-update-time">
          {latestRecord.updateTime}
        </Text>
        <AddButton
          size={32}
          className="ultrafiltration-add-button"
          onClick={onAddClick}
        />
        <View className="view-button" onClick={onViewClick}>
          更多
        </View>
        <View onClick={toggleAnimation}>
          {animate ? "停止动画" : "开始动画"}
        </View>
      </View>
    </View>
  );
};

export default UltrafiltrationView;
