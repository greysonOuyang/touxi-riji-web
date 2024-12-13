import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import UCharts from "@qiun/ucharts";
import { Canvas } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { getStats, AggregatedStatsVO } from "@/api/pdRecordApi";
import "./index.scss";

const formatDwellTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}小时${mins}分钟`;
};

const TrendAnalysis: React.FC = () => {
  const [statsData, setStatsData] = useState<AggregatedStatsVO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUltrafiltrationDescription, setShowUltrafiltrationDescription] =
    useState(false);
  const [showDwellTimeDescription, setShowDwellTimeDescription] =
    useState(false);
  const [
    showAvgUltrafiltrationDescription,
    setShowAvgUltrafiltrationDescription,
  ] = useState(false);
  const [showAvgDwellTimeDescription, setShowAvgDwellTimeDescription] =
    useState(false);

  const initChart = (canvas: any, width: number, height: number) => {
    const ctx = canvas.getContext("2d");
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    if (!statsData) return;

    const chartData = {
      categories: statsData.details.map((item) => {
        const date = new Date(item.key);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
          .getDate()
          .toString()
          .padStart(2, "0")}`;
      }),
      series: [
        {
          name: "超滤量",
          data: statsData.details.map((item) => item.value),
        },
      ],
    };

    const maxValue = Math.max(...chartData.series[0].data, 0);
    const minValue = Math.min(...chartData.series[0].data, 0);

    const newChart = new UCharts({
      type: "line",
      context: ctx,
      width,
      height,
      categories: chartData.categories,
      series: chartData.series,
      animation: true,
      background: "#FFFFFF",
      padding: [15, 15, 0, 15],
      xAxis: {
        disableGrid: true,
        fontColor: "#666666",
        rotateLabel: true,
      },
      yAxis: {
        gridType: "dash",
        dashLength: 2,
        data: [
          {
            min: minValue < 0 ? minValue * 1.2 : 0,
            max: maxValue * 1.2,
            title: "超滤量(ml)",
            fontColor: "#666666",
          },
        ],
      },
      legend: { show: false },
      extra: {
        line: {
          type: "straight",
          width: 2,
          color: "#92A3FD",
        },
        tooltip: {
          showBox: true,
          boxBgColor: "#000000",
          boxBgOpacity: 0.7,
          fontColor: "#FFFFFF",
        },
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (statsData) {
      const query = Taro.createSelectorQuery();
      query
        .select("#lineChart")
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            initChart(res[0].node, res[0].width, res[0].height);
          }
        });
    }
  }, [statsData]);

  const fetchData = async () => {
    setError(null);
    const userId = Taro.getStorageSync("userId");

    if (!userId) {
      console.error("User ID not found in storage");
      setError("用户ID未找到，请重新登录");
      return;
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const weekNumber = Math.ceil(
      (currentDate.getDate() - currentDate.getDay() + 1) / 7
    );
    const timeKey = `${year}-${month.toString().padStart(2, "0")}-${weekNumber
      .toString()
      .padStart(2, "0")}`;

    try {
      const response = await getStats({
        userId: parseInt(userId),
        timeDimension: "week",
        timeKey,
      });
      setStatsData(response.data);
    } catch (error) {
      console.error(`Error fetching week data:`, error);
      setError("获取数据时发生错误，请稍后重试");
    }
  };

  const renderMetricItem = (
    label: string,
    value: string | number,
    coefficient: number,
    description: string,
    showDescription: boolean,
    onToggleDescription: () => void
  ) => {
    return (
      <View className="metric-item">
        <View className="metric-header">
          <View className="metric-label-container">
            <Text className="metric-label">{label}</Text>
            <AtIcon
              value="alert-circle"
              size="14"
              color="#C4C4C4"
              onClick={onToggleDescription}
            />
          </View>
          <Text className="metric-value">{value}</Text>
        </View>
        <View className="progress-bar">
          <View
            className="progress-fill"
            style={{ width: `${Math.min(coefficient * 100, 100)}%` }}
          />
        </View>
        <View className="coefficient-container">
          <Text className="coefficient-label">波动系数：</Text>
          <Text className="coefficient-value">{coefficient.toFixed(2)}</Text>
        </View>
        {showDescription && (
          <Text className="metric-description">{description}</Text>
        )}
      </View>
    );
  };

  const generateDetailedReport = (stats: AggregatedStatsVO) => {
    const { aggregatedStats } = stats;
    let report = `本周数据详细报告：\n\n`;

    // 超滤量报告
    report += `1. 平均每日超滤量：${Math.round(
      aggregatedStats.avgUltrafiltration
    )}ml\n`;
    report += `   超滤量波动系数：${aggregatedStats.ultrafiltrationVariance.toFixed(
      1
    )}\n`;
    if (aggregatedStats.ultrafiltrationVariance < 0.15) {
      report += `   您的超滤量波动很小，表现非常稳定。这可能表明您的治疗方案执行得很好，或者您的身体状况相对稳定。\n`;
    } else if (aggregatedStats.ultrafiltrationVariance < 0.25) {
      report += `   您的超滤量波动在正常范围内。这种程度的波动是常见的，可能反映了日常生活中的正常变化。\n`;
    } else if (aggregatedStats.ultrafiltrationVariance < 0.35) {
      report += `   您的超滤量波动稍大，但仍在可接受范围内。这可能反映了一些影响因素的存在，比如饮食、活动量或其他生活习惯的变化。\n`;
    } else {
      report += `   您的超滤量波动较大。这可能意味着有一些因素正在影响您的超滤效果。建议关注可能的影响因素，并在下次随访时与医生讨论。\n`;
    }

    // 滞留时间报告
    report += `\n2. 平均滞留时间：${formatDwellTime(
      aggregatedStats.avgDwellTime
    )}\n`;
    report += `   滞留时间波动系数：${aggregatedStats.varianceDwellTime.toFixed(
      1
    )}\n`;
    if (aggregatedStats.varianceDwellTime < 0.1) {
      report += `   您的滞留时间波动很小，治疗时间安排非常稳定。这表明您能够很好地遵循既定的治疗计划。\n`;
    } else if (aggregatedStats.varianceDwellTime < 0.2) {
      report += `   您的滞留时间波动在正常范围内，治疗时间安排较为稳定。这种程度的波动是常见的，可能反映了日常生活中的正常变化。\n`;
    } else if (aggregatedStats.varianceDwellTime < 0.3) {
      report += `   您的滞留时间波动稍大，但仍可接受。这可能反映了您的日程安排有一些变化。尽量保持规律的治疗时间可能会有所帮助。\n`;
    } else {
      report += `   您的滞留时间波动较大。这可能意味着您的治疗时间安排受到了一些因素的影响。考虑审视您的日常安排，看是否有可能调整以获得更稳定的治疗时间。\n`;
    }

    report += `\n请记住，这份报告仅供参考，不能替代医疗建议。如果您对数据有任何疑问或担忧，请在下次随访时与您的医疗团队讨论。`;

    return report;
  };

  return (
    <View className="trend-analysis">
      <View className="chart-container">
        <Canvas
          type="2d"
          id="lineChart"
          canvas-id="lineChart"
          className="charts"
        />
        {!statsData && <View className="no-data">暂无数据</View>}
      </View>

      {statsData && (
        <View className="report-section">
          <Text className="section-title">本周数据报告</Text>
          <View className="metrics">
            {renderMetricItem(
              "平均每日超滤量",
              `${Math.round(statsData.aggregatedStats.avgUltrafiltration)}ml`,
              statsData.aggregatedStats.ultrafiltrationVariance,
              "超滤量波动系数（CV）反映了超滤量的变化程度：\n• 0.15以下：波动很小，表现非常稳定\n• 0.15-0.25：波动正常\n• 0.25-0.35：波动稍大，但仍可接受\n• 0.35以上：波动较大",
              showAvgUltrafiltrationDescription,
              () =>
                setShowAvgUltrafiltrationDescription(
                  !showAvgUltrafiltrationDescription
                )
            )}
            {renderMetricItem(
              "平均滞留时间",
              formatDwellTime(statsData.aggregatedStats.avgDwellTime),
              statsData.aggregatedStats.varianceDwellTime,
              "滞留时间波动系数（CV）反映了滞留时间的变化程度：\n• 0.1以下：波动很小，非常稳定\n• 0.1-0.2：波动正常\n• 0.2-0.3：波动稍大，但仍可接受\n• 0.3以上：波动较大",
              showAvgDwellTimeDescription,
              () => setShowAvgDwellTimeDescription(!showAvgDwellTimeDescription)
            )}
          </View>

          <View className="detailed-report">
            <Text className="detailed-report-title">详细分析报告</Text>
            <Text className="report-content">
              {generateDetailedReport(statsData)}
            </Text>
          </View>

          <View className="disclaimer">
            <Text className="disclaimer-text">
              免责声明：本报告仅作为数据分析参考，不能作为医疗建议。如有任何问题，请及时咨询医生。
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TrendAnalysis;
