import React, { useMemo, useEffect, useRef } from "react";
import { View, Text, Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import UCharts from "@qiun/ucharts";
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils";
import { BpTrendData, BpTrendMetadata } from "@/api/bloodPressureApi";
import "./BPStatistics.scss";

interface BPStatisticsProps {
  bpData: BpTrendData[];
  metadata: BpTrendMetadata | null;
  viewMode: "day" | "week" | "month";
}

const BPStatistics: React.FC<BPStatisticsProps> = ({ bpData, metadata, viewMode }) => {
  const pieChartRef = useRef<any>(null);
  const canvasId = "bp-distribution-chart";
  
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

  // 计算统计数据 - 优先使用元数据，如果没有则计算
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
        dataCoverage: 0,
        totalMeasurements: 0
      };
    }
    
    // 筛选有效数据
    const validData = bpData.filter(item => item.hasMeasurement);
    
    if (validData.length === 0) {
      return {
        avgSystolic: 0,
        avgDiastolic: 0,
        avgHeartRate: 0,
        maxSystolic: 0,
        minSystolic: 0,
        maxDiastolic: 0,
        minDiastolic: 0,
        abnormalCount: 0,
        dataCoverage: 0,
        totalMeasurements: 0
      };
    }
    
    // 如果有元数据，优先使用
    if (metadata) {
      return {
        avgSystolic: Math.round(metadata.avgSystolic),
        avgDiastolic: Math.round(metadata.avgDiastolic),
        avgHeartRate: Math.round(metadata.avgHeartRate),
        maxSystolic: Math.max(...validData.map(item => item.maxSystolic || item.systolic)),
        minSystolic: Math.min(...validData.map(item => item.minSystolic || item.systolic)),
        maxDiastolic: Math.max(...validData.map(item => item.maxDiastolic || item.diastolic)),
        minDiastolic: Math.min(...validData.map(item => item.minDiastolic || item.diastolic)),
        abnormalCount: validData.filter(item => {
          const category = getBPCategory(item.systolic, item.diastolic);
          return (
            category === BP_CATEGORIES.HYPERTENSION_1 ||
            category === BP_CATEGORIES.HYPERTENSION_2 ||
            category === BP_CATEGORIES.HYPERTENSION_CRISIS ||
            category === BP_CATEGORIES.LOW
          );
        }).length,
        dataCoverage: metadata.dataCoverage,
        totalMeasurements: validData.reduce((sum, item) => sum + (item.measureCount || 1), 0)
      };
    }
    
    // 否则前端计算
    let totalSystolic = 0;
    let totalDiastolic = 0;
    let totalHeartRate = 0;
    let heartRateCount = 0;
    let maxSystolic = validData[0].systolic;
    let minSystolic = validData[0].systolic;
    let maxDiastolic = validData[0].diastolic;
    let minDiastolic = validData[0].diastolic;
    let abnormalCount = 0;
    let totalMeasurements = 0;
    
    validData.forEach(item => {
      // 基本统计
      totalSystolic += item.systolic;
      totalDiastolic += item.diastolic;
      
      if (item.heartRate) {
        totalHeartRate += item.heartRate;
        heartRateCount++;
      }
      
      // 极值统计
      maxSystolic = Math.max(maxSystolic, item.maxSystolic || item.systolic);
      minSystolic = Math.min(minSystolic, item.minSystolic || item.systolic);
      maxDiastolic = Math.max(maxDiastolic, item.maxDiastolic || item.diastolic);
      minDiastolic = Math.min(minDiastolic, item.minDiastolic || item.diastolic);
      
      // 测量次数
      totalMeasurements += item.measureCount || 1;
      
      // 异常统计
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
    
    // 计算数据覆盖率
    const dataCoverage = viewMode === 'week' 
      ? validData.length / 7 
      : validData.length / (viewMode === 'month' ? 4 : 1);
    
    return {
      avgSystolic: Math.round(totalSystolic / validData.length),
      avgDiastolic: Math.round(totalDiastolic / validData.length),
      avgHeartRate: heartRateCount > 0 ? Math.round(totalHeartRate / heartRateCount) : 0,
      maxSystolic,
      minSystolic,
      maxDiastolic,
      minDiastolic,
      abnormalCount,
      dataCoverage,
      totalMeasurements
    };
  }, [bpData, metadata, viewMode]);

  // 初始化饼图
  useEffect(() => {
    if (!bpData || bpData.length === 0) return;
    
    const query = Taro.createSelectorQuery();
    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const { width, height } = res[0];
          const canvas = res[0].node;
          
          // 获取设备像素比
          const pixelRatio = Taro.getSystemInfoSync().pixelRatio || 2;
          
          // 设置更高的分辨率
          canvas.width = width * pixelRatio;
          canvas.height = height * pixelRatio;
          
          const ctx = canvas.getContext('2d');
          // 缩放绘图上下文，使图形保持正确大小
          ctx.scale(pixelRatio, pixelRatio);
          
          // 启用抗锯齿
          if (ctx.imageSmoothingEnabled !== undefined) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }
          
          // 初始化图表时传入正确的宽高
          initPieChart(canvas, width, height);
        } else {
          console.error("获取Canvas节点失败");
        }
      });
  }, [bpData, distribution]);

  // 初始化饼图 - 优化渲染质量
  const initPieChart = (canvas, width, height) => {
    const ctx = canvas.getContext("2d");
    
    // 确保宽高相等，使用较小的一边作为尺寸
    const size = Math.min(width, height);
    
    // 准备饼图数据
    const series = [];
    const pieData: { name: string; value: number; color: string }[] = [];
    
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
    
    pieChartRef.current = new UCharts({
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
            return series.name + '\n' + val.toFixed(0) + '%';
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
    
    return pieChartRef.current;
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
          <View className="chart-container">
            <Canvas
              type="2d"
              id={canvasId}
              canvasId={canvasId}
              className="distribution-chart"
              style={{ width: '100%', height: '100%' }}
            />
          </View>
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
          
          {/* 数据可靠性指示 */}
          {stats.dataCoverage < 0.7 && (
            <View className="data-reliability">
              <Text className="reliability-text">
                数据覆盖: {Math.round(stats.dataCoverage * 100)}% 
                {stats.dataCoverage < 0.5 ? " (数据较少，统计结果仅供参考)" : " (部分日期无数据)"}
              </Text>
            </View>
          )}
          
          {/* 测量次数指示 */}
          <View className="measurement-count">
            <Text className="count-text">
              共{stats.totalMeasurements}次测量
            </Text>
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