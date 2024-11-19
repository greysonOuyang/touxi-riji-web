import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

// 尿量记录类型定义
export interface UrineRecordVO {
  totalVolume: number; // 总尿量
  latestUpdateTime: string; // 最近更新时间描述
}

// 添加新的尿量记录请求参数
export interface NewUrineRecord {
  userId: number; // 用户ID
  volume: number; // 尿量（单位：毫升）
  recordedTime: string; // 记录时间（ISO格式）
  notes?: string; // 备注（可选）
  tag?: string; // 时间段标签（可选）
}

/**
 * 获取用户最近一天的尿量总和和更新时间信息
 * @param userId 用户ID
 * @returns Promise<ApiResponse<UrineRecordVO>>
 */
export const getRecentUrineStats = (
  userId: number
): Promise<ApiResponse<UrineRecordVO>> => {
  return get<UrineRecordVO>(`/api/urine-records/recent-stats?userId=${userId}`);
};

/**
 * 添加新的尿量记录
 * @param data NewUrineRecord
 * @returns Promise<ApiResponse<null>>
 */
export const addUrineRecord = (
  data: NewUrineRecord
): Promise<ApiResponse<null>> => {
  return post<null>("/api/urine-records/add", data);
};
