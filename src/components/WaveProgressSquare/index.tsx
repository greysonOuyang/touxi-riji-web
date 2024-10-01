import React, { useEffect, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import { Canvas, View, Text } from '@tarojs/components';
import './index.scss';

interface WaveProgressSquareProps {
  title: string;
  value: number;
  unit: string;
  percentage: number;
  color: string;
}

const WaveProgressSquare: React.FC<WaveProgressSquareProps> = ({
  title,
  value,
  unit,
  percentage,
  color
}) => {
  const canvasId = 'waveProgressSquare';
  const requestRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const systemInfo = Taro.getSystemInfoSync();
      const width = systemInfo.windowWidth - 32; // 减去左右各16px的内边距
      const height = 200; // 你可以根据需要调整高度
      setSize({ width, height });
    };

    updateSize();
    Taro.onWindowResize(updateSize);

    return () => {
      Taro.offWindowResize(updateSize);
    };
  }, []);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;

    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = Taro.getSystemInfoSync().pixelRatio;
        canvas.width = size.width * dpr;
        canvas.height = size.height * dpr;
        ctx.scale(dpr, dpr);

        const render = () => {
          drawWave(ctx);
          phaseRef.current += 0.05; // 控制波动速度
          requestRef.current = requestAnimationFrame(render);
        };
        render();

        return () => {
          if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
          }
        };
      });
  }, [size, color, percentage]);

  const drawWave = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = size;
    const waveHeight = height * (1 - percentage / 100);
    const phase = phaseRef.current;

    ctx.clearRect(0, 0, width, height);

    // 绘制水波
    ctx.beginPath();
    ctx.moveTo(0, waveHeight);
    for (let x = 0; x <= width; x++) {
      const y = waveHeight + Math.sin((x / width * 4 * Math.PI) + phase) * 5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  return (
    <View className='wave-progress-square' style={{ width: `${size.width}px`, height: `${size.height}px` }}>
      <Canvas
        type='2d'
        id={canvasId}
        className='wave-canvas'
        style={{ width: `${size.width}px`, height: `${size.height}px` }}
      />
      <View className='content'>
        <Text className='title'>{title}</Text>
        <View className='value-container'>
          <Text className='value'>{value}</Text>
          <Text className='unit'>{unit}</Text>
        </View>
      </View>
    </View>
  );
};

export default WaveProgressSquare;