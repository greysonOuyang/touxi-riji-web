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

  const ensurePositive = useCallback(
    (value: number) => Math.max(0.1, value),
    []
  );

  const drawBall = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, currentValue: number, maxValue: number, timestamp: number) => {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const minDimension = Math.min(width, height);
    const radius = ensurePositive(minDimension / 2 - 20);  // 外环半径
    const outerRadius = radius + 5;  // 进度条略大于外环半径
    const maxLineWidth = ensurePositive(Math.min(8, radius / 5));  // 最大厚度
    const minLineWidth = maxLineWidth * 0.4;  // 起始厚度
    const outerRingWidth = maxLineWidth;  // 外环厚度保持一致

    // 定义进度条的分段数量
    const totalSegments = 500;

    // 计算填充比例
    const safeMaxValue = ensurePositive(maxValue);
    const fillRatio = Math.min(Math.abs(currentValue) / safeMaxValue, 1);
    const fillAngle = Math.PI * 2 * fillRatio;

    const outerRingColor = 'rgba(200, 200, 200, 0.8)';  // 灰色透明环

    // 绘制灰色外环（没有透明渐变）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = outerRingColor;
    ctx.lineWidth = outerRingWidth;  // 外环的宽度保持一致
    ctx.lineCap = 'round';
    ctx.stroke();

    // 动态调整线条厚度并使其贴紧外环
    for (let i = 0; i < totalSegments; i++) {
        const startAngle = -Math.PI / 2 + (fillAngle / totalSegments) * i;
        const endAngle = -Math.PI / 2 + (fillAngle / totalSegments) * (i + 1);

        // 逐渐增加线条的宽度
        const progress = i / totalSegments;
        const currentLineWidth = Math.min(minLineWidth + Math.sqrt(progress) * (maxLineWidth - minLineWidth), maxLineWidth);

        // 线条透明度渐变
        const alpha = Math.min(progress * 2, 1);
        const baseAlpha = Math.max(0.05, 0.1 - progress * 0.8);  // 调整起始透明度

        // 绘制线条
        const gradientLine = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, outerRadius);
        gradientLine.addColorStop(0, `rgba(0, 122, 255, ${baseAlpha})`);  // 从内侧开始的透明蓝色
        gradientLine.addColorStop(1, `rgba(0, 122, 255, ${alpha})`);  // 到外圈深蓝 

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.strokeStyle = gradientLine;
        ctx.lineWidth = currentLineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // 绘制端点圆点（白色）
    const endX = centerX + outerRadius * Math.cos(-Math.PI / 2 + fillAngle);
    const endY = centerY + outerRadius * Math.sin(-Math.PI / 2 + fillAngle);
    const outerDotRadius = 8;  // 外白点半径
    ctx.beginPath();
    ctx.arc(endX, endY, outerDotRadius, 0, Math.PI * 2);  // 白色端点
    ctx.fillStyle = '#FFFFFF';  // 白色
    ctx.fill();

    // 绘制水波、光泽和中心数值
    drawWaves(ctx, centerX, centerY, ensurePositive(radius - maxLineWidth / 2), fillRatio, '#3874f5', timestamp);
    drawGloss(ctx, centerX, centerY, ensurePositive(radius - maxLineWidth / 2));
    ctx.fillStyle = '#FFFFFF';  // 深色字体
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayValue = `${Math.round(currentValue)} ml`;
    ctx.fillText(displayValue, centerX, centerY);
}, [ensurePositive]);

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
      speed: number
    ) => Math.sin((x + timestamp * speed) / wavelength) * amplitude;

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

      for (let x = 0; x <= radius * 2; x++) {
        const y = wave(x, wavelength, amplitude, speed);
        ctx.lineTo(centerX - radius + x, waterLevel + y + yOffset);
      }

      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();

      // 动态调整颜色透明度，基于时间戳生成变化的 alpha 值
      const dynamicAlpha = baseAlpha + 0.3 * Math.sin(timestamp * 0.002 + phaseShift);

      const gradient = ctx.createLinearGradient(
        0,
        waterLevel + yOffset,
        0,
        centerY + radius
      );
      gradient.addColorStop(0, hexToRgb(color, dynamicAlpha * 0.7));
      gradient.addColorStop(1, hexToRgb(color, dynamicAlpha));

      ctx.fillStyle = gradient;
      ctx.fill();
    };

    // 为每个波浪层绘制时引入不同的相位偏移和动态透明度变化
    drawWave(80, ensurePositive(8), 0.03, 0.5, 0, 0);       // 第一层波浪
    drawWave(50, ensurePositive(6), 0.05, 0.3, -5, Math.PI);  // 第二层波浪，相位偏移 Math.PI
    drawWave(100, ensurePositive(4), 0.02, 0.2, -3, Math.PI / 2); // 第三层波浪，相位偏移 Math.PI / 2

    ctx.restore();
  },
  [ensurePositive]
);


  const drawBubbles = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      fillRatio: number,
      timestamp: number
    ) => {
      const bubbles = [
        { x: -20, y: 0, radius: ensurePositive(3), speed: 0.05 },
        { x: 15, y: 0, radius: ensurePositive(2), speed: 0.03 },
        { x: -5, y: 0, radius: ensurePositive(1.5), speed: 0.02 },
      ];

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      bubbles.forEach((bubble, index) => {
        const x = centerX + bubble.x;
        const maxY = centerY + radius - 2 * radius * fillRatio;
        const y =
          centerY +
          radius -
          ((timestamp * bubble.speed + index * 1000) %
            (2 * radius * fillRatio));

        ctx.beginPath();
        ctx.arc(x, Math.max(y, maxY), bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
      });

      ctx.restore();
    },
    [ensurePositive]
  );

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

  const hexToRgb = useCallback((hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

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
          console.log(
            `Canvas initialized: width=${res[0].width}, height=${res[0].height}, pixelRatio=${pixelRatio}`
          );
        } else {
          console.error("Failed to get canvas node");
        }
      });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animateBall = useCallback(() => {
    const animate = (timestamp: number) => {
      if (!canvasRef.current) return;
      const { ctx, width, height } = canvasRef.current;

      // 平滑过渡到目标值
      const diff = targetValueRef.current - currentValueRef.current;
      currentValueRef.current += diff * 0.05; // 调整这个系数可以改变过渡速度

      drawBall(
        ctx,
        width,
        height,
        currentValueRef.current,
        Math.max(1, maxValue),
        timestamp
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [drawBall, maxValue]);

  // handleTap 函数保持不变
  const handleTap = useCallback(
    (e: any) => {
      if (!canvasRef.current || !onChange) return;

      const { width, height } = canvasRef.current;
      const rect = e.target.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      const centerY = height / 2;
      const radius = ensurePositive(Math.min(width, height) / 2 - 10);

      const newValue =
        ((centerY + radius - y) / (2 * radius)) * maxValue * 2 - maxValue;
      onChange(Math.max(-maxValue, Math.min(maxValue, newValue)));
    },
    [onChange, maxValue, ensurePositive]
  );

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
