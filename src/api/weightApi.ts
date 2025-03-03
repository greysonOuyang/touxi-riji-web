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

// 体重数据点类型
export interface WeightDataPoint {
  date: string; // 日期，格式：YYYY-MM-DD
  timestamp: string; // 时间戳，格式：YYYY-MM-DD HH:mm:ss
  weight: number; // 体重值
  bodyWaterPercentage?: number; // 身体水分比例（可选）
  note?: string; // 备注信息（可选）
  scaleType: string; // 称重方式
  hasMeasurement: boolean; // 是否有测量数据
  formattedDate?: string; // 格式化后的日期，如"周一"、"1月1日"等
}

// 体重统计数据类型
export interface WeightStatisticsVO {
  averageWeight: number; // 平均体重
  maxWeight: number; // 最高体重
  minWeight: number; // 最低体重
  weightChange: number; // 体重变化（最后一次记录与第一次记录的差值）
  standardWeight: number; // 标准体重（根据身高计算）
  weightFluctuation: number; // 体重波动（最大值与最小值的差）
  dataCoverage: number; // 数据覆盖率（0-1之间的值）
  totalMeasurements: number; // 总测量次数
  abnormalCount: number; // 异常记录次数
}

// BMI数据类型
export interface BmiDataVO {
  bmiValue: number; // BMI值
  bmiCategory: string; // BMI分类（偏瘦/正常/超重/肥胖）
  height: number; // 身高（厘米）
  weight: number; // 当前体重（公斤）
  idealWeightMin: number; // 理想体重范围最小值
  idealWeightMax: number; // 理想体重范围最大值
  bmiPercentile: number; // BMI在刻度上的百分比位置（0-100）
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

/**
 * 获取指定时间范围内的体重记录
 * @param userId 用户ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @param viewMode 视图模式 (day/week/month)
 * @returns Promise<ApiResponse<WeightDataPoint[]>>
 */
export const getWeightRecords = (
  userId: number,
  startDate: string,
  endDate: string,
  viewMode: "day" | "week" | "month"
): Promise<ApiResponse<WeightDataPoint[]>> => {
  return get<WeightDataPoint[]>(
    `/api/weight/records/${userId}?startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
  );
};

/**
 * 获取指定时间范围内的体重统计数据
 * @param userId 用户ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @param viewMode 视图模式 (day/week/month)
 * @returns Promise<ApiResponse<WeightStatisticsVO>>
 */
export const getWeightStatistics = (
  userId: number,
  startDate: string,
  endDate: string,
  viewMode: "day" | "week" | "month"
): Promise<ApiResponse<WeightStatisticsVO>> => {
  return get<WeightStatisticsVO>(
    `/api/weight/statistics/${userId}?startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
  );
};

/**
 * 获取用户的BMI数据
 * @param userId 用户ID
 * @returns Promise<ApiResponse<BmiDataVO>>
 */
export const getBmiData = (userId: number): Promise<ApiResponse<BmiDataVO>> => {
  return get<BmiDataVO>(`/api/weight/bmi/${userId}`);
};
