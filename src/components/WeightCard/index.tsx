import React from "react";
import { View, Text } from "@tarojs/components";
import "./index.scss";
import "../../app.scss";

interface WeightCardProps {
  data: {
    weight: number;
    unit: string;
    weightChange: number;
    updateTime: string;
    relativeTime: string;
  };
}

const WeightCard: React.FC<WeightCardProps> = ({ data }) => {
  // 拆分 weight 为整数和小数部分
  const [integerPart, decimalPart] = data.weight.toFixed(1).split(".");

  return (
    <View className="weight-card">
      <Text className="small_text_medium weight-title">体重</Text>

      <View className="weight-container">
        <View className="edit-button"></View>
        {/* 显示体重，分为整数部分和小数部分 */}
        <View className="weight-value">
          <Text className="weight-integer">{integerPart}.</Text>
          <Text className="weight-decimal">{decimalPart}</Text>
          <View className="weight-unit grey_text_semi_bold">{data.unit}</View>
        </View>
        <Text className="weight-update-time">{data.updateTime}</Text>
      </View>

      <View className="weight-change-container">
        {/* 第一行：体重变化和箭头 */}
        <View className="weight-change-row">
          <Text className="weight-change">
            {Math.abs(data.weightChange).toFixed(1)} {/* 保留一位小数 */}
          </Text>
          {data.weightChange >= 0 ? (
            <View
              className="weight-change-icon-up"
              style={{
                backgroundImage: `url(${
                  data.weightChange > 1
                    ? "../../assets/icons/arrow_up_red.jpg"
                    : "../../assets/icons/arrow_up_green.jpg"
                })`,
              }}
            ></View>
          ) : (
            <View
              className="weight-change-icon-down"
              style={{
                backgroundImage: `url(${
                  Math.abs(data.weightChange) > 1
                    ? "../../assets/icons/arrow_down_red.jpg"
                    : "../../assets/icons/arrow_down_green.jpg"
                })`,
              }}
            ></View>
          )}
        </View>

        {/* 第二行：体重变化时间 */}
        <Text className="weight-relative-time">相比于{data.relativeTime}</Text>
      </View>

      <View className="details-button"></View>
    </View>
  );
};

export default WeightCard;
