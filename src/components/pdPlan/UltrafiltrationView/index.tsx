import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import UltrafiltrationBall from "../UltrafiltrationBall";
import AddButton from "@/components/common/AddButton";
import { getLatestPdRecord, LatestPdRecordDTO } from "@/api/pdRecordApi";
import { getCurrentPdPlan } from "@/api/pdPlanApi";
import "./index.scss";
import Taro, { useDidShow } from "@tarojs/taro";

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

  useDidShow(() => {
    const shouldRefresh = Taro.getStorageSync("refreshUltrafiltrationView");
    if (shouldRefresh) {
      fetchLatestRecord();
      Taro.removeStorageSync("refreshUltrafiltrationView");
    }
  });

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

  const checkPdPlan = async (): Promise<boolean> => {
    try {
      const userId = Taro.getStorageSync("userId");
      const response = await getCurrentPdPlan(userId);
      return response.isSuccess() && response.data !== null;
    } catch (error) {
      console.error("检查腹透计划时发生错误:", error);
      return false;
    }
  };

  const onAddClick = async () => {
    const hasPdPlan = await checkPdPlan();
    if (hasPdPlan) {
      Taro.navigateTo({
        url: "/pages/pdPlan/record/index",
      });
    } else {
      Taro.showModal({
        title: "提示",
        content: "您还没有设置腹透计划，是否现在去添加？",
        confirmText: "去添加",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: "/pages/pdPlan/planManage/index" });
          }
        },
      });
    }
  };

  const onViewClick = async () => {
    const hasPdPlan = await checkPdPlan();
    if (hasPdPlan) {
      console.log("有腹透计划");
      Taro.navigateTo({ url: "/pages/pdPlan/historicalDataMore/index" });
      // Taro.navigateTo({
      //   url: "/pages/pdPlan/dialysisDetails/index",
      // });
    } else {
      Taro.showModal({
        title: "提示",
        content: "您还没有设置腹透计划，是否现在去添加？",
        confirmText: "去添加",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: "/pages/pdPlan/planManage/index" });
          }
        },
      });
    }
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
      </View>
    </View>
  );
};

export default UltrafiltrationView;
