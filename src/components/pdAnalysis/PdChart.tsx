import React, { useEffect, useRef, useState } from "react";
import { View, Text, Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { format, parseISO } from "date-fns";
import { PdDataPoint } from "./usePdData";
import "./PdChart.scss";

// 引入图表库
import UCharts from "@qiun/ucharts";

interface PdChartProps {
  viewMode: "day" | "week" | "month";
  pdData: PdDataPoint[];
  isLoading?: boolean;
}

const PdChart: React.FC<PdChartProps> = ({
  viewMode,
  pdData,
  isLoading = false
}) => {
  const chartRef = useRef<any>(null);

  const canvasId = "pd-chart";
  const chartType = "line"; // 固定为折线图
  const [dataView, setDataView] = useState<"ultrafiltration" | "drainage">("ultrafiltration");
  
  // 切换数据视图
  const toggleDataView = () => {
    setDataView(prev => prev === "ultrafiltration" ? "drainage" : "ultrafiltration");
  };
  
  // 初始化图表
  const initChart = () => {
    try {
      Taro.createSelectorQuery()
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            const canvas = res[0].node;
            const ctx = canvas.getContext("2d");
            const width = res[0].width;
            const height = res[0].height;
            
            if (!canvas || !ctx) {
              console.error("Canvas节点不存在或无法获取上下文");
              return null;
            }
            
            const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;
            
            // 设置Canvas尺寸
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            ctx.scale(pixelRatio, pixelRatio);
            
            // 准备数据
            const categories: string[] = [];
            const ultrafiltrationData: number[] = [];
            const drainageData: number[] = [];
            
            // 根据视图模式处理数据
            if (viewMode === "day") {
              // 日视图：按时间排序
              const sortedData = [...pdData].sort((a, b) => {
                // 确保使用完整的时间戳进行排序
                const timeA = a.timestamp ? new Date(a.timestamp).getTime() : new Date(`${a.date}T${a.recordTime}`).getTime();
                const timeB = b.timestamp ? new Date(b.timestamp).getTime() : new Date(`${b.date}T${b.recordTime}`).getTime();
                return timeA - timeB;
              });
              
              sortedData.forEach(item => {
                // 只提取时间部分 HH:mm
                const timeStr = item.recordTime;
                categories.push(timeStr);
                ultrafiltrationData.push(item.ultrafiltration);
                drainageData.push(item.drainageVolume);
              });
            } else if (viewMode === "week") {
              // 周视图：按日期分组
              const dateMap = new Map<string, {
                ultrafiltration: number[],
                drainage: number[],
                count: number
              }>();
              
              pdData.forEach(item => {
                // 提取日期部分 MM-DD
                const dateStr = item.date.substring(5); // 获取MM-DD部分
                if (!dateMap.has(dateStr)) {
                  dateMap.set(dateStr, {
                    ultrafiltration: [],
                    drainage: [],
                    count: 0
                  });
                }
                
                const dateData = dateMap.get(dateStr)!;
                dateData.ultrafiltration.push(item.ultrafiltration);
                dateData.drainage.push(item.drainageVolume);
                dateData.count++;
              });
              
              // 按日期排序
              const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
                // 正确排序MM-DD格式的日期
                const [monthA, dayA] = a.split('-').map(Number);
                const [monthB, dayB] = b.split('-').map(Number);
                if (monthA !== monthB) return monthA - monthB;
                return dayA - dayB;
              });
              
              sortedDates.forEach(dateStr => {
                const dateData = dateMap.get(dateStr)!;
                categories.push(dateStr.replace("-", "/"));
                
                // 计算平均值
                const avgUltrafiltration = dateData.ultrafiltration.reduce((sum, val) => sum + val, 0) / dateData.count;
                const avgDrainage = dateData.drainage.reduce((sum, val) => sum + val, 0) / dateData.count;
                
                ultrafiltrationData.push(Math.round(avgUltrafiltration));
                drainageData.push(Math.round(avgDrainage));
              });
            } else if (viewMode === "month") {
              // 月视图：按周分组
              const weekMap = new Map<string, {
                ultrafiltration: number[],
                drainage: number[],
                count: number,
                weekNumber: number
              }>();
              
              pdData.forEach(item => {
                // 从日期中提取日期
                const date = new Date(item.date);
                // 获取日期所在的周
                const weekNumber = Math.ceil(date.getDate() / 7);
                const weekKey = `第${weekNumber}周`;
                
                if (!weekMap.has(weekKey)) {
                  weekMap.set(weekKey, {
                    ultrafiltration: [],
                    drainage: [],
                    count: 0,
                    weekNumber
                  });
                }
                
                const weekData = weekMap.get(weekKey)!;
                weekData.ultrafiltration.push(item.ultrafiltration);
                weekData.drainage.push(item.drainageVolume);
                weekData.count++;
              });
              
              // 按周排序
              const sortedWeeks = Array.from(weekMap.entries())
                .sort((a, b) => a[1].weekNumber - b[1].weekNumber)
                .map(entry => entry[0]);
              
              sortedWeeks.forEach(weekKey => {
                const weekData = weekMap.get(weekKey)!;
                categories.push(weekKey);
                
                // 计算平均值
                const avgUltrafiltration = weekData.ultrafiltration.reduce((sum, val) => sum + val, 0) / weekData.count;
                const avgDrainage = weekData.drainage.reduce((sum, val) => sum + val, 0) / weekData.count;
                
                ultrafiltrationData.push(Math.round(avgUltrafiltration));
                drainageData.push(Math.round(avgDrainage));
              });
            }
            
            // 创建图表配置
            const chartConfig: any = {
              type: chartType,
              canvasId,
              canvas2d: true,
              context: ctx,
              width,
              height,
              categories,
              animation: true,
              timing: "easeOut",
              duration: 500,
              dataLabel: true, // 显示数值
              dataPointShape: true,
              enableScroll: false,
              legend: {
                show: false
              },
              xAxis: {
                disableGrid: true,
                scrollShow: false,
                itemCount: 5,
                fontSize: 10,
                color: "#666666"
              },
              extra: {
                line: {
                  type: "straight",
                  width: 2,
                  activeType: "hollow",
                  linearType: "none",
                  onShadow: false,
                  animation: "vertical"
                },
                tooltip: {
                  showBox: true,
                  showArrow: true,
                  showCategory: true,
                  borderWidth: 0,
                  borderRadius: 4,
                  borderColor: "#000000",
                  borderOpacity: 0.7,
                  bgColor: "#000000",
                  bgOpacity: 0.7,
                  gridType: "dash",
                  dashLength: 4,
                  gridColor: "#CCCCCC",
                  fontColor: "#FFFFFF",
                  horizentalLine: false,
                  xAxisLabel: true,
                  yAxisLabel: false,
                  labelBgColor: "#FFFFFF",
                  labelBgOpacity: 0.7,
                  labelFontColor: "#666666"
                }
              }
            };
            
            // 根据数据视图类型设置不同的系列和Y轴
            if (dataView === "ultrafiltration") {
              // 超滤量视图
              chartConfig.series = [
                {
                  name: "超滤量",
                  data: ultrafiltrationData,
                  color: "#92A3FD",
                  format: (val) => `${val}mL`
                }
              ];
              
              const minUF = Math.min(...ultrafiltrationData);
              const maxUF = Math.max(...ultrafiltrationData);
              const range = Math.max(Math.abs(minUF), Math.abs(maxUF)) * 1.2;
              
              // 如果有负值，则Y轴从负值开始
              const minValue = minUF < 0 ? -range : 0;
              const maxValue = Math.max(range, 500); // 确保有足够的显示空间
              
              chartConfig.yAxis = {
                gridType: "dash",
                dashLength: 4,
                data: [
                  {
                    min: minValue,
                    max: maxValue,
                    format: (val) => `${val}mL`
                  }
                ]
              };
            } else {
              // 引流量视图
              chartConfig.series = [
                {
                  name: "引流量",
                  data: drainageData,
                  color: "#C58BF2",
                  format: (val) => `${val}mL`
                }
              ];
              
              // 计算Y轴范围 - 引流量
              const maxValue = Math.max(...drainageData) * 1.2 || 3000;
              chartConfig.yAxis = {
                gridType: "dash",
                dashLength: 4,
                data: [
                  {
                    min: 0,
                    max: maxValue,
                    format: (val) => `${val}mL`
                  }
                ]
              };
            }
            
            // 创建图表实例
            chartRef.current = new UCharts(chartConfig);
          } else {
            console.error("获取Canvas节点失败");
          }
        });
    } catch (error) {
      console.error("图表初始化失败:", error);
    }
  };
  
  // 处理窗口大小变化
  const handleResize = () => {
    if (chartRef.current) {
      chartRef.current.resize();
    }
  };
  
  // 初始化图表
  useEffect(() => {
    if (!isLoading && pdData && pdData.length > 0) {
      // 清除旧图表实例
      if (chartRef.current) {
        chartRef.current = null;
      }
      
      // 初始化新图表
      setTimeout(() => {
        initChart();
      }, 100);
    }
    
    // 监听窗口大小变化
    Taro.onWindowResize(handleResize);
    
    return () => {
      Taro.offWindowResize(handleResize);
    };
  }, [pdData, viewMode, dataView, isLoading]);
  
  if (isLoading) {
    return (
      <View className="pd-chart loading">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }
  
  if (!pdData || pdData.length === 0) {
    return (
      <View className="pd-chart empty">
        <Text className="empty-text">暂无数据</Text>
        <Text className="empty-hint">请先记录腹透数据</Text>
      </View>
    );
  }
  
  return (
    <View className="pd-chart">
      <View className="chart-header">
        <Text className="chart-title">
          {dataView === "ultrafiltration" ? "超滤量趋势" : "引流量趋势"}
        </Text>
        <View className="view-toggle" onClick={toggleDataView}>
          <Text>查看{dataView === "ultrafiltration" ? "引流量" : "超滤量"}</Text>
        </View>
      </View>
      
      <View className="chart-unit">
        <Text>单位: mL</Text>
      </View>
      
      <View className="chart-canvas">
        <Canvas
          type="2d"
          id={canvasId}
          canvasId={canvasId}
        />
      </View>
    </View>
  );
};

export default PdChart;