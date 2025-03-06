import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { getRecentUrineRecords, UrineHistoryItem } from "@/api/urineApi";
import { format, parseISO } from "date-fns";
import { getUserId } from "@/utils/auth";
import "./index.scss";

interface UrineRecentRecordsProps {
  limit?: number;
  onViewMore?: () => void;
}

const UrineRecentRecords: React.FC<UrineRecentRecordsProps> = ({
  limit = 5,
  onViewMore
}) => {
  const [records, setRecords] = useState<UrineHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageNum, setPageNum] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // 格式化时间
  const formatTime = (timeStr: string) => {
    try {
      const date = parseISO(timeStr);
      return format(date, "MM-dd HH:mm");
    } catch (e) {
      return timeStr;
    }
  };

  // 获取尿量记录的标签颜色
  const getVolumeTagColor = (volume: number) => {
    if (volume < 200) return "#ff4d4f"; // 偏少
    if (volume > 500) return "#faad14"; // 偏多
    return "#52c41a"; // 正常
  };

  // 获取尿量记录的状态描述
  const getVolumeStatus = (volume: number) => {
    if (volume < 200) return "偏少";
    if (volume > 500) return "偏多";
    return "正常";
  };

  // 将时间段标签转换为中文
  const getTagText = (tag: string): string => {
    const tagMap: Record<string, string> = {
      'morning': '早晨',
      'afternoon': '下午',
      'evening': '晚上',
      'night': '夜间',
      'other': '其他'
    };
    return tagMap[tag] || tag;
  };

  // 加载最近记录
  const loadRecentRecords = async (page: number = 1, replace: boolean = true) => {
    try {
      setLoading(true);
      
      const userId = getUserId();
      if (!userId) {
        console.error("未登录或用户ID无效");
        setLoading(false);
        return;
      }
      
      console.log(`开始获取最近记录，用户ID: ${userId}, 页码: ${page}, 每页数量: ${limit}`);
      const response = await getRecentUrineRecords(userId, page, limit);
      console.log('获取到的尿量记录响应:', JSON.stringify(response));
      
      // 简化处理逻辑，直接使用响应数据
      if (response && response.data) {
        console.log('响应数据:', response.data);
        
        // 获取记录数据
        let records: UrineHistoryItem[] = [];
        let total = 0;
        
        if (response.data.records) {
          // 分页格式
          records = response.data.records as UrineHistoryItem[];
          total = response.data.total || 0;
          console.log('分页格式数据:', records);
        } else if (Array.isArray(response.data)) {
          // 数组格式
          records = response.data as UrineHistoryItem[];
          total = records.length;
          console.log('数组格式数据:', records);
        } else {
          console.error('未知的数据格式:', response.data);
        }
        
        // 更新状态
        if (records && records.length > 0) {
          setRecords(prev => replace ? records : [...prev, ...records]);
          setTotal(total);
          setHasMore(records.length > 0 && response.data.total ? (page * limit) < response.data.total : false);
          setPageNum(page);
        } else {
          if (replace) {
            setRecords([]);
            setTotal(0);
          }
          setHasMore(false);
        }
      } else {
        console.error("获取记录失败或无数据");
        if (replace) {
          setRecords([]);
          setTotal(0);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error("加载最近记录失败:", err);
      if (replace) {
        setRecords([]);
        setTotal(0);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    console.log('初始化加载，limit:', limit);
    loadRecentRecords(1, true);
  }, [limit]);

  // 处理加载更多
  const handleLoadMore = () => {
    console.log('触发加载更多，当前页码:', pageNum, '是否有更多:', hasMore, '是否加载中:', loading);
    if (hasMore && !loading) {
      loadRecentRecords(pageNum + 1, false);
    }
  };

  // 处理查看更多
  const handleViewMore = () => {
    console.log('触发查看更多');
    if (onViewMore) {
      onViewMore();
    } else {
      // 默认导航到历史记录页面
      Taro.navigateTo({
        url: '/pages/urineHistory/index'
      });
    }
  };

  console.log('组件渲染状态:', {
    recordsLength: records.length,
    loading,
    hasMore,
    pageNum,
    total
  });

  return (
    <View className="urine-recent-records" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
      <View className="records-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className="records-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>最近记录 ({records.length})</Text>
        <View className="header-actions">
          <Text className="view-more-btn" onClick={handleViewMore} style={{ color: '#1890ff', fontSize: '14px' }}>查看更多</Text>
        </View>
      </View>

      {loading && records.length === 0 ? (
        <View className="loading-state" style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>加载中...</View>
      ) : records.length === 0 ? (
        <View className="empty-state" style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>暂无记录</View>
      ) : (
        <ScrollView 
          className="records-list" 
          scrollY 
          scrollWithAnimation
          lowerThreshold={50}
          onScrollToLower={handleLoadMore}
          style={{ maxHeight: '400px' }}
        >
          {records.map((record, index) => (
            <View className="record-item" key={record.id || index} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <View className="record-time" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text className="time-text" style={{ fontSize: '14px', color: '#666' }}>{formatTime(record.recordedTime)}</Text>
                {record.tag && <Text className="tag-text" style={{ fontSize: '12px', color: '#1890ff', backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '10px' }}>{getTagText(record.tag)}</Text>}
              </View>
              <View className="record-volume" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text 
                  className="volume-text"
                  style={{ fontSize: '18px', fontWeight: 'bold', color: getVolumeTagColor(record.volume) }}
                >
                  {record.volume}ml
                </Text>
                <Text className="volume-status" style={{ fontSize: '14px', color: getVolumeTagColor(record.volume), backgroundColor: 'rgba(0, 0, 0, 0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                  {getVolumeStatus(record.volume)}
                </Text>
              </View>
              {record.notes && (
                <View className="record-notes" style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                  <Text className="notes-text">{record.notes}</Text>
                </View>
              )}
            </View>
          ))}
          
          {loading && records.length > 0 && (
            <View className="loading-more" style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#999' }}>加载中...</View>
          )}
          
          {!loading && !hasMore && records.length > 0 && (
            <View className="no-more-data" style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: '#999' }}>没有更多数据了</View>
          )}
        </ScrollView>
      )}
      
      {records.length > 0 && (
        <View className="records-footer" style={{ marginTop: '12px', textAlign: 'right' }}>
          <Text className="total-text" style={{ fontSize: '12px', color: '#999' }}>共 {total} 条记录</Text>
        </View>
      )}
    </View>
  );
};

export default UrineRecentRecords; 