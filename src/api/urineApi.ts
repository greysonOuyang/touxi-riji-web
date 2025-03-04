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
  recordedTime?: string; // 记录时间（ISO格式）
  notes?: string; // 备注（可选）
  tag?: string; // 时间段标签（可选）
}

// 尿量历史记录列表项
export interface UrineHistoryItem {
  id: number;           // 记录ID
  userId: number;       // 用户ID
  volume: number;       // 尿量（毫升）
  recordedTime: string; // 记录时间
  notes?: string;       // 备注
  tag?: string;         // 时间段标签
}

// 获取历史记录请求参数
export interface UrineHistoryParams {
  userId: number;       // 用户ID
  startDate?: string;   // 开始日期（ISO格式）
  endDate?: string;     // 结束日期（ISO格式）
  pageSize?: number;    // 每页记录数
  pageNum?: number;     // 页码
}

// 尿量趋势数据点
export interface UrineTrendPoint {
  date: string;         // 日期（ISO格式或YYYY-MM-DD）
  volume: number;       // 尿量总和
  count: number;        // 记录次数
}

// 尿量趋势图数据
export interface UrineTrendData {
  points: UrineTrendPoint[];    // 数据点列表
  averageLine: number;          // 平均线
  targetLine?: number;          // 目标线（可选）
}

// 尿量统计数据
export interface UrineStatistics {
  dailyAverage: number;         // 日均尿量
  weeklyAverage: number;        // 周均尿量
  monthlyAverage: number;       // 月均尿量
  totalRecords: number;         // 记录总数
  lowestVolume: number;         // 最低尿量
  highestVolume: number;        // 最高尿量
  trend: 'up' | 'down' | 'stable'; // 趋势
}

// 更新尿量记录请求参数
export interface UpdateUrineRecord {
  id: number;           // 记录ID
  volume?: number;      // 尿量（毫升）
  recordedTime?: string; // 记录时间
  notes?: string;       // 备注
  tag?: string;         // 时间段标签
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

/**
 * 获取用户尿量历史记录
 * @param params UrineHistoryParams
 * @returns Promise<ApiResponse<UrineHistoryItem[]>>
 */
export const getUrineHistory = (
  params: UrineHistoryParams
): Promise<ApiResponse<UrineHistoryItem[]>> => {
  return get<UrineHistoryItem[]>('/api/urine-records/history', params);
};

/**
 * 获取用户尿量趋势图数据
 * @param userId 用户ID
 * @param period 统计周期，可选 'week', 'month', 'year'
 * @param startDate 开始日期（ISO格式）
 * @param endDate 结束日期（ISO格式）
 * @returns Promise<ApiResponse<UrineTrendData>>
 */
export const getUrineTrend = (
  userId: number,
  period: 'week' | 'month' | 'year',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<UrineTrendData>> => {
  let url = `/api/urine-records/trend?userId=${userId}&period=${period}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  return get<UrineTrendData>(url);
};

/**
 * 获取用户尿量统计数据
 * @param userId 用户ID
 * @param period 统计周期，可选 'day', 'week', 'month'
 * @returns Promise<ApiResponse<UrineStatistics>>
 */
export const getUrineStatistics = (
  userId: number,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<ApiResponse<UrineStatistics>> => {
  return get<UrineStatistics>(`/api/urine-records/statistics?userId=${userId}&period=${period}`);
};

/**
 * 更新尿量记录
 * @param data UpdateUrineRecord
 * @returns Promise<ApiResponse<null>>
 */
export const updateUrineRecord = (
  data: UpdateUrineRecord
): Promise<ApiResponse<null>> => {
  return post<null>('/api/urine-records/update', data);
};

/**
 * 删除尿量记录
 * @param recordId 记录ID
 * @param userId 用户ID
 * @returns Promise<ApiResponse<null>>
 */
export const deleteUrineRecord = (
  recordId: number,
  userId: number
): Promise<ApiResponse<null>> => {
  return post<null>('/api/urine-records/delete', { recordId, userId });
};
