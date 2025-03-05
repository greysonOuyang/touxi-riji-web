import React, { useMemo, useEffect, useRef } from "react";
import { View, Text, Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { UrineDataPoint, UrineMetadata, NORMAL_VOLUME_RANGE, TIME_PERIODS } from "./useUrineData";
import "./index.scss";

interface UrineStatisticsProps {
  urineData: UrineDataPoint[];
  metadata: UrineMetadata | null;
  viewMode: "day" | "week" | "month";
  isLoading?: boolean;
}

const UrineStatistics: React.FC<UrineStatisticsProps> = ({
  urineData,
  metadata,
  viewMode,
  isLoading = false
}) => {
  // 添加调试日志
  useEffect(() => {
    if (metadata) {
      console.log('UrineStatistics接收到metadata:', {
        hasTimeDistribution: !!metadata.timeDistribution,
        timeDistributionType: metadata.timeDistribution ? 
          `${Array.isArray(metadata.timeDistribution) ? 'Array' : typeof metadata.timeDistribution}` : 
          'undefined',
        timeDistributionLength: Array.isArray(metadata.timeDistribution) ? 
          metadata.timeDistribution.length : 
          'not an array'
      });
    }
  }, [metadata]);

  // 饼图引用
  const frequencyPieChartRef = useRef<any>(null);
  const volumePieChartRef = useRef<any>(null);
  const frequencyCanvasId = "urine-frequency-chart";
  const volumeCanvasId = "urine-volume-chart";

  // 获取尿量状态提醒
  const getUrineVolumeAlert = (dailyVolume: number) => {
    if (dailyVolume < NORMAL_VOLUME_RANGE.MIN) {
      return {
        message: "尿量偏少，请注意多喝水",
        type: "warning"
      };
    } else if (dailyVolume > NORMAL_VOLUME_RANGE.MAX) {
      return {
        message: "尿量偏多，请注意观察",
        type: "notice"
      };
    }
    return null;
  };
  
  // 获取趋势描述
  const getTrendDescription = (trend: string, percentage?: number) => {
    const percentText = percentage ? `${Math.abs(percentage)}%` : "";
    
    if (trend === "up") {
      return `较前期上升 ${percentText}`;
    } else if (trend === "down") {
      return `较前期下降 ${percentText}`;
    } else {
      return "趋势稳定";
    }
  };
  
  // 初始化尿频饼图
  const initFrequencyPieChart = (canvas, width, height) => {
    if (!canvas || !metadata || !metadata.timeDistribution) return null;
    
    const ctx = canvas.getContext("2d");
    
    // 确保宽高相等，使用较小的一边作为尺寸
    const size = Math.min(width, height);
    
    // 准备饼图数据 - 只包含次数大于0的时间段
    const series = [];
    const pieData = metadata.timeDistribution
      .filter(item => item.count > 0) // 过滤掉次数为0的数据
      .map(item => {
        const periodInfo = Object.values(TIME_PERIODS).find(p => p.name === item.period);
        return {
          name: item.period,
          value: item.count,
          color: periodInfo ? periodInfo.color : "#9E9E9E"
        };
      });
    
    if (pieData.length === 0) {
      // 如果没有数据，绘制空状态
      ctx.fillStyle = "#999";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Arial";
      ctx.fillText("暂无数据", width / 2, height / 2);
      return null;
    }
    
    series.push({
      data: pieData
    });
    
    frequencyPieChartRef.current = new UCharts({
      type: "pie",
      context: ctx,
      width: size,
      height: size,
      series: series,
      background: "#FFFFFF",
      padding: [15, 15, 15, 15],
      legend: {
        show: false,  // 不使用内置图例，使用自定义图例
      },
      animation: true,
      dataLabel: true,
      extra: {
        pie: {
          activeRadius: 10,
          offsetAngle: 0,
          labelWidth: 15,
          border: true,
          borderWidth: 3,
          borderColor: "#FFFFFF",
          linearType: 'custom',
          customColor: [], // 使用series中定义的颜色
          ringWidth: 0,
          centerColor: "#FFFFFF",
          radius: 80,
          pieChartLinePadding: 5,
          activeOpacity: 1,
          borderOpacity: 1,
          labelAlign: 'center',
          labelFontSize: 11,
          labelFontColor: '#666666',
          format: (val, series, opts) => {
            return series.name + '\n' + val.toFixed(0) + '次';
          }
        },
        tooltip: {
          showBox: true,
          showArrow: true,
          borderWidth: 0,
          borderRadius: 4,
          borderColor: '#000000',
          backgroundColor: 'rgba(0,0,0,0.7)',
          fontColor: '#FFFFFF',
          fontSize: 13
        }
      }
    });
    
    return frequencyPieChartRef.current;
  };
  
  // 初始化尿量饼图
  const initVolumePieChart = (canvas, width, height) => {
    if (!canvas || !metadata || !metadata.timeDistribution) return null;
    
    const ctx = canvas.getContext("2d");
    
    // 确保宽高相等，使用较小的一边作为尺寸
    const size = Math.min(width, height);
    
    // 准备饼图数据 - 只包含次数大于0的时间段
    const series = [];
    const pieData = metadata.timeDistribution
      .filter(item => item.count > 0) // 过滤掉次数为0的数据
      .map(item => {
        const periodInfo = Object.values(TIME_PERIODS).find(p => p.name === item.period);
        return {
          name: item.period,
          value: item.totalVolume,
          color: periodInfo ? periodInfo.color : "#9E9E9E"
        };
      });
    
    if (pieData.length === 0) {
      // 如果没有数据，绘制空状态
      ctx.fillStyle = "#999";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "14px Arial";
      ctx.fillText("暂无数据", width / 2, height / 2);
      return null;
    }
    
    series.push({
      data: pieData
    });
    
    volumePieChartRef.current = new UCharts({
      type: "pie",
      context: ctx,
      width: size,
      height: size,
      series: series,
      background: "#FFFFFF",
      padding: [15, 15, 15, 15],
      legend: {
        show: false,  // 不使用内置图例，使用自定义图例
      },
      animation: true,
      dataLabel: true,
      extra: {
        pie: {
          activeRadius: 10,
          offsetAngle: 0,
          labelWidth: 15,
          border: true,
          borderWidth: 3,
          borderColor: "#FFFFFF",
          linearType: 'custom',
          customColor: [], // 使用series中定义的颜色
          ringWidth: 0,
          centerColor: "#FFFFFF",
          radius: 80,
          pieChartLinePadding: 5,
          activeOpacity: 1,
          borderOpacity: 1,
          labelAlign: 'center',
          labelFontSize: 11,
          labelFontColor: '#666666',
          format: (val, series, opts) => {
            return series.name + '\n' + val.toFixed(0) + 'ml';
          }
        },
        tooltip: {
          showBox: true,
          showArrow: true,
          borderWidth: 0,
          borderRadius: 4,
          borderColor: '#000000',
          backgroundColor: 'rgba(0,0,0,0.7)',
          fontColor: '#FFFFFF',
          fontSize: 13
        }
      }
    });
    
    return volumePieChartRef.current;
  };
  
  // 渲染时间分布图例
  const renderTimeDistributionLegend = () => {
    if (!metadata || !metadata.timeDistribution) {
      return <Text className="no-data">暂无时间分布数据</Text>;
    }
    
    // 确保timeDistribution是数组
    if (!Array.isArray(metadata.timeDistribution)) {
      console.error('timeDistribution不是数组:', metadata.timeDistribution);
      return <Text className="no-data">时间分布数据格式错误</Text>;
    }
    
    // 过滤掉次数为0的数据
    const validDistribution = metadata.timeDistribution.filter(item => item.count > 0);
    
    if (validDistribution.length === 0) {
      return <Text className="no-data">暂无时间分布数据</Text>;
    }
    
    return (
      <View className="time-distribution-legend">
        {validDistribution.map((item, index) => {
          const periodInfo = Object.values(TIME_PERIODS).find(p => p.name === item.period);
          const bgColor = periodInfo ? periodInfo.color : "#9E9E9E";
          
          return (
            <View className="legend-item" key={index}>
              <View 
                className="legend-color" 
                style={{ backgroundColor: bgColor }}
              />
              <View className="legend-info">
                <Text className="legend-name">{item.period}</Text>
                <Text className="legend-value">{item.count}次 / {item.totalVolume}ml</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  // 如果没有数据，显示空状态
  if (!urineData || urineData.length === 0 || !metadata) {
    return (
      <View className="urine-statistics">
        <View className="empty-state">
          <Text>暂无数据，无法生成统计信息</Text>
        </View>
      </View>
    );
  }
  
  const alert = getUrineVolumeAlert(metadata.dailyAverage);
  const trendDescription = getTrendDescription(metadata.trend, metadata.trendPercentage);
  
  return (
    <View className="urine-statistics">
      {/* 卡片1: 尿量状态概览 */}
      <View className="statistics-card">
        <View className="card-header">
          <Text className="card-title">尿量统计分析</Text>
          <Text className="card-subtitle">
            {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}尿量概览
          </Text>
        </View>
        
        {alert && (
          <View className={`urine-alert ${alert.type}`}>
            <Text className="alert-message">{alert.message}</Text>
          </View>
        )}
        
        {/* 测量次数和数据可靠性 */}
        <View className="data-meta">
          <Text className="count-text">共{metadata.recordCount}次记录</Text>
          {metadata.dataCoverage < 0.7 && viewMode !== "day" && (
            <Text className="reliability-text">
              数据覆盖: {Math.round(metadata.dataCoverage * 100)}% 
              {metadata.dataCoverage < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
        
        {/* 趋势信息 */}
        {viewMode !== "day" && (
          <View className={`trend-info ${metadata.trend}`}>
            <Text className="trend-text">{trendDescription}</Text>
          </View>
        )}
      </View>

      {/* 卡片2: 尿量统计数据 */}
      <View className="statistics-card">
        <Text className="card-title">尿量统计</Text>
        <View className="statistics-grid">
          <View className="statistics-item">
            <Text className="item-value">{metadata.dailyAverage}</Text>
            <Text className="item-label">日均尿量(ml)</Text>
          </View>
          {viewMode !== "day" && metadata.weeklyAverage && (
            <View className="statistics-item">
              <Text className="item-value">{metadata.weeklyAverage}</Text>
              <Text className="item-label">周均尿量(ml)</Text>
            </View>
          )}
          {viewMode === "month" && metadata.monthlyAverage && (
            <View className="statistics-item">
              <Text className="item-value">{metadata.monthlyAverage}</Text>
              <Text className="item-label">月均尿量(ml)</Text>
            </View>
          )}
          <View className="statistics-item">
            <Text className="item-value">{metadata.totalVolume}</Text>
            <Text className="item-label">总尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.averageVolume}</Text>
            <Text className="item-label">平均单次(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.maxVolume}</Text>
            <Text className="item-label">最大尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.minVolume}</Text>
            <Text className="item-label">最小尿量(ml)</Text>
          </View>
          <View className="statistics-item">
            <Text className="item-value">{metadata.abnormalCount}</Text>
            <Text className="item-label">异常次数</Text>
          </View>
        </View>
      </View>
      
      {/* 卡片3: 时间分布 */}
      <View className="statistics-card">
        <Text className="card-title">排尿时间分布</Text>
        <View className="pie-charts-container">
          <View className="pie-chart-wrapper">
            <Text className="chart-subtitle">排尿频次分布</Text>
            <View className="chart-container">
              <Canvas
                type="2d"
                id={frequencyCanvasId}
                canvasId={frequencyCanvasId}
                className="distribution-chart"
                style={{ width: '100%', height: '200px' }}
                onReady={initFrequencyPieChart}
              />
            </View>
          </View>
          <View className="pie-chart-wrapper">
            <Text className="chart-subtitle">排尿量分布</Text>
            <View className="chart-container">
              <Canvas
                type="2d"
                id={volumeCanvasId}
                canvasId={volumeCanvasId}
                className="distribution-chart"
                style={{ width: '100%', height: '200px' }}
                onReady={initVolumePieChart}
              />
            </View>
          </View>
        </View>
        {renderTimeDistributionLegend()}
      </View>
    </View>
  );
};

export default UrineStatistics; 