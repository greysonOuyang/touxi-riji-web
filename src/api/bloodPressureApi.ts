// /api/bloodPressure.ts
import { get, post } from '../utils/request';
import { ApiResponse } from '../utils/request';
import Taro from "@tarojs/taro"
import { baseUrl } from "@/config"

interface BloodPressureRecord {
    id?: number;
    userId: number;
    systolic: number;
    diastolic: number;
    heartRate?: number;
    measurementTime?: string;
    createdAt?: string;
    notes?: string;
    formattedMeasurementTime?: string;
}

// 修改返回类型以支持 null 的情况
export const fetchLatestBloodPressure = async (): Promise<ApiResponse<BloodPressureRecord> | null> => {
    return get<BloodPressureRecord>('/api/bpRecord/latest');
};

export const addBloodPressureRecord = async (data: BloodPressureRecord): Promise<ApiResponse<null> | null> => {
    return post<null>('/api/bpRecord/add', data);
};

// 更新：血压趋势数据点
interface BpTrendData {
  timestamp: string;      // 数据的时间戳
  systolic: number;       // 收缩压
  diastolic: number;      // 舒张压
  heartRate?: number;     // 心率，可选字段
  
  // 新增字段
  measureCount: number;   // 数据点包含的测量次数
  hasMeasurement: boolean; // 是否有测量数据
  maxSystolic: number;    // 最高收缩压
  minSystolic: number;    // 最低收缩压
  maxDiastolic: number;   // 最高舒张压
  minDiastolic: number;   // 最低舒张压
}

// 新增：血压趋势元数据
interface BpTrendMetadata {
  dataCoverage: number;   // 数据覆盖率
  totalDays: number;      // 总天数
  daysWithData: number;   // 有数据的天数
  avgSystolic: number;    // 整体平均收缩压
  avgDiastolic: number;   // 整体平均舒张压
  avgHeartRate: number;   // 整体平均心率
}

// 新增：血压趋势响应结构
interface BpTrendResponse {
  data: BpTrendData[];
  metadata: BpTrendMetadata;
}

interface BpTrendParams {
  userId: number;
  startDate: string;
  endDate: string;
}

export const fetchBpTrendWeekly = async (params: BpTrendParams): Promise<ApiResponse<BpTrendResponse> | null> => {
  const { userId, startDate, endDate } = params;
  return get<BpTrendResponse>(`/api/bp-trend/weekly`, {
    userId,
    startDate,
    endDate
  });
};

interface BpDailyParams {
  userId: number;
  date: string; // 格式: yyyy-MM-dd
}

export const fetchBpRecordDaily = async (params: BpDailyParams): Promise<ApiResponse<BpTrendResponse> | null> => {
  const { userId, date } = params;
  return get<BpTrendResponse>('/api/bp-trend/daily', {
    userId,
    date
  });
};

interface BpMonthlyParams {
  userId: number;
  yearMonth: string; // 格式: yyyy-MM
}

export const fetchBpTrendMonthly = async (params: BpMonthlyParams): Promise<ApiResponse<BpTrendResponse> | null> => {
  const { userId, yearMonth } = params;
  return get<BpTrendResponse>('/api/bp-trend/monthly', {
    userId,
    yearMonth
  });
};

// 导出类型定义，供其他组件使用
export type { BpTrendData, BpTrendMetadata, BpTrendResponse };
