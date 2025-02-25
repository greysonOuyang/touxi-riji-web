"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { View, Text } from "@tarojs/components"
import UCharts from "@qiun/ucharts"
import { Canvas } from "@tarojs/components"
import "./index.scss"
import Taro from "@tarojs/taro"
import { fetchBpTrendWeekly } from "@/api/bloodPressureApi"

interface BPDataPoint {
  systolic: number
  diastolic: number
  heartRate: number
  timestamp: string
}

const BPAnalysis: React.FC = () => {
  const [bpData, setBpData] = useState<BPDataPoint[]>([])
  const [abnormalValues, setAbnormalValues] = useState<string[]>([])
  const fetchBpTrendRef = useRef(null)

  const fetchBpTrend = useCallback(async () => {
    try {
      const today = new Date()
      const endDate = new Date(today)
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 6)

      const params = {
        userId: Taro.getStorageSync("userId"),
        timeSpan: "week",
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      }

      const response = await fetchBpTrendWeekly(params)
      if (response?.data) {
        const newData = response.data.map((item) => ({
          systolic: item.systolic,
          diastolic: item.diastolic,
          heartRate: item.heartRate ?? 0,
          timestamp: item.timestamp,
        }))

        const sortedData = newData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        setBpData(sortedData)
      }
    } catch (error) {
      console.error("获取血压趋势数据失败:", error)
      Taro.showToast({
        title: "获取数据失败",
        icon: "error",
      })
    }
  }, [])

  const initChart = useCallback(
    (canvas: any, width: number, height: number) => {
      const ctx = canvas.getContext("2d")
      canvas.width = width * 2
      canvas.height = height * 2
      ctx.scale(2, 2)
  
      const today = new Date()
      const endDate = new Date(today)
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 6)

      // 生成完整的7天日期数组
      const dateRange = ['', ...Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })]

      // 将数据映射到完整的7天，并在开头添加空数据
      const fullData = [
        { systolic: null, diastolic: null, heartRate: null, timestamp: '' },
        ...dateRange.slice(1).map(date => {
          const matchingData = bpData.find(item => {
            const itemDate = new Date(item.timestamp)
            return `${itemDate.getMonth() + 1}/${itemDate.getDate()}` === date
          })
          return matchingData || {
            systolic: null,
            diastolic: null,
            heartRate: null,
            timestamp: date
          }
        })
      ]

      // 定义血压和心率的正常范围
      const normalRanges = {
        systolic: { min: 90, max: 140 },
        diastolic: { min: 60, max: 90 },
        heartRate: { min: 60, max: 100 }
      }

      // 收集异常值提醒
      const abnormalMessages: string[] = []
      
      fullData.forEach((item, index) => {
        if (!item?.timestamp || index === 0) return
        
        const date = item.timestamp
        if (item.systolic !== null) {
          if (item.systolic > normalRanges.systolic.max) {
            abnormalMessages.push(`${date}: 收缩压 ${item.systolic} mmHg 偏高`)
          } else if (item.systolic < normalRanges.systolic.min) {
            abnormalMessages.push(`${date}: 收缩压 ${item.systolic} mmHg 偏低`)
          }
        }
        
        if (item.diastolic !== null) {
          if (item.diastolic > normalRanges.diastolic.max) {
            abnormalMessages.push(`${date}: 舒张压 ${item.diastolic} mmHg 偏高`)
          } else if (item.diastolic < normalRanges.diastolic.min) {
            abnormalMessages.push(`${date}: 舒张压 ${item.diastolic} mmHg 偏低`)
          }
        }
        
        if (item.heartRate !== null) {
          if (item.heartRate > normalRanges.heartRate.max) {
            abnormalMessages.push(`${date}: 心率 ${item.heartRate} 次/分 偏快`)
          } else if (item.heartRate < normalRanges.heartRate.min) {
            abnormalMessages.push(`${date}: 心率 ${item.heartRate} 次/分 偏慢`)
          }
        }
      })
      
      setAbnormalValues(abnormalMessages)

      // 修改 chartData 的 series 配置，添加标记点
      const chartData = {
        categories: dateRange,
        series: [
          {
            name: "收缩压",
            data: fullData.map(item => item?.systolic || null),
            color: "#FF8A8A",
            markPoint: fullData.map((item, index) => {
              if (!item?.systolic) return null;
              if (item.systolic > normalRanges.systolic.max) {
                return {
                  value: '偏高',
                  coord: [index, item.systolic],
                  color: '#FF4444'
                };
              }
              if (item.systolic < normalRanges.systolic.min) {
                return {
                  value: '偏低',
                  coord: [index, item.systolic],
                  color: '#FF4444'
                };
              }
              return null;
            }).filter(Boolean)
          },
          {
            name: "舒张压",
            data: fullData.map(item => item?.diastolic || null),
            color: "#92A3FD",
            markPoint: fullData.map((item, index) => {
              if (!item?.diastolic) return null;
              if (item.diastolic > normalRanges.diastolic.max) {
                return {
                  value: '偏高',
                  coord: [index, item.diastolic],
                  color: '#FF4444'
                };
              }
              if (item.diastolic < normalRanges.diastolic.min) {
                return {
                  value: '偏低',
                  coord: [index, item.diastolic],
                  color: '#FF4444'
                };
              }
              return null;
            }).filter(Boolean)
          },
          {
            name: "心率",
            data: fullData.map(item => item?.heartRate || null),
            color: "#4CAF50",
            markPoint: fullData.map((item, index) => {
              if (!item?.heartRate) return null;
              if (item.heartRate > normalRanges.heartRate.max) {
                return {
                  value: '偏快',
                  coord: [index, item.heartRate],
                  color: '#FF4444'
                };
              }
              if (item.heartRate < normalRanges.heartRate.min) {
                return {
                  value: '偏慢',
                  coord: [index, item.heartRate],
                  color: '#FF4444'
                };
              }
              return null;
            }).filter(Boolean)
          },
        ],
      }
  
      const maxValue = Math.max(...bpData.map((item) => Math.max(item.systolic, item.heartRate)), 140)
      const minValue = Math.min(...bpData.map((item) => Math.min(item.diastolic, item.heartRate)), 60)
  
      new UCharts({
        type: "line",
        context: ctx,
        width: width,
        height: height,
        categories: chartData.categories,
        series: chartData.series,
        animation: true,
        background: "#FFFFFF",
        padding: [30, 15, 15, 15],
        xAxis: {
          disableGrid: true,
          fontColor: "#999999",
          rotateLabel: false,
          fontSize: 11,
          boundaryGap: true,
          itemCount: 8,
          axisLine: true,
          format: (val) => val,
        },
        yAxis: {
          gridType: "dash",
          gridColor: "#f0f0f0",
          dashLength: 2,
          splitNumber: 4,
          min: Math.floor((minValue - 10) / 10) * 10,
          max: Math.ceil((maxValue + 10) / 10) * 10,
          format: (val) => val + "",
          fontColor: "#999999",
          fontSize: 11,
        },
        legend: {
          show: false,
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
            activeType: "none",
            connectNulls: true,
          },
          markLine: {
            type: 'dash',
            data: []
          },
          markPoint: {
            show: true,
            type: 'text',
            fontSize: 11,
            textAlign: 'center',
            textOffset: 10,
            showBox: true,
            boxPadding: 3,
            boxColor: '#FF4444',
            boxBorder: false,
          },
          point: {
            size: 4,
            activeSize: 6,
            activeColor: "#FFFFFF",
            border: true,
            borderWidth: 2,
            borderColor: "#FFFFFF",
            shape: "circle",
          },
          label: {
            show: true,
            position: "top",
            fontSize: 11,
            color: "#666666",
            format: (val) => val,
            padding: 4,
            offset: 5,
          }
        },
        enableScroll: false,
        dataPointShape: true,
      })
    },
    [bpData],
  )

  useEffect(() => {
    fetchBpTrend()
  }, [fetchBpTrend])

  useEffect(() => {
    if (bpData.length > 0) {
      const query = Taro.createSelectorQuery()
      query
        .select("#bpChart")
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            initChart(canvas, res[0].width, res[0].height)
          }
        })
    }
  }, [bpData, initChart])

  return (
    <View className="bp-analysis">
      <View className="chart-header">
        <Text className="chart-title">血压趋势</Text>
        <View className="indicators">
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#FF8A8A" }} />
            <Text className="indicator-text">收缩压</Text>
          </View>
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#92A3FD" }} />
            <Text className="indicator-text">舒张压</Text>
          </View>
          <View className="indicator-item">
            <View className="indicator-dot" style={{ background: "#4CAF50" }} />
            <Text className="indicator-text">心率</Text>
          </View>
        </View>
        <Text className="chart-unit">单位：mmHg</Text>
      </View>
      <View className="chart-container">
        <Canvas
          type="2d"
          id="bpChart"
          canvas-id="bpChart"
          className="charts"
          style={{
            width: "100%",
            height: "380px",
            padding: "0",
            background: "#FFFFFF",
            borderRadius: "12px",
          }}
        />
      </View>
      
      {abnormalValues.length > 0 && (
        <View className="abnormal-values-container">
          <Text className="abnormal-title">异常值提醒</Text>
          <View className="abnormal-list">
            {abnormalValues.map((message, index) => (
              <Text key={index} className="abnormal-item">{message}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default BPAnalysis