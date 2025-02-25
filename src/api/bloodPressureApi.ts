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

interface BpTrendData {
  timestamp: string;      // 数据的时间戳，通常是日期或日期+时间
  systolic: number;       // 收缩压
  diastolic: number;      // 舒张压
  heartRate?: number;     // 心率，可选字段
}

interface BpTrendParams {
  userId: number;
  timeSpan: string;
  startDate: string;
  endDate: string;
}

export const fetchBpTrendWeekly = async (params: BpTrendParams): Promise<ApiResponse<BpTrendData[]> | null> => {
  const { userId, timeSpan, startDate, endDate } = params;
  return get<BpTrendData[]>(`/api/bp-trend/weekly`, {
    userId,
    timeSpan,
    startDate,
    endDate
  });
};

interface BpRecordDto {
  id: number;
  userId: number;
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measurementTime: string;
  notes?: string;
}

interface BpDailyParams {
  userId: number;
  date: string; // 格式: yyyy-MM-dd
}

export const fetchBpRecordDaily = async (params: BpDailyParams): Promise<ApiResponse<BpRecordDto[]> | null> => {
  const { userId, date } = params;
  return get<BpRecordDto[]>('/api/bp-trend/daily', {
    userId,
    date
  });
};

interface BpMonthlyParams {
  userId: number;
  yearMonth: string; // 格式: yyyy-MM
}

export const fetchBpTrendMonthly = async (params: BpMonthlyParams): Promise<ApiResponse<BpTrendData[]> | null> => {
  const { userId, yearMonth } = params;
  return get<BpTrendData[]>('/api/bp-trend/monthly', {
    userId,
    yearMonth
  });
};
