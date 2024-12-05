import React, { useEffect } from "react";
import Taro, { useReady } from "@tarojs/taro";
import { View, Canvas } from "@tarojs/components";

const TrendChart: React.FC = () => {
  useReady(() => {
    drawChart();
  });

  const drawChart = () => {
    const ctx = Taro.createCanvasContext("trendChart");
    const data = [820, 932, 901, 934, 1290, 1330, 1320];
    const maxData = Math.max(...data);
    const canvasWidth = 300;
    const canvasHeight = 200;
    const padding = 20;
    const availableWidth = canvasWidth - 2 * padding;
    const availableHeight = canvasHeight - 2 * padding;

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.stroke();

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvasHeight - padding);
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
    ctx.stroke();

    // Draw data points and lines
    ctx.beginPath();
    ctx.setStrokeStyle("#3b82f6");
    ctx.setLineWidth(2);
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * availableWidth;
      const y = canvasHeight - padding - (value / maxData) * availableHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw labels
    ctx.setFontSize(10);
    ctx.setFillStyle("#333");
    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    days.forEach((day, index) => {
      const x = padding + (index / (days.length - 1)) * availableWidth;
      ctx.fillText(day, x - 10, canvasHeight - padding + 15);
    });

    ctx.draw();
  };

  return (
    <View>
      <Canvas canvasId="trendChart" style="width: 300px; height: 200px;" />
    </View>
  );
};

export default TrendChart;
