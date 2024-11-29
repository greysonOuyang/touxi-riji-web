import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

// 最新腹透记录数据类型定义
export interface LatestPdRecordDTO {
  totalUltrafiltration: number;
  latestConcentration: string;
  sequenceNumber: number;
  dailyFrequency: number;
  updateTime: string;
}

// 添加新的腹透记录请求参数
export interface NewPdRecord {
  userId: number;
  recordDate: string;
  recordTime: string;
  dialysateType: string;
  infusionVolume: number;
  drainageVolume: number;
  notes?: string;
}

/**
 * 获取用户最新的腹透记录
 * @param userId 用户ID
 * @returns Promise<ApiResponse<LatestPdRecordDTO>>
 */
export const getLatestPdRecord = (
  userId: number
): Promise<ApiResponse<LatestPdRecordDTO>> => {
  return get<LatestPdRecordDTO>(`/api/pd-record/latest/${userId}`);
};

/**
 * 添加新的腹透记录
 * @param data NewPdRecord
 * @returns Promise<ApiResponse<null>>
 */
export const addPdRecord = (data: NewPdRecord): Promise<ApiResponse<null>> => {
  return post<null>("/api/pd-record/add", data);
};

/**
 * 检查用户是否是第一次使用（没有腹透记录）
 * @param userId 用户ID
 * @returns Promise<ApiResponse<boolean>>
 */
export const isFirstTimeUser = (
  userId: number
): Promise<ApiResponse<boolean>> => {
  return get<boolean>(`/api/pd-record/is-first-time/${userId}`);
};
