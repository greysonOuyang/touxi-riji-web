import { get, post } from '../utils/request';
import { ApiResponse } from '../utils/request';

// 体重记录类型定义
export interface WeightComparisonVO {
  latestWeight: number;
  weightChange: number;
  latestMeasureTime: string;
  comparisonInfo: string;
}

// 添加新的体重记录请求参数
export interface NewWeightRecord {
  userId: number;
  weight: number;
  measurementDatetime: string;
  scaleType: string;
}


/**
 * 获取最新的体重记录（包含比较数据）
 * @param userId 用户ID
 * @returns Promise<ApiResponse<WeightComparisonVO>>
 */
export const getLatestWeight = (userId: number): Promise<ApiResponse<WeightComparisonVO>> => {
  return get<WeightComparisonVO>(`/api/weight/latest/${userId}`);
};


/**
 * 添加新的体重记录
 * @param data NewWeightRecord
 * @returns Promise<ApiResponse<null>>
 */
export const addWeightRecord = (data: NewWeightRecord): Promise<ApiResponse<null>> => {
  return post<null>('/api/weight/add', data);
};
