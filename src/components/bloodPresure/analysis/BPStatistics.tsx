import React, { useMemo } from "react";
import { View, Text } from "@tarojs/components";
import { PieChart } from '@/components/common/charts';
import { getBPCategory, BP_CATEGORIES } from "@/utils/bloodPressureUtils";
import { BpTrendData, BpTrendMetadata } from "@/api/bloodPressureApi";
import "./BPStatistics.scss";

interface BPStatisticsProps {
  bpData: BpTrendData[];
  metadata: BpTrendMetadata | null;
  viewMode: "day" | "week" | "month";
}

const BPStatistics: React.FC<BPStatisticsProps> = ({ bpData, metadata, viewMode }) => {
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
        dataCoverage: 0,
        totalMeasurements: 0
      };
    }
    
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
      totalSystolic += item.systolic;
      totalDiastolic += item.diastolic;
      
      if (item.heartRate) {
        totalHeartRate += item.heartRate;
        heartRateCount++;
      }
      
      maxSystolic = Math.max(maxSystolic, item.maxSystolic || item.systolic);
      minSystolic = Math.min(minSystolic, item.minSystolic || item.systolic);
      maxDiastolic = Math.max(maxDiastolic, item.maxDiastolic || item.diastolic);
      minDiastolic = Math.min(minDiastolic, item.minDiastolic || item.diastolic);
      
      totalMeasurements += item.measureCount || 1;
      
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

  // 获取血压状态提醒
  const getBPStatusAlert = () => {
    if (!bpData || bpData.length === 0) {
      return null;
    }
    
    if (distribution.hypertensionCrisis > 0) {
      return {
        message: "检测到高血压危象，请立即就医",
        type: "warning",
      };
    }
    
    if (distribution.hypertension2 > 0) {
      return {
        message: "检测到高血压二级，建议咨询医生",
        type: "warning",
      };
    }
    
    if (distribution.hypertension1 > 0) {
      return {
        message: "检测到高血压一级，请注意监测",
        type: "notice",
      };
    }
    
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

  // 准备饼图数据
  const pieData = [
    { name: '正常', value: distribution.normal, color: BP_CATEGORIES.NORMAL.color },
    { name: '血压偏高', value: distribution.elevated, color: BP_CATEGORIES.ELEVATED.color },
    { name: '高血压一级', value: distribution.hypertension1, color: BP_CATEGORIES.HYPERTENSION_1.color },
    { name: '高血压二级', value: distribution.hypertension2, color: BP_CATEGORIES.HYPERTENSION_2.color },
    { name: '高血压危象', value: distribution.hypertensionCrisis, color: BP_CATEGORIES.HYPERTENSION_CRISIS.color },
    { name: '低血压', value: distribution.low, color: BP_CATEGORIES.LOW.color }
  ].filter(item => item.value > 0);

  const getPieChartConfig = () => {
    return {
      legend: {
        show: false
      },
      extra: {
        pie: {
          activeRadius: 10,
          offsetAngle: 0,
          labelWidth: 15,
          border: true,
          borderWidth: 3,
          borderColor: "#FFFFFF",
          linearType: 'custom',
          customColor: pieData.map(item => item.color),
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
    };
  };

  return (
    <View className="bp-statistics">
      {/* 卡片1: 血压状态概览 */}
      <View className="bp-card status-card">
        <View className="card-header">
          <Text className="card-title">血压统计分析</Text>
          <Text className="card-subtitle">
            {viewMode === "day" ? "当日" : viewMode === "week" ? "本周" : "本月"}血压概览
          </Text>
        </View>
        
        {alert && (
          <View className={`bp-alert ${alert.type}`}>
            <Text className="alert-message">{alert.message}</Text>
          </View>
        )}
        
        <View className="data-meta">
          <Text className="count-text">共{stats.totalMeasurements}次测量</Text>
          {stats.dataCoverage < 0.7 && (
            <Text className="reliability-text">
              数据覆盖: {Math.round(stats.dataCoverage * 100)}% 
              {stats.dataCoverage < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
      </View>

      {/* 卡片2: 血压分布 */}
      <View className="bp-card distribution-card">
        <Text className="card-title">血压分布</Text>
        <View className="chart-container">
          <PieChart
            series={[{ data: pieData }]}
            width={300}
            height={300}
            config={getPieChartConfig()}
          />
        </View>
        <View className="distribution-list">
          {pieData.map((item, index) => (
            <View key={index} className="distribution-item">
              <View className="distribution-color" style={{ backgroundColor: item.color }} />
              <Text className="distribution-label">{item.name}</Text>
              <Text className="distribution-value">{item.value}次</Text>
              <Text className="distribution-percent">
                {Math.round((item.value / distribution.total) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 卡片3: 血压统计数据 */}
      <View className="bp-card stats-card">
        <Text className="card-title">血压统计</Text>
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
  );
};

export default BPStatistics; 