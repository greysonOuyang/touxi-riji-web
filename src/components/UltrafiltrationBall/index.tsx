import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface UltrafiltrationBallProps {
  value: number;
  maxValue: number;
}

const UltrafiltrationBall: React.FC<UltrafiltrationBallProps> = ({ value, maxValue }) => {
  const canvasRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const [canvasReady, setCanvasReady] = useState(false);
  const currentValueRef = useRef(0);
  const targetValueRef = useRef(value);

  useEffect(() => {
    if (!canvasReady) return;

    targetValueRef.current = value;
    if (!animationRef.current) {
      animateBall();
    }
  }, [value, maxValue, canvasReady]);

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query.select('#ultrafiltrationBall')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const { pixelRatio } = Taro.getWindowInfo();
        
        canvas.width = res[0].width * pixelRatio;
        canvas.height = res[0].height * pixelRatio;
        ctx.scale(pixelRatio, pixelRatio);
        
        canvasRef.current = { canvas, ctx, width: canvas.width / pixelRatio, height: canvas.height / pixelRatio };
        setCanvasReady(true);
      });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animateBall = () => {
    const animate = (timestamp: number) => {
      if (!canvasRef.current) return;
      const { ctx, width, height } = canvasRef.current;

      // 平滑过渡到目标值
      const diff = targetValueRef.current - currentValueRef.current;
      currentValueRef.current += diff * 0.1; // 调整这个系数可以改变过渡速度

      if (Math.abs(diff) > 0.1) {
        drawBall(ctx, width, height, currentValueRef.current, maxValue, timestamp);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        currentValueRef.current = targetValueRef.current;
        drawBall(ctx, width, height, currentValueRef.current, maxValue, timestamp);
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const drawBall = (ctx: CanvasRenderingContext2D, width: number, height: number, currentValue: number, maxValue: number, timestamp: number) => {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // 绘制外圈（灰色）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 计算填充比例
    const fillRatio = Math.abs(currentValue) / maxValue;
    const fillAngle = Math.PI * 2 * fillRatio;

    // 绘制填充的外圈（蓝色或橙色）
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + fillAngle);
    ctx.strokeStyle = currentValue >= 0 ? '#3498db' : '#f39c12';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 绘制水波
    drawWaves(ctx, centerX, centerY, radius, fillRatio, currentValue >= 0 ? '#3498db' : '#f39c12', timestamp);

    // 绘制气泡
    drawBubbles(ctx, centerX, centerY, radius, fillRatio, timestamp);
  };

  const drawWaves = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, fillRatio: number, color: string, timestamp: number) => {
    const waterLevel = centerY + radius - (2 * radius * fillRatio);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    const wave = (x: number, wavelength: number, amplitude: number, speed: number) => 
      Math.sin((x + timestamp * speed) / wavelength) * amplitude;

    const drawWave = (wavelength: number, amplitude: number, speed: number, alpha: number) => {
      ctx.beginPath();
      ctx.moveTo(centerX - radius, waterLevel);
      for (let x = 0; x <= radius * 2; x++) {
        const y = wave(x, wavelength, amplitude, speed);
        ctx.lineTo(centerX - radius + x, waterLevel + y);
      }
      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, waterLevel, 0, centerY + radius);
      gradient.addColorStop(0, hexToRgb(color, alpha));
      gradient.addColorStop(1, hexToRgb(color, 1));
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    drawWave(80, 5, 0.03, 0.5);
    drawWave(50, 3, 0.05, 0.3);

    ctx.restore();
  };

  const drawBubbles = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, fillRatio: number, timestamp: number) => {
    const bubbles = [
      { x: -20, y: 0, radius: 3, speed: 0.05 },
      { x: 15, y: 0, radius: 2, speed: 0.03 },
      { x: -5, y: 0, radius: 1.5, speed: 0.02 },
    ];

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    bubbles.forEach((bubble, index) => {
      const x = centerX + bubble.x;
      const maxY = centerY + radius - (2 * radius * fillRatio);
      const y = centerY + radius - ((timestamp * bubble.speed + index * 1000) % (2 * radius * fillRatio));

      ctx.beginPath();
      ctx.arc(x, Math.max(y, maxY), bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
    });

    ctx.restore();
  };

  const hexToRgb = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Canvas 
      type='2d'
      id='ultrafiltrationBall'
      className='ultrafiltration-ball'
      canvasId='ultrafiltrationBall'
    />
  );
};

export default UltrafiltrationBall;