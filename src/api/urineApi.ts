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
  volume: number;       // 尿量总和 (后端返回Double)
  count: number;        // 记录次数 (后端返回Integer)
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
  // 新增字段，与后端UrineStatisticsVO对应
  averageSingleVolume?: number; // 平均单次尿量
  abnormalCount?: number;       // 异常次数
  abnormalPercentage?: number;  // 异常比例
  totalVolume?: number;         // 总尿量
  trendAnalysis?: any;          // 趋势分析
}

// 更新尿量记录请求参数
export interface UpdateUrineRecord {
  id: number;           // 记录ID
  volume?: number;      // 尿量（毫升）
  recordedTime?: string; // 记录时间
  notes?: string;       // 备注
  tag?: string;         // 时间段标签
}




// 尿量时间分布数据项
export interface UrineTimeDistributionItemVO {
  period: string;      // 时间段名称
  count: number;       // 记录数量
  percentage: number;  // 百分比
  totalVolume: number; // 总尿量
  avgVolume: number;   // 平均尿量
}

// 尿量时间分布数据列表
export interface UrineTimeDistributionListVO {
  items: UrineTimeDistributionItemVO[]; // 时间分布数据项列表
  totalCount: number;                   // 总记录数
  totalVolume: number;                  // 总尿量
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
): Promise<ApiResponse<string>> => {
  return post<string>("/api/urine-records/add", data);
};

/**
 * 获取用户尿量历史记录
 * @param params UrineHistoryParams
 * @returns Promise<ApiResponse<Page<UrineHistoryItem>>>
 */
export const getUrineHistory = (
  params: UrineHistoryParams
): Promise<ApiResponse<{
  records: UrineHistoryItem[];
  total: number;
  size: number;
  current: number;
  pages: number;
}>> => {
  return get<{
    records: UrineHistoryItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  }>('/api/urine-records/history', params);
};



/**
 * 获取用户尿量统计数据
 * @param userId 用户ID
 * @param period 统计周期，可选 'day', 'week', 'month'
 * @param startDate 开始日期（可选，ISO格式）
 * @param endDate 结束日期（可选，ISO格式）
 * @param viewMode 视图模式，可选 'day', 'week', 'month'
 * @returns Promise<ApiResponse<UrineStatistics>>
 */
export const getUrineStatistics = (
  userId: number,
  period: 'day' | 'week' | 'month' = 'week',
  startDate?: string,
  endDate?: string,
  viewMode?: 'day' | 'week' | 'month'
): Promise<ApiResponse<UrineStatistics>> => {
  let url = `/api/urine-records/statistics?userId=${userId}&period=${period}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (viewMode) url += `&viewMode=${viewMode}`;
  return get<UrineStatistics>(url);
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

/**
 * 获取排尿时间分布数据
 * @param userId 用户ID
 * @param period 周期（day, week, month）
 * @param startDate 开始日期（可选）
 * @param endDate 结束日期（可选）
 * @returns Promise<ApiResponse<UrineTimeDistributionListVO>>
 */
export const getUrineTimeDistribution = (
  userId: number,
  period: 'day' | 'week' | 'month' = 'week',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<UrineTimeDistributionListVO>> => {
  let url = `/api/urine-records/time-distribution?userId=${userId}&period=${period}`;
  
  if (startDate) {
    url += `&startDate=${encodeURIComponent(startDate)}`;
  }
  
  if (endDate) {
    url += `&endDate=${encodeURIComponent(endDate)}`;
  }
  
  return get<UrineTimeDistributionListVO>(url);
};


