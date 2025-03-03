import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

/**
 * 添加喝水记录请求参数
 */
export interface NewWaterIntakeRecord {
  userId: number; // 用户ID
  intakeTime: string; // 喝水时间（ISO格式，例如：2024-11-20T08:00:00）
  amount: number; // 喝水量（单位：毫升）
}

/**
 * 喝水记录类型定义
 */
export interface WaterIntakeVO {
  id: string;
  userId: string;
  amount: number; // 饮水量(ml)
  timestamp: string; // 记录时间
  date: string; // 日期，格式：YYYY-MM-DD
  remark?: string; // 备注
}

/**
 * 喝水接口响应类型
 */
export interface WaterIntakeResponse {
  [x: string]: any;
  waterIntakeRecords: WaterIntakeVO[]; // 喝水记录列表
  maxAmount: number; // 今日最大喝水量
  totalAmount: number; // 今日总喝水量
}

/**
 * 喝水统计数据类型
 */
export interface WaterStatisticsVO {
  totalAmount: number; // 总饮水量
  targetAmount: number; // 目标饮水量
  averageAmount: number; // 平均饮水量
  maxAmount: number; // 最大饮水量
  minAmount: number; // 最小饮水量
  completionDays: number; // 达标天数
  recordDays: number; // 记录天数
}

/**
 * 获取最新的喝水记录（包含今日最大喝水量）
 * @param userId 用户ID
 * @returns Promise<ApiResponse<WaterIntakeResponse>>
 */
export const getLatestWaterIntakes = (
  userId: number
): Promise<ApiResponse<WaterIntakeResponse>> => {
  return get<WaterIntakeResponse>(`/api/water-intake/latest?userId=${userId}`);
};

/**
 * 添加新的喝水记录
 * @param data NewWaterIntakeRecord
 * @returns Promise<ApiResponse<null>>
 */
export const addWaterIntakeRecord = (
  data: NewWaterIntakeRecord
): Promise<ApiResponse<null>> => {
  return post<null>("/api/water-intake/add", data);
};

/**
 * 获取指定时间范围内的喝水记录
 * @param userId 用户ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @param viewMode 视图模式 (day/week/month)
 * @returns Promise<ApiResponse<WaterIntakeVO[]>>
 */
export const getWaterIntakeRecords = (
  userId: number,
  startDate: string,
  endDate: string,
  viewMode: "day" | "week" | "month"
): Promise<ApiResponse<WaterIntakeVO[]>> => {
  return get<WaterIntakeVO[]>(
    `/api/water-intake/records/${userId}?startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
  );
};

/**
 * 获取指定时间范围内的喝水统计数据
 * @param userId 用户ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @param viewMode 视图模式 (day/week/month)
 * @returns Promise<ApiResponse<WaterStatisticsVO>>
 */
export const getWaterStatistics = (
  userId: number,
  startDate: string,
  endDate: string,
  viewMode: "day" | "week" | "month"
): Promise<ApiResponse<WaterStatisticsVO>> => {
  return get<WaterStatisticsVO>(
    `/api/water-intake/statistics/${userId}?startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
  );
};

/**
 * 添加水分摄入记录
 * @param data 水分摄入记录数据
 * @returns Promise<ApiResponse<WaterIntakeVO>>
 */
export const addWaterIntake = (data: {
  amount: number;
  timestamp?: string;
  remark?: string;
}): Promise<ApiResponse<WaterIntakeVO>> => {
  return post<WaterIntakeVO>("/api/water/intake", data);
};

/**
 * 获取水分摄入记录
 * @param params 查询参数
 * @returns Promise<ApiResponse<WaterIntakeVO[]>>
 */
export const getWaterIntakeRecordsByParams = (params: {
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<WaterIntakeVO[]>> => {
  return get<WaterIntakeVO[]>("/api/water/records", { params });
};

/**
 * 获取水分摄入统计数据
 * @param params 查询参数
 * @returns Promise<ApiResponse<WaterStatisticsVO>>
 */
export const getWaterStatisticsByParams = (params: {
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<WaterStatisticsVO>> => {
  return get<WaterStatisticsVO>("/api/water/statistics", { params });
};

/**
 * 删除水分摄入记录
 * @param id 水分摄入记录ID
 * @returns Promise<ApiResponse<null>>
 */
export const deleteWaterIntake = (id: string): Promise<ApiResponse<null>> => {
  return get<null>(`/api/water/intake/${id}`);
};

/**
 * 更新水分摄入记录
 * @param id 水分摄入记录ID
 * @param data 更新后的水分摄入记录数据
 * @returns Promise<ApiResponse<WaterIntakeVO>>
 */
export const updateWaterIntake = (id: string, data: {
  amount?: number;
  timestamp?: string;
  remark?: string;
}): Promise<ApiResponse<WaterIntakeVO>> => {
  return post<WaterIntakeVO>(`/api/water/intake/${id}`, data);
};
