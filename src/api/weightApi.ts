import { get, post } from '../utils/request';
import { ApiResponse } from '../utils/request';

// 体重记录类型定义
interface WeightRecord {
  weight: number;
  unit: string;
  updateTime: string;
}

// 获取最新的体重记录
export const fetchLatestWeight = (): Promise<ApiResponse<WeightRecord>> => {
  return get<WeightRecord>('/api/weight/latest');
};

// 添加新的体重记录
interface NewWeightRecord {
  weight: number;
}

export const addWeightRecord = (data: NewWeightRecord): Promise<ApiResponse<null>> => {
  return post<null>('/api/weight/add', data);
};
