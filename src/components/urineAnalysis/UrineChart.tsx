import React, { useEffect, useRef, useMemo, useState } from "react";
import { View, Canvas, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import { UrineDataPoint } from "./useUrineData";
import "./index.scss";

interface UrineChartProps {
  urineData: UrineDataPoint[];
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
  onSwipe?: (direction: "left" | "right") => void;
}

const UrineChart: React.FC<UrineChartProps> = ({ 
  urineData, 
  viewMode, 
  isLoading = false,
  onSwipe 
}) => {
  const chartRef = useRef<any>(null);
  const canvasId = "urine-volume-chart";
  const [scrolling, setScrolling] = useState(false);
  const startX = useRef(0);
  
  // 处理数据，按日期分组
  const processChartData = () => {
    if (!urineData || urineData.length === 0) {
      console.log("尿量数据为空，无法生成图表数据");
      return { labels: [], values: [] };
    }
    
    console.log("处理图表数据，视图模式:", viewMode, "数据:", urineData);
    
    const dataMap = new Map<string, number>();
    const labels: string[] = [];
    const values: number[] = [];
    
    // 中文星期几名称
    const weekDayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    
    // 根据视图模式决定如何处理数据
    switch (viewMode) {
      case "day":
        // 日视图：显示每次记录的时间
        urineData.forEach(item => {
          try {
            // 确保recordTime存在
            if (!item.recordTime) {
              console.warn("记录缺少时间信息:", item);
              return;
            }
            
            // 使用recordTime作为标签
            dataMap.set(item.recordTime, item.volume);
          } catch (error) {
            console.error("处理日视图数据时出错:", error, item);
          }
        });
        
        // 按时间排序
        const timeEntries = Array.from(dataMap.entries()).sort((a, b) => {
          return a[0].localeCompare(b[0]);
        });
        
        // 提取标签和值
        timeEntries.forEach(entry => {
          labels.push(entry[0]); // 时间作为标签
          values.push(entry[1]);
        });
        break;
        
      case "week":
        // 周视图：按星期几分组
        const weekDayMap = new Map<number, {
          volumes: number[],
          count: number
        }>();
        
        urineData.forEach(item => {
          try {
            if (!item.date) {
              console.warn("记录缺少日期信息:", item);
              return;
            }
            
            // 从日期获取星期几（0-6，0表示周日）
            const date = new Date(item.date);
            const dayOfWeek = date.getDay();
            
            if (!weekDayMap.has(dayOfWeek)) {
              weekDayMap.set(dayOfWeek, {
                volumes: [],
                count: 0
              });
            }
            
            const dayData = weekDayMap.get(dayOfWeek)!;
            dayData.volumes.push(item.volume);
            dayData.count++;
          } catch (error) {
            console.error("处理周视图数据时出错:", error, item);
          }
        });
        
        // 按周几排序（周一到周日）
        const sortedDays = Array.from(weekDayMap.keys()).sort((a, b) => {
          // 自定义排序：周一(1)到周日(0)
          const orderA = a === 0 ? 7 : a; // 把周日(0)变成7，这样它就排在最后
          const orderB = b === 0 ? 7 : b;
          return orderA - orderB;
        });
        
        // 提取标签和值
        sortedDays.forEach(dayOfWeek => {
          const dayData = weekDayMap.get(dayOfWeek)!;
          // 使用中文星期几
          labels.push(weekDayNames[dayOfWeek]);
          
          // 计算总量
          const totalVolume = dayData.volumes.reduce((sum, val) => sum + val, 0);
          values.push(totalVolume);
        });
        break;
        
      case "month":
        // 月视图：按周分组
        const weekMap = new Map<number, {
          volumes: number[],
          count: number,
          weekNumber: number
        }>();
        
        urineData.forEach(item => {
          try {
            if (!item.date) {
              console.warn("记录缺少日期信息:", item);
              return;
            }
            
            // 从tag中提取周数，如果有的话
            let weekNumber: number;
            if (item.tag && item.tag.startsWith("第") && item.tag.endsWith("周")) {
              // 从"第X周"格式中提取数字
              weekNumber = parseInt(item.tag.replace(/[^0-9]/g, ""));
            } else {
              // 否则从日期计算周数
              const date = new Date(item.date);
              weekNumber = Math.ceil(date.getDate() / 7);
            }
            
            if (!weekMap.has(weekNumber)) {
              weekMap.set(weekNumber, {
                volumes: [],
                count: 0,
                weekNumber
              });
            }
            
            const weekData = weekMap.get(weekNumber)!;
            weekData.volumes.push(item.volume);
            weekData.count++;
          } catch (error) {
            console.error("处理月视图数据时出错:", error, item);
          }
        });
        
        // 按周排序
        const sortedWeeks = Array.from(weekMap.keys()).sort((a, b) => a - b);
        
        // 提取标签和值
        sortedWeeks.forEach(weekNumber => {
          const weekData = weekMap.get(weekNumber)!;
          labels.push(`第${weekNumber}周`);
          
          // 使用平均值
          const avgVolume = weekData.volumes.reduce((sum, val) => sum + val, 0) / weekData.count;
          values.push(Math.round(avgVolume));
        });
        break;
    }
    
    console.log("处理后的图表数据:", { labels, values });
    
    return { labels, values };
  };
  
  // 使用useMemo缓存处理后的数据
  const chartData = useMemo(() => processChartData(), [urineData, viewMode]);
  
  // 初始化图表
  const initChart = (canvas, width, height) => {
    if (!canvas) return null;
    
    const ctx = canvas.getContext("2d");
    const dpr = Taro.getSystemInfoSync().pixelRatio;
    
    // 设置canvas尺寸，考虑设备像素比
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    console.log(`Canvas尺寸: ${width}x${height}, DPR: ${dpr}`);
    
    const { labels, values } = chartData;
    
    if (labels.length === 0 || values.length === 0) {
      // 绘制空状态
      ctx.fillStyle = "#999";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Arial";
      ctx.fillText("暂无数据", width / 2, height / 2);
      return null;
    }
    
    // 获取屏幕信息
    const screenInfo = Taro.getSystemInfoSync();
    const screenWidth = screenInfo.windowWidth;
    const isSmallScreen = screenWidth < 375;
    
    // 优化图表边距，参考血压图表的实现
    const padding = {
      top: 20,
      right: 15,
      bottom: isSmallScreen ? 60 : 50,
      left: 50  // 固定左侧边距为50，与血压图表保持一致
    };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // 计算Y轴范围
    const maxValue = Math.max(...values);
    // 向上取整到最接近的100的倍数，并增加20%的空间
    const yMax = Math.ceil((maxValue * 1.2) / 100) * 100;
    const yMin = 0;  // 尿量最小值为0
    const yStep = yMax / 5;  // 5等分Y轴
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 1;
    
    // Y轴
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    
    // X轴
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // 绘制Y轴刻度和网格线
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#999";
    ctx.font = "12px Arial";
    
    // 添加Y轴单位
    ctx.save();
    ctx.translate(padding.left - 25, padding.top - 5);
    ctx.fillText("ml", padding.left - 25, padding.top - 5);
    ctx.restore();
    
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartHeight - (i * chartHeight / 5);
      const value = i * yStep;
      
      // 绘制网格线
      ctx.beginPath();
      ctx.strokeStyle = "#F0F0F0";
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // 绘制刻度值
      ctx.fillText(`${value}`, padding.left - 5, y);
    }
    
    // 计算X轴标签显示策略
    const maxLabels = Math.min(7, labels.length);  // 最多显示7个标签，与血压图表保持一致
    const skipFactor = Math.max(1, Math.ceil(labels.length / maxLabels));
    
    // 计算X轴每个点的间距
    // 确保第一个点不与Y轴重合
    const pointOffset = 10;  // 固定偏移量
    const availableWidth = chartWidth - pointOffset;
    const xStep = labels.length > 1 ? availableWidth / (labels.length - 1) : availableWidth;
    
    // 绘制X轴标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "12px Arial";
    ctx.fillStyle = "#999";
    
    labels.forEach((label, index) => {
      // 只显示部分标签，避免拥挤
      if (index % skipFactor === 0 || index === labels.length - 1) {
        // 计算x坐标，加上偏移量
        const x = padding.left + pointOffset + (index * xStep);
        ctx.fillText(label, x, height - padding.bottom + 10);
      }
    });
    
    // 绘制数据线
    ctx.beginPath();
    ctx.strokeStyle = "#1890FF";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    
    // 确保至少有一个数据点
    if (values.length > 0) {
      values.forEach((value, index) => {
        // 计算坐标
        const x = padding.left + pointOffset + (index * xStep);
        const y = padding.top + chartHeight - (value / yMax * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
    // 绘制数据点和值
    // 根据数据点数量动态调整显示的数值标签
    const valueLabelSkip = Math.max(1, Math.ceil(values.length / 5));  // 最多显示5个数值标签
    
    values.forEach((value, index) => {
      // 计算坐标
      const x = padding.left + pointOffset + (index * xStep);
      const y = padding.top + chartHeight - (value / yMax * chartHeight);
      
      // 绘制点
      ctx.beginPath();
      ctx.fillStyle = "#1890FF";
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制白色边框
      ctx.beginPath();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // 只在部分点上显示数值
      if (index % valueLabelSkip === 0 || index === values.length - 1) {
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "12px Arial";
        ctx.fillText(`${value}`, x, y - 8);
      }
    });
    
    return null;
  };
  
  // 触摸事件处理函数，参考血压图表实现
  const handleTouchStart = (e) => {
    // 记录初始触摸位置
    startX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    // 设置正在滚动标志
    setScrolling(true);
  };
  
  const handleTouchEnd = (e) => {
    // 如果不是滚动状态，检查是否需要触发翻页
    if (!scrolling && onSwipe) {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX.current;
      
      // 判断是否为快速滑动（翻页）
      if (Math.abs(diffX) > 100) {
        if (diffX > 0) {
          onSwipe("right");
        } else {
          onSwipe("left");
        }
      }
    }
    
    // 延迟重置滚动标志
    setTimeout(() => {
      setScrolling(false);
    }, 300);
  };
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (!isLoading && chartData.labels.length > 0) {
        const query = Taro.createSelectorQuery();
        query.select(`#${canvasId}`)
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res && res[0]) {
              const canvas = res[0].node;
              const ctx = canvas.getContext('2d');
              
              // 清空画布
              ctx.clearRect(0, 0, res[0].width, res[0].height);
              
              // 重新初始化图表
              initChart(canvas, res[0].width, res[0].height);
            }
          });
      }
    };
    
    Taro.onWindowResize(handleResize);
    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, [chartData, isLoading]);
  
  // 组件挂载或数据变化时初始化图表
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      const query = Taro.createSelectorQuery();
      query.select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            // 清空画布
            ctx.clearRect(0, 0, res[0].width, res[0].height);
            
            // 初始化图表
            chartRef.current = initChart(canvas, res[0].width, res[0].height);
          } else {
            console.error("无法获取Canvas节点");
          }
        });
    }, 300); // 增加延迟，确保DOM已完全更新
    
    return () => clearTimeout(timer);
  }, [chartData, isLoading]);
  
  return (
    <View className="urine-chart">
      <Canvas
        type="2d"
        id={canvasId}
        canvasId={canvasId}
        className="chart-canvas"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {isLoading && (
        <View className="loading-overlay">
          <View className="loading-spinner" />
          <View className="loading-text">加载中...</View>
        </View>
      )}
      {!isLoading && chartData.labels.length === 0 && (
        <View className="empty-overlay">
          <Text className="empty-text">暂无数据</Text>
        </View>
      )}
    </View>
  );
};

export default UrineChart; 