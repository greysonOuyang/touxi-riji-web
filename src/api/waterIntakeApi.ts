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
  id: number;
  userId: number;
  timeFormatted: string; // 格式化的时间（HH:mm）
  amount: number; // 喝水量，单位毫升
}

/**
 * 喝水接口响应类型
 */
export interface WaterIntakeResponse {
  waterIntakeRecords: WaterIntakeVO[]; // 喝水记录列表
  maxAmount: number; // 今日最大喝水量
  totalAmount: number; // 今日总喝水量
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
