import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface UltrafiltrationBallProps {
  value: number;
  maxValue: number;
  onChange?: (value: number) => void;
}

const UltrafiltrationBall: React.FC<UltrafiltrationBallProps> = ({
  value,
  maxValue,
  onChange,
}) => {
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const [canvasReady, setCanvasReady] = useState(false);
  const currentValueRef = useRef(0);
  const targetValueRef = useRef(value);
  const [stopWave, setStopWave] = useState(false);

  const ensurePositive = useCallback(
    (value: number) => Math.max(0.1, value),
    []
  );

  

  

  const hexToRgb = useCallback((hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  const drawWaves = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      fillRatio: number,
      color: string,
      timestamp: number,
      stopWave: boolean
    ) => {
      const waterLevel = centerY + radius - 2 * radius * fillRatio;
      const isMaxFill = fillRatio >= 0.999; // 判断是否达到最大填充高度

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const wave = (
        x: number,
        wavelength: number,
        amplitude: number,
        speed: number,
        phase: number
      ) => Math.sin((x + timestamp * speed + phase) / wavelength) * amplitude;

      const drawWave = (
        wavelength: number,
        amplitude: number,
        speed: number,
        baseAlpha: number,
        yOffset: number,
        phaseShift: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(centerX - radius, waterLevel + yOffset);

        if (isMaxFill || stopWave) {
          // 当达到最大高度或停止波浪时，绘制水平线
          ctx.lineTo(centerX - radius, waterLevel);
          ctx.lineTo(centerX + radius, waterLevel);
        } else {
          // 正常绘制波浪
          for (let x = 0; x <= radius * 2; x++) {
            const y = wave(x, wavelength, amplitude, speed, phaseShift);
            ctx.lineTo(centerX - radius + x, waterLevel + y + yOffset);
          }
        }

        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
          0,
          waterLevel + yOffset,
          0,
          centerY + radius
        );
        
        if (isMaxFill || stopWave) {
          // 达到最大高度时使用更深的颜色
          gradient.addColorStop(0, hexToRgb(color, 0.9));
          gradient.addColorStop(1, hexToRgb(color, 0.8));
        } else {
          gradient.addColorStop(0, hexToRgb(color, baseAlpha * 0.7));
          gradient.addColorStop(1, hexToRgb(color, baseAlpha));
        }

        ctx.fillStyle = gradient;
        ctx.fill();
      };

      // 根据填充状态决定波浪效果
      if (isMaxFill || stopWave) {
        // 达到最大高度时只绘制一层
        drawWave(100, 0, 0, 0.8, 0, 0);
      } else {
        // 计算波浪振幅，接近最大值时逐渐减小
        const amplitudeFactor = Math.max(0, 1 - fillRatio * 1.5);
        const baseAmplitude = 10 * amplitudeFactor;

        drawWave(100, baseAmplitude, 0.04, 0.6, 0, 0);
        drawWave(80, baseAmplitude * 0.7, 0.05, 0.5, 5, 2);
        drawWave(60, baseAmplitude * 0.5, 0.06, 0.4, 10, 4);
      }

      ctx.restore();
    },
    [hexToRgb]
);

const drawGloss = useCallback(
  (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    const glossRadius = radius * 0.8;
    const gradient = ctx.createRadialGradient(
      centerX - glossRadius / 2,
      centerY - glossRadius / 2,
      glossRadius / 8,
      centerX - glossRadius / 2,
      centerY - glossRadius / 2,
      glossRadius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.arc(centerX - glossRadius / 2, centerY - glossRadius / 2, glossRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  },
  []
);

const drawBall = useCallback(
  (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentValue: number,
    maxValue: number,
    timestamp: number
  ) => {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const minDimension = Math.min(width, height);
    const radius = ensurePositive(minDimension / 2 - 20); // 外环半径
    const outerRadius = radius + 5; // 进度条略大于外环半径
    const maxLineWidth = ensurePositive(Math.min(8, radius / 5)); // 最大厚度
    const minLineWidth = maxLineWidth * 0.4; // 起始厚度
    const outerRingWidth = maxLineWidth; // 外环厚度保持一致

    // 定义进度条的分段数量
    const totalSegments = 500;

    // 计算填充比例
    const safeMaxValue = ensurePositive(maxValue);
    const fillRatio = Math.min(Math.abs(currentValue) / safeMaxValue, 1);
    const fillAngle = Math.PI * 2 * fillRatio;

    const outerRingColor = "rgba(200, 200, 200, 0.8)"; // 灰色透明环

    // 绘制灰色外环（没有透明渐变）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = outerRingColor;
    ctx.lineWidth = outerRingWidth; // 外环的宽度保持一致
    ctx.lineCap = "round";
    ctx.stroke();

    // 动态调整线条厚度并使其贴紧外环
    for (let i = 0; i < totalSegments; i++) {
      const startAngle = -Math.PI / 2 + (fillAngle / totalSegments) * i;
      const endAngle = -Math.PI / 2 + (fillAngle / totalSegments) * (i + 1);

      // 逐渐增加线条的宽度
      const progress = i / totalSegments;
      const currentLineWidth = Math.min(
        minLineWidth + Math.sqrt(progress) * (maxLineWidth - minLineWidth),
        maxLineWidth
      );

      // 线条透明度渐变
      const alpha = Math.min(progress * 2, 1);
      const baseAlpha = Math.max(0.05, 0.1 - progress * 0.8); // 调整起始透明度

      // 绘制线条
      const gradientLine = ctx.createRadialGradient(
        centerX,
        centerY,
        radius,
        centerX,
        centerY,
        outerRadius
      );
      gradientLine.addColorStop(0, `rgba(146, 163, 253, ${baseAlpha})`); // 从内侧开始的透明蓝色
      gradientLine.addColorStop(1, `rgba(146, 163, 253, ${alpha})`); // 到外圈深蓝

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.strokeStyle = gradientLine;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // 绘制端点圆点（白色）
    const endX = centerX + outerRadius * Math.cos(-Math.PI / 2 + fillAngle);
    const endY = centerY + outerRadius * Math.sin(-Math.PI / 2 + fillAngle);
    const outerDotRadius = 8; // 外白点半径
    ctx.beginPath();
    ctx.arc(endX, endY, outerDotRadius, 0, Math.PI * 2); // 白色端点
    ctx.fillStyle = "#FFFFFF"; // 白色
    ctx.fill();

    let color = "#5088F8"; // 蓝色
    if (currentValue < 0) {
      color = "#C58BF2"; // 紫色
    }

    // 绘制水波、光泽和中心数值
    drawWaves(
      ctx,
      centerX,
      centerY,
      ensurePositive(radius - maxLineWidth / 2),
      fillRatio,
      color,
      timestamp,
      stopWave
    );
    drawGloss(
      ctx,
      centerX,
      centerY,
      ensurePositive(radius - maxLineWidth / 2)
    );
    ctx.fillStyle = "#FFFFFF"; // 深色字体
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const displayValue = `${Math.round(currentValue)} ml`;
    ctx.fillText(displayValue, centerX, centerY);
  },
  [ensurePositive, drawWaves, drawGloss, stopWave]
);

  useEffect(() => {
    if (!canvasReady) return;

    targetValueRef.current = value;
    if (!animationRef.current) {
      animateBall();
    }
  }, [value, maxValue, canvasReady]);

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query
      .select("#ultrafiltrationBall")
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0] && res[0].node) {
          const canvas = res[0].node;
          const ctx = canvas.getContext("2d");

          const { pixelRatio } = Taro.getWindowInfo();

          canvas.width = res[0].width * pixelRatio;
          canvas.height = res[0].height * pixelRatio;
          ctx.scale(pixelRatio, pixelRatio);

          canvasRef.current = {
            canvas,
            ctx,
            width: res[0].width,
            height: res[0].height,
          };
          setCanvasReady(true);
        } else {
          console.error("Failed to get canvas node");
        }
      });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvasRef.current = null;
      animationRef.current = undefined;
    };
  }, []);

  const animateBall = useCallback(() => {
    const animate = (timestamp: number) => {
      if (!canvasRef.current) return;
      const { ctx, width, height } = canvasRef.current;

      const diff = targetValueRef.current - currentValueRef.current;
      const isAtMax = currentValueRef.current >= maxValue;

      if (Math.abs(diff) < 0.01 && !isAtMax) {
        currentValueRef.current = targetValueRef.current;
        cancelAnimationFrame(animationRef.current!);
        return;
      }

      currentValueRef.current += diff * 0.05;
      drawBall(ctx, width, height, currentValueRef.current, maxValue, timestamp);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
}, [drawBall]);

  

  useEffect(() => {
    if (currentValueRef.current >= maxValue) {
      setTimeout(() => setStopWave(true), 5000); // 5秒后停止波浪
    }
  }, [currentValueRef.current, maxValue]);

  return (
    <Canvas
      type="2d"
      id="ultrafiltrationBall"
      className="ultrafiltration-ball"
      canvasId="ultrafiltrationBall"
      ref={canvasRef}
    />
  );
};

export default UltrafiltrationBall;