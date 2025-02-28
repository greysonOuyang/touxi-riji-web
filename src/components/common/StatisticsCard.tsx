import React from "react";
import { View, Text } from "@tarojs/components";
import "./StatisticsCard.scss";

interface StatItem {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: "normal" | "warning" | "good";
}

interface StatisticsCardProps {
  title: string;
  subtitle?: string;
  alert?: {
    message: string;
    type: "warning" | "notice" | "good";
  };
  dataMeta?: {
    measurementCount: number;
    dataCoverage?: number;
  };
  stats: StatItem[];
  columns?: 2 | 3;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  subtitle,
  alert,
  dataMeta,
  stats,
  columns = 2,
}) => {
  return (
    <View className="statistics-card">
      <View className="card-header">
        <Text className="card-title">{title}</Text>
        {subtitle && <Text className="card-subtitle">{subtitle}</Text>}
      </View>
      
      {alert && (
        <View className={`alert ${alert.type}`}>
          <Text className="alert-message">{alert.message}</Text>
        </View>
      )}
      
      {dataMeta && (
        <View className="data-meta">
          <Text className="count-text">共{dataMeta.measurementCount}次测量</Text>
          {dataMeta.dataCoverage && dataMeta.dataCoverage < 0.7 && (
            <Text className="reliability-text">
              数据覆盖: {Math.round(dataMeta.dataCoverage * 100)}% 
              {dataMeta.dataCoverage < 0.5 ? " (数据较少)" : " (部分日期无数据)"}
            </Text>
          )}
        </View>
      )}
      
      <View className={`stats-grid columns-${columns}`}>
        {stats.map((stat, index) => (
          <View key={index} className="stats-item">
            <Text className="stats-label">{stat.label}</Text>
            <Text className={`stats-value ${stat.highlight ? `highlight-${stat.highlight}` : ""}`}>
              {stat.value}
            </Text>
            {stat.unit && <Text className="stats-unit">{stat.unit}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

export default StatisticsCard; 