import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Image } from "@tarojs/components";
import Icon from "@/components/common/Icon";
import Taro, { usePageScroll, useDidShow } from "@tarojs/taro";
import {
  format,
  startOfMonth,
  endOfMonth,
  subDays,
  isToday,
  isSameDay,
  parseISO,
  subMonths,
  addMonths,
  getMonth,
  getYear,
} from "date-fns";
import {
  getPaginatedPdRecords,
  PdRecordDateVO,
  PdRecordData,
  getLatestPdRecord,
  LatestPdRecordDTO,
  getPdRecordsByDate,
  PdRecordVO,
} from "@/api/pdRecordApi";
import "./index.scss";

const defaultLatestRecord: LatestPdRecordDTO = {
  totalUltrafiltration: 0,
  latestConcentration: "",
  sequenceNumber: 0,
  dailyFrequency: 0,
  updateTime: "暂无记录",
};

const HistoricalDataMore: React.FC = () => {
  // 状态管理
  const [activeSection, setActiveSection] = useState<"today" | "history">("today");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateData, setDateData] = useState<PdRecordDateVO[]>([]);
  const [detailedData, setDetailedData] = useState<PdRecordData[]>([]);
  const [todayRecord, setTodayRecord] = useState<PdRecordVO | null>(null);
  const [latestRecord, setLatestRecord] = useState<LatestPdRecordDTO>(defaultLatestRecord);
  const [scrollTop, setScrollTop] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const calendarRef = useRef<any>(null);
  
  // 页面滚动处理
  usePageScroll(({ scrollTop: top }) => {
    setScrollTop(top);
  });

  // 初始化数据
  useEffect(() => {
    fetchLatestRecord();
    fetchTodayRecord();
    fetchMonthData(new Date());
    
    // 初始化时加载今日详细记录
    const today = format(new Date(), "yyyy-MM-dd");
    fetchDayDetails(today);
  }, []);

  // 页面显示时刷新数据
  useDidShow(() => {
    const needRefresh = Taro.getStorageSync('refreshPdRecord');
    if (needRefresh) {
      fetchLatestRecord();
      fetchTodayRecord();
      
      // 刷新当前选中日期的详细数据
      fetchDayDetails(format(selectedDate, "yyyy-MM-dd"));
      
      Taro.removeStorageSync('refreshPdRecord');
    }
  });

  // 获取最新记录
  const fetchLatestRecord = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const response = await getLatestPdRecord(userId);
      if (response.isSuccess()) {
        setLatestRecord(response.data);
      }
    } catch (err) {
      console.error("获取最新记录失败:", err);
    }
  };

  // 获取今日记录
  const fetchTodayRecord = async () => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const today = format(new Date(), "yyyy-MM-dd");
      const response = await getPdRecordsByDate(userId, today);
      if (response.isSuccess()) {
        setTodayRecord(response.data);
      }
    } catch (err) {
      console.error("获取今日记录失败:", err);
    }
  };

  // 获取月度数据
  const fetchMonthData = async (date: Date) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const startDate = format(start, "yyyy-MM-dd");
      const endDate = format(end, "yyyy-MM-dd");

      const response = await getPaginatedPdRecords(
        userId,
        1,
        100,
        startDate,
        endDate
      );
      if (response.isSuccess()) {
        setDateData(response.data.records);
      }

      // 如果选择的是当天，获取当天的详细数据
      if (isSameDay(selectedDate, date)) {
        fetchDayDetails(format(selectedDate, "yyyy-MM-dd"));
      }
    } catch (err) {
      console.error("获取月度数据失败:", err);
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  };

  // 获取日详情
  const fetchDayDetails = async (dateStr: string) => {
    try {
      const userId = Taro.getStorageSync("userId");
      if (!userId) return;

      const response = await getPdRecordsByDate(userId, dateStr);
      if (response.isSuccess()) {
        setDetailedData(response.data.dateRecords || []);
      }
    } catch (err) {
      console.error("获取日详情失败:", err);
    }
  };

  // 处理日期选择
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchDayDetails(format(date, "yyyy-MM-dd"));
  };

  // 处理月份切换
  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate = direction === "prev" 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1);
    setCurrentDate(newDate);
    fetchMonthData(newDate);
  };

  // 返回今日
  const goToToday = () => {
    const today = new Date();
    
    // 如果当前不是今天的月份，切换到今天所在的月份
    if (getMonth(currentDate) !== getMonth(today) || getYear(currentDate) !== getYear(today)) {
      setCurrentDate(today);
      fetchMonthData(today);
    }
    
    // 选中今天的日期
    setSelectedDate(today);
    fetchDayDetails(format(today, "yyyy-MM-dd"));
  };

  // 跳转到添加记录页面
  const goToAddRecord = () => {
    Taro.navigateTo({ url: "/pages/pdPlan/record/index" });
  };

  // 跳转到统计分析页面
  const goToStatistics = () => {
    Taro.navigateTo({ url: "/pages/statistics/index?tab=4" });
  };

  // 根据时间获取时间段（早中晚）
  const getTimeOfDay = (timeStr: string) => {
    const hour = parseInt(timeStr.substring(0, 2), 10);
    
    if (hour >= 5 && hour < 12) {
      return "morning";
    } else if (hour >= 12 && hour < 18) {
      return "afternoon";
    } else {
      return "evening";
    }
  };

  // 渲染日历网格
  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateRange: Date[] = [];
    let currentDateInRange = startDate;
    
    // 生成日期范围
    while (currentDateInRange <= endDate) {
      dateRange.push(new Date(currentDateInRange));
      currentDateInRange = new Date(currentDateInRange);
      currentDateInRange.setDate(currentDateInRange.getDate() + 1);
    }

    // 计算日历开始需要的空白格子数量
    const startDay = monthStart.getDay();
    const blanks = Array(startDay).fill(null);

    return (
      <View className="calendar-grid">
        {/* 星期标题 */}
        {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
          <View key={index} className="calendar-weekday">
            <Text>{day}</Text>
          </View>
        ))}
        
        {/* 空白格子 */}
        {blanks.map((_, index) => (
          <View key={`blank-${index}`} className="calendar-day empty" />
        ))}
        
        {/* 日期格子 */}
        {dateRange.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dateRecord = dateData.find(item => item.date === dateStr);
          const hasRecord = !!dateRecord;
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          
          return (
            <View 
              key={dateStr} 
              className={`calendar-day ${hasRecord ? 'has-record' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
              onClick={() => hasRecord && handleDateSelect(date)}
            >
              <Text className="day-number">{date.getDate()}</Text>
              {hasRecord && (
                <View 
                  className={`record-indicator ${dateRecord.totalUltrafiltration < 0 ? 'negative' : 'positive'}`}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // 渲染今日指标部分
  const renderTodaySection = () => {
    const isNegativeUltrafiltration = (todayRecord?.totalUltrafiltration || 0) < 0;
    const isZeroUltrafiltration = (todayRecord?.totalUltrafiltration || 0) === 0;
    const progressPercentage = Math.min(
      Math.max(
        ((todayRecord?.totalCount || 0) / (todayRecord?.dailyFrequency || 1)) * 100,
        0
      ),
      100
    );

    return (
      <View className="today-section">
        <View className="today-header">
          <Text className="today-title">今日腹透</Text>
          <Text className="today-date">{format(new Date(), "yyyy年MM月dd日")}</Text>
        </View>

        <View className="metrics-card">
          <View className="ultrafiltration-display">
            <View className={`ultrafiltration-circle ${isZeroUltrafiltration ? 'zero' : (isNegativeUltrafiltration ? 'negative' : '')}`}>
              <Text className={`ultrafiltration-value ${isNegativeUltrafiltration ? 'negative' : ''}`}>
                {todayRecord?.totalUltrafiltration || 0}
                <Text className="ultrafiltration-unit">ml</Text>
              </Text>
            </View>
            <Text className="ultrafiltration-label">今日超滤量</Text>
          </View>

          <View className="metrics-details">
            <View className="metric-item">
              <Text className="metric-label">完成次数</Text>
              <Text className="metric-value">{todayRecord?.totalCount || 0}/{todayRecord?.dailyFrequency || 4}</Text>
            </View>
            <View className="progress-bar">
              <View 
                className={`progress-fill ${isNegativeUltrafiltration ? 'negative' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            
            <View className="metric-item">
              <Text className="metric-label">最近浓度</Text>
              <Text className="metric-value">{latestRecord.latestConcentration || "暂无"}</Text>
            </View>
            
            <View className="metric-item">
              <Text className="metric-label">最近更新</Text>
              <Text className="metric-value">{latestRecord.updateTime.substring(0, 16).replace('T', ' ')}</Text>
            </View>
          </View>
        </View>

        {isNegativeUltrafiltration && (
          <View className="warning-message">
            <Icon value="alert-circle" size={16} color="#FF6B6B" />
            <Text>当前超滤量为负值，请及时关注，必要时咨询医生</Text>
          </View>
        )}
        
        {/* 今日详细记录 */}
        <View className="today-records">
          <View className="records-header">
            <Text className="records-title">今日详细记录</Text>
            <Text className="record-count">共 {detailedData.length} 条记录</Text>
          </View>
          
          {detailedData.length > 0 ? (
            <View className="records-list">
              {detailedData.map((record, index) => (
                <View key={index} className="record-item">
                  <View className="record-time-container">
                    <View className={`time-dot ${getTimeOfDay(record.recordTime)}`} />
                    <View className="time-line" />
                    <Text className="record-time">{record.recordTime.substring(0, 5)}</Text>
                  </View>
                  
                  <View className="record-details">
                    <View className="record-main-info">
                      <Text className="record-label">超滤量</Text>
                      <Text className={`record-value ${(record.ultrafiltration || 0) < 0 ? 'negative' : ''}`}>
                        {record.ultrafiltration || 0} ml
                      </Text>
                    </View>
                    
                    <View className="record-secondary-info">
                      <View className="info-item">
                        <Text className="info-label">浓度</Text>
                        <Text className="info-value">{record.dialysateType}</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">引流量</Text>
                        <Text className="info-value">{record.drainageVolume} ml</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">注液量</Text>
                        <Text className="info-value">{record.infusionVolume} ml</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-records">
              <Icon value="calendar" size={48} color="#E0E0E0" />
              <Text className="empty-text">暂无记录</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染历史数据部分（包含日历和记录）
  const renderHistorySection = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const selectedDateRecord = dateData.find(item => item.date === selectedDateStr);
    const isSelectedToday = isToday(selectedDate);
    
    return (
      <View className="history-section">
        {/* 日历部分 */}
        <View className="calendar-section">
          <View className="calendar-header">
            <View className="month-navigator">
              <View className="nav-button" onClick={() => handleMonthChange("prev")}>
                <Icon value="chevron-left" size={20} color="#666666" />
              </View>
              <Text className="current-month">{format(currentDate, "yyyy年MM月")}</Text>
              <View className="nav-button" onClick={() => handleMonthChange("next")}>
                <Icon value="chevron-right" size={20} color="#666666" />
              </View>
            </View>
            
            {!isSameDay(currentDate, new Date()) && (
              <View className="today-button" onClick={goToToday}>
                <Icon value="clock" size={14} color="#666666" />
                <Text>返回今日</Text>
              </View>
            )}
          </View>
          
          <ScrollView className="calendar-container" scrollY>
            {renderCalendarGrid()}
          </ScrollView>
        </View>
        
        {/* 选中日期的记录 */}
        <View className="today-records">
          <View className="records-header">
            <Text className="records-title">
              {format(selectedDate, "MM月dd日")}记录
              {isSelectedToday && <Text className="today-tag">今天</Text>}
            </Text>
            <Text className="record-count">共 {detailedData.length} 条记录</Text>
          </View>

          {detailedData.length > 0 ? (
            <View className="records-list">
              {detailedData.map((record, index) => (
                <View key={index} className="record-item">
                  <View className="record-time-container">
                    <View className={`time-dot ${getTimeOfDay(record.recordTime)}`} />
                    <View className="time-line" />
                    <Text className="record-time">{record.recordTime.substring(0, 5)}</Text>
                  </View>
                  
                  <View className="record-details">
                    <View className="record-main-info">
                      <Text className="record-label">超滤量</Text>
                      <Text className={`record-value ${(record.ultrafiltration || 0) < 0 ? 'negative' : ''}`}>
                        {record.ultrafiltration || 0} ml
                      </Text>
                    </View>
                    
                    <View className="record-secondary-info">
                      <View className="info-item">
                        <Text className="info-label">浓度</Text>
                        <Text className="info-value">{record.dialysateType}</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">引流量</Text>
                        <Text className="info-value">{record.drainageVolume} ml</Text>
                      </View>
                      <View className="info-item">
                        <Text className="info-label">注液量</Text>
                        <Text className="info-value">{record.infusionVolume} ml</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-records">
              <Icon value="calendar" size={48} color="#E0E0E0" />
              <Text className="empty-text">暂无记录</Text>
              {!isSelectedToday && (
                <View className="go-today-button" onClick={() => {
                  setSelectedDate(new Date());
                  fetchDayDetails(format(new Date(), "yyyy-MM-dd"));
                }}>
                  <Text>查看今日记录</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 渲染底部导航栏
  const renderBottomNav = () => {
    return (
      <View className="bottom-nav">
        <View 
          className={`nav-item ${activeSection === "today" ? "active" : ""}`}
          onClick={() => {
            setActiveSection("today");
            // 如果当前选中的不是今天，切换到今天
            if (!isToday(selectedDate)) {
              setSelectedDate(new Date());
              fetchDayDetails(format(new Date(), "yyyy-MM-dd"));
            }
          }}
        >
          <Icon value="home" size={12} color={activeSection === "today" ? "#92A3FD" : "#666"} />
          <Text className="nav-text">今日指标</Text>
        </View>
        <View 
          className="nav-item add-button"
          onClick={goToAddRecord}
        >
          <Text className="add-text">记录腹透</Text>
        </View>
        <View 
          className={`nav-item ${activeSection === "history" ? "active" : ""}`}
          onClick={() => setActiveSection("history")}
        >
          <Icon value="calendar" size={12} color={activeSection === "history" ? "#92A3FD" : "#666"} />
          <Text className="nav-text">历史数据</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="historical-data-more">
      {/* 内容区域 */}
      <ScrollView scrollY className="content-area">
        {/* 内容区域 */}
        <View className="section-container">
          {activeSection === "today" && renderTodaySection()}
          {activeSection === "history" && renderHistorySection()}
        </View>
        
        {/* 底部空白区域，防止内容被底部导航栏遮挡 */}
        <View className="bottom-space" />
      </ScrollView>
      
      {/* 底部导航栏 */}
      {renderBottomNav()}
    </View>
  );
};

export default HistoricalDataMore;
