import React, { useState } from "react";
import { View } from "@tarojs/components";
import UCharts from "@qiun/ucharts";
import { Canvas } from "@tarojs/components";
import "./index.scss";
import Taro from "@tarojs/taro";
import { fetchBpTrendWeekly } from "@/api/bloodPressureApi";

interface BPDataPoint {
  systolic: number;    // 收缩压
  diastolic: number;   // 舒张压
  heartRate: number;   // 添加心率字段
  timestamp: string;
}

const BPAnalysis: React.FC = () => {
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [bpData, setBpData] = useState<BPDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7; // 每页显示7天数据
  const touchStartX = React.useRef<number>(0);  // 添加 ref 来存储触摸起始位置
  const [hasMore, setHasMore] = useState(true);  // 是否还有更多数据

  // 获取血压趋势数据
  const fetchBpTrend = async (page: number = 1) => {
    setLoading(true);
    try {
      const today = new Date();
      // 修正日期计算逻辑
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - ((page - 1) * pageSize));
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (pageSize - 1)); // 修改为 pageSize - 1

      const params = {
        userId: Taro.getStorageSync("userId"),
        timeSpan: viewType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      console.log('请求参数:', {
        page,
        startDate: params.startDate,
        endDate: params.endDate
      });

      const response = await fetchBpTrendWeekly(params);
      if (response?.data) {
        const newData = response.data.map(item => ({
          systolic: item.systolic,
          diastolic: item.diastolic,
          heartRate: item.heartRate ?? 0,
          timestamp: item.timestamp
        }));

        if (page === 1) {
          setBpData(newData);
        } else {
          setBpData(prev => {
            const combinedData = [...prev, ...newData];
            return combinedData.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          });
        }

        setHasMore(newData.length > 0);
      }
    } catch (error) {
      console.error('获取血压趋势数据失败:', error);
      Taro.showToast({
        title: '获取数据失败',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取当前页面要显示的数据
  const getDisplayData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return bpData
      .slice(startIndex, startIndex + pageSize)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // 处理页面切换
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1) return;
    
    setCurrentPage(newPage);
    // 修改加载更多数据的判断条件
    if ((newPage * pageSize > bpData.length - pageSize/2) && hasMore) {
      const nextPage = Math.ceil(bpData.length / pageSize) + 1;
      await fetchBpTrend(nextPage);
    }
  };

  const initChart = (canvas: any, width: number, height: number) => {
    const ctx = canvas.getContext("2d");
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const displayData = getDisplayData();
    
    const chartData = {
      categories: displayData.map(item => {
        const date = new Date(item.timestamp);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      }),
      series: [
        {
          name: "收缩压",
          data: displayData.map(item => item.systolic),
          color: "#FF8A8A"
        },
        {
          name: "舒张压",
          data: displayData.map(item => item.diastolic),
          color: "#92A3FD"
        },
        {
          name: "心率",
          data: displayData.map(item => item.heartRate),
          color: "#4CAF50"
        }
      ],
    };

    const maxValue = Math.max(
      ...displayData.map(item => item.systolic),
      ...displayData.map(item => item.heartRate),
      140
    );
    const minValue = Math.min(
      ...displayData.map(item => item.diastolic),
      ...displayData.map(item => item.heartRate),
      60
    );

    new UCharts({
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
            min: minValue * 0.9,
            max: maxValue * 1.1,
            title: "血压(mmHg)",
            fontColor: "#666666",
          },
        ],
      },
      legend: { show: true },
      extra: {
        line: {
          type: "straight",
          width: 2,
        }
      },
    });
  };

  // 初始加载数据
  React.useEffect(() => {
    setCurrentPage(1);
    fetchBpTrend(1);
  }, [viewType]);

  // 更新 useEffect 依赖项
  React.useEffect(() => {
    if (!loading && bpData.length > 0) {
      const query = Taro.createSelectorQuery();
      query
        .select('#bpChart')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node;
            initChart(canvas, res[0].width, res[0].height);
          }
        });
    }
  }, [loading, bpData, currentPage]); // 添加 currentPage 作为依赖项

  return (
    <View className="bp-analysis">
      <View className="view-type-selector">
        <View 
          className={`selector-item ${viewType === 'week' ? 'active' : ''}`}
          onClick={() => setViewType('week')}
        >
          周视图
        </View>
        <View 
          className={`selector-item ${viewType === 'month' ? 'active' : ''}`}
          onClick={() => setViewType('month')}
        >
          月视图
        </View>
      </View>
      <View className="chart-container">
        {loading ? (
          <View className="loading">加载中...</View>
        ) : (
          <Canvas
            type="2d"
            id="bpChart"
            canvas-id="bpChart"
            className="charts"
            style={{ width: '100%', height: '300px' }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartX.current = touch.x;  // 保存起始位置
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const moveX = touch.x - touchStartX.current;

              if (Math.abs(moveX) > 50) {
                if (moveX > 0 && (hasMore || currentPage * pageSize < bpData.length)) {
                  handlePageChange(currentPage + 1);
                  touchStartX.current = touch.x;
                } else if (moveX < 0 && currentPage > 1) {
                  handlePageChange(currentPage - 1);
                  touchStartX.current = touch.x;
                }
              }
            }}
          />
        )}
      </View>
      {loading && <View className="loading-more">加载更多数据...</View>}
    </View>
  );
};

export default BPAnalysis;