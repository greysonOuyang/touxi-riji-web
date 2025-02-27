import React, { useMemo, useEffect, useRef } from "react";
import { View, Text, Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils";
import "./BPStatistics.scss";

interface BPStatisticsProps {
  bpData: any[];
  viewMode: "day" | "week" | "month";
}

const BPStatistics: React.FC<BPStatisticsProps> = ({ bpData, viewMode }) => {
  const chartRef = useRef<any>(null);
  
  // 计算血压分布
  const distribution = useMemo(() => {
    if (!bpData || bpData.length === 0) {
      return {
        normal: 0,
        elevated: 0,
        hypertension1: 0,
        hypertension2: 0,
        hypertensionCrisis: 0,
        low: 0,
        total: 0,
      };
    }

    const dist = {
      normal: 0,
      elevated: 0,
      hypertension1: 0,
      hypertension2: 0,
      hypertensionCrisis: 0,
      low: 0,
      total: bpData.length,
    };

    bpData.forEach((item) => {
      const category = getBPCategory(item.systolic, item.diastolic);
      
      if (category === BP_CATEGORIES.NORMAL) {
        dist.normal++;
      } else if (category === BP_CATEGORIES.ELEVATED) {
        dist.elevated++;
      } else if (category === BP_CATEGORIES.HYPERTENSION_1) {
        dist.hypertension1++;
      } else if (category === BP_CATEGORIES.HYPERTENSION_2) {
        dist.hypertension2++;
      } else if (category === BP_CATEGORIES.HYPERTENSION_CRISIS) {
        dist.hypertensionCrisis++;
      } else if (category === BP_CATEGORIES.LOW) {
        dist.low++;
      }
    });

    return dist;
  }, [bpData]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (!bpData || bpData.length === 0) {
      return {
        avgSystolic: 0,
        avgDiastolic: 0,
        avgHeartRate: 0,
        maxSystolic: 0,
        minSystolic: 0,
        maxDiastolic: 0,
        minDiastolic: 0,
        abnormalCount: 0,
      };
    }

    let totalSystolic = 0;
    let totalDiastolic = 0;
    let totalHeartRate = 0;
    let heartRateCount = 0;
    let maxSystolic = bpData[0].systolic;
    let minSystolic = bpData[0].systolic;
    let maxDiastolic = bpData[0].diastolic;
    let minDiastolic = bpData[0].diastolic;
    let abnormalCount = 0;

    bpData.forEach((item) => {
      totalSystolic += item.systolic;
      totalDiastolic += item.diastolic;
      
      if (item.heartRate) {
        totalHeartRate += item.heartRate;
        heartRateCount++;
      }
      
      maxSystolic = Math.max(maxSystolic, item.systolic);
      minSystolic = Math.min(minSystolic, item.systolic);
      maxDiastolic = Math.max(maxDiastolic, item.diastolic);
      minDiastolic = Math.min(minDiastolic, item.diastolic);
      
      const category = getBPCategory(item.systolic, item.diastolic);
      if (
        category === BP_CATEGORIES.HYPERTENSION_1 ||
        category === BP_CATEGORIES.HYPERTENSION_2 ||
        category === BP_CATEGORIES.HYPERTENSION_CRISIS ||
        category === BP_CATEGORIES.LOW
      ) {
        abnormalCount++;
      }
    });

    return {
      avgSystolic: Math.round(totalSystolic / bpData.length),
      avgDiastolic: Math.round(totalDiastolic / bpData.length),
      avgHeartRate: heartRateCount > 0 ? Math.round(totalHeartRate / heartRateCount) : 0,
      maxSystolic,
      minSystolic,
      maxDiastolic,
      minDiastolic,
      abnormalCount,
    };
  }, [bpData]);

  // 初始化饼图
  useEffect(() => {
    if (!bpData || bpData.length === 0) return;
    
    const timer = setTimeout(() => {
      renderPieChart();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [distribution]);
  
  // 渲染饼图
  const renderPieChart = () => {
    try {
      const query = Taro.createSelectorQuery();
      query
        .select('#bpDistributionChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) {
            console.error('获取Canvas节点失败');
            return;
          }
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const width = res[0].width || 300;
          const height = res[0].height || 200;
          
          // 设置Canvas尺寸
          const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 1;
          canvas.width = width * pixelRatio;
          canvas.height = height * pixelRatio;
          
          // 设置canvas的样式尺寸
          canvas._width = width;
          canvas._height = height;
          
          // 缩放上下文以适应高DPI屏幕
          ctx.scale(pixelRatio, pixelRatio);
          
          // 清除之前的图表
          if (chartRef.current) {
            chartRef.current = null;
          }
          
          // 准备饼图数据
          const series = [];
          const pieData = [];
          
          if (distribution.normal > 0) {
            pieData.push({
              name: '正常',
              value: distribution.normal,
              color: BP_CATEGORIES.NORMAL.color
            });
          }
          
          if (distribution.elevated > 0) {
            pieData.push({
              name: '血压偏高',
              value: distribution.elevated,
              color: BP_CATEGORIES.ELEVATED.color
            });
          }
          
          if (distribution.hypertension1 > 0) {
            pieData.push({
              name: '高血压一级',
              value: distribution.hypertension1,
              color: BP_CATEGORIES.HYPERTENSION_1.color
            });
          }
          
          if (distribution.hypertension2 > 0) {
            pieData.push({
              name: '高血压二级',
              value: distribution.hypertension2,
              color: BP_CATEGORIES.HYPERTENSION_2.color
            });
          }
          
          if (distribution.hypertensionCrisis > 0) {
            pieData.push({
              name: '高血压危象',
              value: distribution.hypertensionCrisis,
              color: BP_CATEGORIES.HYPERTENSION_CRISIS.color
            });
          }
          
          if (distribution.low > 0) {
            pieData.push({
              name: '低血压',
              value: distribution.low,
              color: BP_CATEGORIES.LOW.color
            });
          }
          
          series.push({
            data: pieData
          });
          
          const config = {
            type: 'pie',
            canvasId: 'bpDistributionChart',
            canvas2d: true,
            context: ctx,
            width,
            height,
            series,
            animation: true,
            background: '#FFFFFF',
            padding: [5, 5, 5, 5],
            legend: {
              show: true,
              position: 'right',
              lineHeight: 15,
              fontSize: 11,
              fontColor: '#666666',
              padding: 10,
            },
            extra: {
              pie: {
                activeRadius: 10,
                offsetAngle: 0,
                labelWidth: 15,
                border: false,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                linearType: 'custom',
                customColor: pieData.map(item => item.color),
              },
              tooltip: {
                showBox: true,
                showArrow: true,
                borderWidth: 0,
                borderRadius: 4,
                borderColor: '#92A3FD',
                bgColor: '#FFFFFF',
                bgOpacity: 0.9,
                fontColor: '#333333',
                fontSize: 11,
              },
            },
          };
          
          chartRef.current = new UCharts(config);
        });
    } catch (error) {
      console.error('初始化饼图失败:', error);
    }
  };

  // 获取血压状态提醒
  const getBPStatusAlert = () => {
    if (!bpData || bpData.length === 0) {
      return null;
    }
    
    // 检查是否有高血压危象
    if (distribution.hypertensionCrisis > 0) {
      return {
        message: "检测到高血压危象，请立即就医",
        type: "warning",
      };
    }
    
    // 检查是否有高血压二级
    if (distribution.hypertension2 > 0) {
      return {
        message: "检测到高血压二级，建议咨询医生",
        type: "warning",
      };
    }
    
    // 检查是否有高血压一级
    if (distribution.hypertension1 > 0) {
      return {
        message: "检测到高血压一级，请注意监测",
        type: "notice",
      };
    }
    
    // 检查是否有低血压
    if (distribution.low > 0) {
      return {
        message: "检测到低血压值，请注意监测",
        type: "notice",
      };
    }
    
    return {
      message: "血压状况良好，请继续保持",
      type: "good",
    };
  };

  const alert = getBPStatusAlert();

  // 如果没有数据，显示空状态
  if (!bpData || bpData.length === 0) {
    return (
      <View className="bp-statistics">
        <View className="empty-state">
          <Text>暂无数据，无法生成统计信息</Text>
        </View>
      </View>
    );
  }

  // 渲染分布数据列表（作为饼图的补充）
  const renderDistributionList = () => {
    const items = [
      { label: "正常", value: distribution.normal, color: BP_CATEGORIES.NORMAL.color },
      { label: "血压偏高", value: distribution.elevated, color: BP_CATEGORIES.ELEVATED.color },
      { label: "高血压一级", value: distribution.hypertension1, color: BP_CATEGORIES.HYPERTENSION_1.color },
      { label: "高血压二级", value: distribution.hypertension2, color: BP_CATEGORIES.HYPERTENSION_2.color },
      { label: "高血压危象", value: distribution.hypertensionCrisis, color: BP_CATEGORIES.HYPERTENSION_CRISIS.color },
      { label: "低血压", value: distribution.low, color: BP_CATEGORIES.LOW.color }
    ].filter(item => item.value > 0);

    return (
      <View className="distribution-list">
        {items.map((item, index) => (
          <View key={index} className="distribution-item">
            <View className="distribution-color" style={{ backgroundColor: item.color }} />
            <Text className="distribution-label">{item.label}</Text>
            <Text className="distribution-value">{item.value}次</Text>
            <Text className="distribution-percent">
              {Math.round((item.value / distribution.total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="bp-statistics">
      <View className="statistics-header">
        <Text className="statistics-title">血压统计分析</Text>
        <Text className="statistics-subtitle">
          {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}血压概览
        </Text>
      </View>

      <View className="statistics-content">
        <View className="chart-section">
          <Text className="section-title">血压分布</Text>
          <Canvas
            type="2d"
            id="bpDistributionChart"
            canvas-id="bpDistributionChart"
            className="distribution-chart"
            style={{ width: '100%', height: '200px' }}
          />
          {renderDistributionList()}
        </View>

        <View className="stats-section">
          <Text className="section-title">血压统计</Text>
          <View className="stats-grid">
            <View className="stats-item">
              <Text className="stats-label">平均收缩压</Text>
              <Text className="stats-value">{stats.avgSystolic}</Text>
              <Text className="stats-unit">mmHg</Text>
            </View>
            <View className="stats-item">
              <Text className="stats-label">平均舒张压</Text>
              <Text className="stats-value">{stats.avgDiastolic}</Text>
              <Text className="stats-unit">mmHg</Text>
            </View>
            <View className="stats-item">
              <Text className="stats-label">平均心率</Text>
              <Text className="stats-value">{stats.avgHeartRate}</Text>
              <Text className="stats-unit">bpm</Text>
            </View>
            <View className="stats-item">
              <Text className="stats-label">收缩压范围</Text>
              <Text className="stats-value">{stats.minSystolic}-{stats.maxSystolic}</Text>
              <Text className="stats-unit">mmHg</Text>
            </View>
            <View className="stats-item">
              <Text className="stats-label">舒张压范围</Text>
              <Text className="stats-value">{stats.minDiastolic}-{stats.maxDiastolic}</Text>
              <Text className="stats-unit">mmHg</Text>
            </View>
            <View className="stats-item">
              <Text className="stats-label">异常次数</Text>
              <Text className="stats-value">{stats.abnormalCount}</Text>
              <Text className="stats-unit">次</Text>
            </View>
          </View>
        </View>
      </View>

      {alert && (
        <View className={`bp-alert ${alert.type}`}>
          <Text className="alert-message">{alert.message}</Text>
        </View>
      )}
    </View>
  );
};

export default BPStatistics; 