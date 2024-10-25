import React, { useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

interface UltrafiltrationBallProps {
  value: number;
  maxValue: number;
  animate?: boolean; // 新增的属性
  onChange?: (value: number) => void;
}

const UltrafiltrationBall: React.FC<UltrafiltrationBallProps> = ({
  value,
  maxValue,
  animate = true, // 默认值为 true
  onChange,
}) => {
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const [canvasReady, setCanvasReady] = useState(false);
  const currentValueRef = useRef(0);
  const targetValueRef = useRef(value);

  const ensurePositive = (value: number) => Math.max(0.1, value);

  const hexToRgb = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const drawGloss = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    const gradient = ctx.createRadialGradient(centerX - radius / 3, centerY - radius / 3, ensurePositive(radius / 10), centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  };

  const drawWaves = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, fillRatio: number, color: string, timestamp: number) => {
    const waterLevel = centerY + radius - 2 * radius * fillRatio;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    const wave = (x: number, wavelength: number, amplitude: number, speed: number, offset: number) => Math.sin((x + offset) / wavelength) * amplitude;

    const drawWave = (wavelength: number, amplitude: number, speed: number, baseAlpha: number, yOffset: number, phaseShift: number, offset: number) => {
      ctx.beginPath();
      ctx.moveTo(centerX - radius, waterLevel + yOffset);
      for (let x = 0; x <= radius * 2; x++) {
        const y = wave(x, wavelength, amplitude, speed, offset);
        ctx.lineTo(centerX - radius + x, waterLevel + y + yOffset);
      }
      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();
      const dynamicAlpha = baseAlpha + 0.3 * Math.sin(offset * 0.002 + phaseShift);
      const gradient = ctx.createLinearGradient(0, waterLevel + yOffset, 0, centerY + radius);
      gradient.addColorStop(0, hexToRgb(color, dynamicAlpha * 0.7));
      gradient.addColorStop(1, hexToRgb(color, dynamicAlpha));
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const offset = timestamp * 0.03;
    drawWave(80, ensurePositive(8), 0.03, 0.5, 0, 0, offset);
    drawWave(50, ensurePositive(6), 0.05, 0.3, -5, Math.PI, offset);
    drawWave(100, ensurePositive(4), 0.02, 0.2, -3, Math.PI / 2, offset);

    ctx.restore();
  };

    const drawBall = (ctx: CanvasRenderingContext2D, width: number, height: number, currentValue: number, maxValue: number, timestamp: number) => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);
      const radius = ensurePositive(minDimension / 2 - 20);
      const outerRadius = radius + 5;
      const maxLineWidth = ensurePositive(Math.min(8, radius / 5));
      const minLineWidth = maxLineWidth * 0.4;
      const outerRingWidth = maxLineWidth;
      const totalSegments = 500;
      const safeMaxValue = ensurePositive(maxValue);
      const fillRatio = Math.min(Math.abs(currentValue) / safeMaxValue, 1);
      const fillAngle = Math.PI * 2 * fillRatio;
      const outerRingColor = 'rgba(200, 200, 200, 0.8)';
  
      // 绘制灰色外环
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = outerRingColor;
      ctx.lineWidth = outerRingWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
  
      // 动态调整线条厚度
      for (let i = 0; i < totalSegments; i++) {
        const startAngle = -Math.PI / 2 + (fillAngle / totalSegments) * i;
        const endAngle = -Math.PI / 2 + (fillAngle / totalSegments) * (i + 1);
        const progress = i / totalSegments;
        const currentLineWidth = Math.min(minLineWidth + Math.sqrt(progress) * (maxLineWidth - minLineWidth), maxLineWidth);
        const alpha = Math.min(progress * 2, 1);
        const baseAlpha = Math.max(0.05, 0.1 - progress * 0.8);
        const gradientLine = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, outerRadius);
        gradientLine.addColorStop(0, `rgba(146, 163, 253, ${baseAlpha})`);
        gradientLine.addColorStop(1, `rgba(146, 163, 253, ${alpha})`);
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.strokeStyle = gradientLine;
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
  
      // 绘制端点圆点
      const endX = centerX + outerRadius * Math.cos(-Math.PI / 2 + fillAngle);
      const endY = centerY + outerRadius * Math.sin(-Math.PI / 2 + fillAngle);
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
  
      // 绘制水波和数值
      const color = currentValue < 0 ? '#C58BF2' : '#5088F8';
      drawWaves(ctx, centerX, centerY, ensurePositive(radius - outerRingWidth / 2), fillRatio, color, timestamp);
      drawGloss(ctx, centerX, centerY, ensurePositive(radius - outerRingWidth / 2));
  
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(currentValue)} ml`, centerX, centerY);
    };
  

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
          canvasRef.current = { canvas, ctx, width: res[0].width, height: res[0].height };
          setCanvasReady(true);
        }
      });

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const animateBall = useCallback(() => {
    let frameCount = 0;
    const animate = (timestamp) => {
      if (!canvasRef.current) return;

      if (frameCount % 3 === 0) {
        const { ctx, width, height } = canvasRef.current;
        const diff = targetValueRef.current - currentValueRef.current;
        currentValueRef.current += diff * 0.05;
        drawBall(ctx, width, height, currentValueRef.current, Math.max(1, maxValue), timestamp);
      }
      frameCount += 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [drawBall, maxValue]);

  useEffect(() => {
    if (canvasReady) {
      targetValueRef.current = value;
      if (animate && !animationRef.current) {
        animateBall();
      } else if (!animate && animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    }
  }, [value, animate, canvasReady]);

  const handleTap = (e: any) => {
    if (!canvasRef.current || !onChange) return;
    const { width, height } = canvasRef.current;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    const angle = Math.atan2(y, x);
    const newValue = Math.max(0, Math.round((angle + Math.PI) / (2 * Math.PI) * maxValue));
    onChange(newValue);
  };

  return (
    <Canvas type="2d" id="ultrafiltrationBall" className="ultrafiltrationBall" onClick={handleTap} />
  );
};

export default UltrafiltrationBall;
