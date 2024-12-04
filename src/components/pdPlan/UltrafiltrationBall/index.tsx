import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface UltrafiltrationBallProps {
  value: number;
  maxValue: number;
  animate?: boolean;
  onChange?: (value: number) => void;
}

const UltrafiltrationBall: React.FC<UltrafiltrationBallProps> = ({
  value,
  maxValue,
  animate = true,
  onChange,
}) => {
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const [canvasReady, setCanvasReady] = useState(false);
  const currentValueRef = useRef(0);
  const targetValueRef = useRef(value);
  const isAnimatingRef = useRef(false);

  // 将工具函数移到组件外部，避免重复创建
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

  const drawGloss = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number
    ) => {
      const gradient = ctx.createRadialGradient(
        centerX - radius / 3,
        centerY - radius / 3,
        ensurePositive(radius / 10),
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    },
    [ensurePositive]
  );

  const drawWaves = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      fillRatio: number,
      color: string,
      timestamp: number
    ) => {
      const waterLevel = centerY + radius - 2 * radius * fillRatio;
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const wave = (
        x: number,
        wavelength: number,
        amplitude: number,
        offset: number
      ) => Math.sin((x + offset) / wavelength) * amplitude;

      const drawWave = (
        wavelength: number,
        amplitude: number,
        baseAlpha: number,
        yOffset: number,
        phaseShift: number,
        offset: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(centerX - radius, waterLevel + yOffset);

        // 优化波浪点的计算，减少计算量
        const step = 2;
        for (let x = 0; x <= radius * 2; x += step) {
          const y = wave(x, wavelength, amplitude, offset);
          ctx.lineTo(centerX - radius + x, waterLevel + y + yOffset);
        }

        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX - radius, centerY + radius);
        ctx.closePath();

        // 调整动态透明度的范围，使波浪更加明显
        const dynamicAlpha =
          baseAlpha + 0.15 * Math.sin(offset * 0.002 + phaseShift);
        const gradient = ctx.createLinearGradient(
          0,
          waterLevel + yOffset,
          0,
          centerY + radius
        );
        // 调整渐变的透明度，使每层波浪都更加可见
        gradient.addColorStop(0, hexToRgb(color, dynamicAlpha * 0.9)); // 增加顶部透明度
        gradient.addColorStop(0.5, hexToRgb(color, dynamicAlpha * 0.95)); // 添加中间过渡
        gradient.addColorStop(1, hexToRgb(color, dynamicAlpha)); // 保持底部透明度
        ctx.fillStyle = gradient;
        ctx.fill();
      };

      const offset = timestamp * 0.03;
      // 调整三层波浪的参数
      // 第一层：较大振幅，基础透明度提高
      drawWave(80, ensurePositive(8), 0.7, 0, 0, offset);
      // 第二层：中等振幅，适中透明度
      drawWave(50, ensurePositive(6), 0.6, -5, Math.PI, offset);
      // 第三层：小振幅，仍保持较好可见度
      drawWave(100, ensurePositive(4), 0.5, -3, Math.PI / 2, offset);

      ctx.restore();
    },
    [ensurePositive, hexToRgb]
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
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);
      const radius = ensurePositive(minDimension / 2 - 20);
      const outerRadius = radius + 5;
      const maxLineWidth = ensurePositive(Math.min(8, radius / 5));
      const minLineWidth = maxLineWidth * 0.4;
      const outerRingWidth = maxLineWidth;
      const totalSegments = 100; // 减少分段数量，提高性能
      const safeMaxValue = ensurePositive(maxValue);
      const fillRatio = Math.min(Math.abs(currentValue) / safeMaxValue, 1);
      const fillAngle = Math.PI * 2 * fillRatio;

      // 使用缓存的渐变对象
      const gradientCache = new Map();

      // 绘制外环
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(220, 220, 220, 0.8)";
      ctx.lineWidth = outerRingWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // 批量绘制线段
      const segmentBatch = 5;
      for (let i = 0; i < totalSegments; i += segmentBatch) {
        const progress = i / totalSegments;
        const currentLineWidth = Math.min(
          minLineWidth + Math.sqrt(progress) * (maxLineWidth - minLineWidth),
          maxLineWidth
        );

        ctx.beginPath();
        for (let j = 0; j < segmentBatch && i + j < totalSegments; j++) {
          const startAngle =
            -Math.PI / 2 + (fillAngle / totalSegments) * (i + j);
          const endAngle =
            -Math.PI / 2 + (fillAngle / totalSegments) * (i + j + 1);
          ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        }

        const alpha = Math.min(progress * 2, 1);
        const baseAlpha = Math.max(0.05, 0.1 - progress * 0.8);

        let gradientKey = `${progress}`;
        let gradient = gradientCache.get(gradientKey);

        if (!gradient) {
          gradient = ctx.createRadialGradient(
            centerX,
            centerY,
            radius,
            centerX,
            centerY,
            outerRadius
          );
          gradient.addColorStop(0, `rgba(146, 163, 253, ${baseAlpha})`);
          gradient.addColorStop(1, `rgba(146, 163, 253, ${alpha})`);
          gradientCache.set(gradientKey, gradient);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // 绘制端点
      const endX = centerX + outerRadius * Math.cos(-Math.PI / 2 + fillAngle);
      const endY = centerY + outerRadius * Math.sin(-Math.PI / 2 + fillAngle);
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // 绘制水波和数值
      const color = currentValue < 0 ? "#C58BF2" : "#5088F8";
      drawWaves(
        ctx,
        centerX,
        centerY,
        ensurePositive(radius - outerRingWidth / 2),
        fillRatio,
        color,
        timestamp
      );
      drawGloss(
        ctx,
        centerX,
        centerY,
        ensurePositive(radius - outerRingWidth / 2)
      );

      // 绘制文字
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(currentValue)} ml`, centerX, centerY);

      gradientCache.clear();
    },
    [drawWaves, drawGloss, ensurePositive]
  );

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    isAnimatingRef.current = false;
  }, []);

  const animateBall = useCallback(() => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    let lastTimestamp = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!canvasRef.current || !isAnimatingRef.current) {
        stopAnimation();
        return;
      }

      const elapsed = timestamp - lastTimestamp;
      if (elapsed > frameInterval) {
        const { ctx, width, height } = canvasRef.current;
        const diff = targetValueRef.current - currentValueRef.current;
        const isNearTarget = Math.abs(diff) < 0.1;

        if (isNearTarget) {
          currentValueRef.current = targetValueRef.current;
          drawBall(
            ctx,
            width,
            height,
            currentValueRef.current,
            Math.max(1, maxValue),
            timestamp
          );
          if (!animate) {
            stopAnimation();
            return;
          }
        } else {
          currentValueRef.current += diff * 0.05;
          drawBall(
            ctx,
            width,
            height,
            currentValueRef.current,
            Math.max(1, maxValue),
            timestamp
          );
        }
        lastTimestamp = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [drawBall, maxValue, stopAnimation]);

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
        }
      });

    return () => {
      stopAnimation();
      canvasRef.current = null;
    };
  }, [stopAnimation]);

  useEffect(() => {
    if (canvasReady) {
      targetValueRef.current = value;
      if (animate && !animationRef.current) {
        animateBall();
      } else if (!animate) {
        stopAnimation();
        if (canvasRef.current) {
          const { ctx, width, height } = canvasRef.current;
          drawBall(
            ctx,
            width,
            height,
            value,
            Math.max(1, maxValue),
            performance.now()
          );
        }
      }
    }
  }, [
    value,
    animate,
    canvasReady,
    animateBall,
    drawBall,
    maxValue,
    stopAnimation,
  ]);

  const handleTap = useCallback(
    (e: any) => {
      if (!canvasRef.current || !onChange) return;

      const { width, height } = canvasRef.current;
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      const angle = Math.atan2(y, x);
      const newValue = Math.max(
        0,
        Math.round(((angle + Math.PI) / (2 * Math.PI)) * maxValue)
      );
      onChange(newValue);
    },
    [onChange, maxValue]
  );

  return (
    <Canvas
      type="2d"
      id="ultrafiltrationBall"
      className="ultrafiltrationBall"
      onClick={handleTap}
    />
  );
};

export default React.memo(UltrafiltrationBall);
