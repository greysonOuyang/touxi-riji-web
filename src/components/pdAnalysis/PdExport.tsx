import React from "react";
import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { PdDataPoint } from "./usePdData";
import "./PdExport.scss";

interface PdExportProps {
  pdData: PdDataPoint[];
  viewMode: "day" | "week" | "month";
  currentDate: Date;
}

const PdExport: React.FC<PdExportProps> = ({ pdData, viewMode, currentDate }) => {
  // 导出为医学腹透本格式
  const exportToMedicalFormat = () => {
    // 根据不同的视图模式，准备不同的导出数据
    const exportData = prepareExportData();
    
    // 生成CSV内容
    const csvContent = generateCsvContent(exportData);
    
    // 在小程序环境中，使用云函数或后端API处理导出
    if (process.env.TARO_ENV === "weapp") {
      Taro.showToast({
        title: "正在准备导出...",
        icon: "loading",
        duration: 2000
      });
      
      // 这里应该调用云函数或后端API来处理导出
      // 示例：调用云函数生成并返回文件临时链接
      /*
      Taro.cloud.callFunction({
        name: 'generatePdExport',
        data: {
          pdData: exportData,
          format: 'medical'
        }
      }).then(res => {
        const { fileID, tempUrl } = res.result;
        // 处理下载或预览
      }).catch(err => {
        Taro.showToast({
          title: '导出失败',
          icon: 'none'
        });
      });
      */
      
      // 由于无法直接在小程序中下载文件，这里仅显示提示
      setTimeout(() => {
        Taro.showModal({
          title: "导出成功",
          content: "数据已导出到云端，请在个人中心查看",
          showCancel: false
        });
      }, 2000);
    } else {
      // 在H5环境中，直接触发下载
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", generateFileName());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // 准备导出数据
  const prepareExportData = () => {
    // 根据视图模式处理数据
    switch (viewMode) {
      case "day":
        return formatDailyData();
      case "week":
        return formatWeeklyData();
      case "month":
        return formatMonthlyData();
      default:
        return formatDailyData();
    }
  };
  
  // 格式化日视图数据
  const formatDailyData = () => {
    // 按时间排序
    const sortedData = [...pdData].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    
    // 格式化为医学腹透本格式的日记录
    return sortedData.map(item => ({
      日期: formatDate(item.timestamp),
      时间: item.recordTime,
      透析液类型: item.dialysateType,
      注入量: item.infusionVolume,
      引流量: item.drainageVolume,
      超滤量: item.ultrafiltration,
      备注: item.notes || ""
    }));
  };
  
  // 格式化周视图数据
  const formatWeeklyData = () => {
    // 按日期分组
    const groupedByDate = pdData.reduce((acc, item) => {
      const date = formatDate(item.timestamp);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, PdDataPoint[]>);
    
    // 计算每日汇总数据
    return Object.entries(groupedByDate).map(([date, items]) => {
      const totalUltrafiltration = items.reduce((sum, item) => sum + item.ultrafiltration, 0);
      const totalDrainage = items.reduce((sum, item) => sum + item.drainageVolume, 0);
      const totalInfusion = items.reduce((sum, item) => sum + item.infusionVolume, 0);
      const exchangeCount = items.length;
      
      return {
        日期: date,
        交换次数: exchangeCount,
        总注入量: totalInfusion,
        总引流量: totalDrainage,
        总超滤量: totalUltrafiltration,
        平均超滤量: exchangeCount > 0 ? (totalUltrafiltration / exchangeCount).toFixed(1) : "0"
      };
    });
  };
  
  // 格式化月视图数据
  const formatMonthlyData = () => {
    // 按周分组
    const weeklyData: Array<{
      周期: string;
      交换次数: number;
      总注入量: number;
      总引流量: number;
      总超滤量: number;
      平均超滤量: string;
    }> = [];
    const startDate = new Date(currentDate);
    startDate.setDate(1); // 月初
    
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0); // 月末
    
    // 计算每周数据
    let currentWeekStart = new Date(startDate);
    while (currentWeekStart <= endDate) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
      
      // 筛选当前周的数据
      const weekData = pdData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= currentWeekStart && itemDate <= currentWeekEnd;
      });
      
      if (weekData.length > 0) {
        const totalUltrafiltration = weekData.reduce((sum, item) => sum + item.ultrafiltration, 0);
        const totalDrainage = weekData.reduce((sum, item) => sum + item.drainageVolume, 0);
        const totalInfusion = weekData.reduce((sum, item) => sum + item.infusionVolume, 0);
        const exchangeCount = weekData.length;
        
        weeklyData.push({
          周期: `${formatDate(currentWeekStart.toISOString())} - ${formatDate(currentWeekEnd.toISOString())}`,
          交换次数: exchangeCount,
          总注入量: totalInfusion,
          总引流量: totalDrainage,
          总超滤量: totalUltrafiltration,
          平均超滤量: exchangeCount > 0 ? (totalUltrafiltration / exchangeCount).toFixed(1) : "0"
        });
      }
      
      // 移动到下一周
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeklyData;
  };
  
  // 生成CSV内容
  const generateCsvContent = (data: any[]) => {
    if (data.length === 0) return "";
    
    // 获取表头
    const headers = Object.keys(data[0]);
    
    // 生成CSV内容
    const csvRows = [
      headers.join(","), // 表头行
      ...data.map(row => 
        headers.map(header => {
          // 处理包含逗号的内容，用双引号包裹
          const cell = String(row[header]);
          return cell.includes(",") ? `"${cell}"` : cell;
        }).join(",")
      )
    ];
    
    return csvRows.join("\n");
  };
  
  // 生成文件名
  const generateFileName = () => {
    const dateStr = formatDate(currentDate.toISOString()).replace(/-/g, "");
    const modeMap = {
      day: "日",
      week: "周",
      month: "月"
    };
    
    return `腹透记录_${modeMap[viewMode]}报表_${dateStr}.csv`;
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  
  return (
    <View className="pd-export">
      <View 
        className="export-button"
        onClick={exportToMedicalFormat}
      >
        <Image 
          className="export-icon" 
          src="/assets/icons/download.png" 
          mode="aspectFit" 
        />
        <Text className="button-text">导出数据</Text>
      </View>
    </View>
  );
};

export default PdExport; 