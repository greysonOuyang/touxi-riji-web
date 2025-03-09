import { get, post, put, deleted } from "../utils/request";
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
  recommendedLimit: number; // 建议饮水上限 (原 targetAmount)
  averageAmount: number; // 平均饮水量
  maxAmount: number; // 最大饮水量
  recordDays: number; // 记录天数
  completionRate: number; // 达标率 (不超过限制的天数比例)
}

/**
 * 喝水时间分布数据类型
 */
export interface WaterIntakeTimeDistributionVO {
  // 按时间段分布
  periodDistribution: {
    period: string; // 时间段名称
    amount: number; // 该时间段饮水量
    percentage: number; // 该时间段饮水量占比
    recordCount: number; // 记录次数
  }[];
  // 按小时分布
  hourlyDistribution: {
    hour: number; // 小时(0-23)
    amount: number; // 该小时饮水量
    percentage: number; // 该小时饮水量占比
    recordCount: number; // 记录次数
  }[];
  // 最佳饮水时间段
  bestPeriod: string;
  // 饮水间隔
  averageInterval: number; // 平均间隔(分钟)
}

/**
 * 喝水习惯分析数据类型
 */
export interface WaterIntakeHabitVO {
  // 饮水规律性
  regularity: {
    score: number; // 规律性得分(0-100)
    level: string; // 规律性等级
    analysis: string; // 分析结果描述
  };
  // 日间分布特征
  dailyPattern: {
    pattern: string; // 分布模式
    description: string; // 模式描述
  };
  // 工作日vs周末对比
  weekdayVsWeekend: {
    weekdayAverage: number; // 工作日平均值
    weekendAverage: number; // 周末平均值
    difference: number; // 差异百分比
  };
  // 改进建议
  suggestions: string[];
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
    `/api/water-intake/records?userId=${userId}&startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
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
    `/api/water-intake/statistics?userId=${userId}&startDate=${startDate}&endDate=${endDate}&viewMode=${viewMode}`
  );
};

/**
 * 添加水分摄入记录（简化版）
 * @param userId 用户ID
 * @param data 水分摄入记录数据
 * @returns Promise<ApiResponse<WaterIntakeVO>>
 */
export const addWaterIntake = (
  userId: number,
  data: {
    amount: number;
    timestamp?: string;
    remark?: string;
  }
): Promise<ApiResponse<WaterIntakeVO>> => {
  return post<WaterIntakeVO>(`/api/water-intake/intake?userId=${userId}`, data);
};

/**
 * 根据参数获取水分摄入记录
 * @param userId 用户ID
 * @param params 查询参数
 * @returns Promise<ApiResponse<WaterIntakeVO[]>>
 */
export const getWaterIntakeRecordsByParams = (
  userId: number,
  params: {
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<WaterIntakeVO[]>> => {
  return get<WaterIntakeVO[]>(
    `/api/water-intake/records-by-params?userId=${userId}${
      params.startDate ? `&startDate=${params.startDate}` : ""
    }${params.endDate ? `&endDate=${params.endDate}` : ""}`
  );
};

/**
 * 根据参数获取水分摄入统计数据
 * @param userId 用户ID
 * @param params 查询参数
 * @returns Promise<ApiResponse<WaterStatisticsVO>>
 */
export const getWaterStatisticsByParams = (
  userId: number,
  params: {
    startDate?: string;
    endDate?: string;
    viewMode?: "day" | "week" | "month";
  }
): Promise<ApiResponse<WaterStatisticsVO>> => {
  return get<WaterStatisticsVO>(
    `/api/water-intake/statistics-by-params?userId=${userId}${
      params.startDate ? `&startDate=${params.startDate}` : ""
    }${params.endDate ? `&endDate=${params.endDate}` : ""}${
      params.viewMode ? `&viewMode=${params.viewMode}` : ""
    }`
  );
};

/**
 * 删除水分摄入记录
 * @param id 水分摄入记录ID
 * @param userId 用户ID
 * @returns Promise<ApiResponse<null>>
 */
export const deleteWaterIntake = (
  id: string,
  userId: number
): Promise<ApiResponse<null>> => {
  return deleted<null>(`/api/water-intake/${id}?userId=${userId}`);
};

/**
 * 更新水分摄入记录
 * @param id 水分摄入记录ID
 * @param userId 用户ID
 * @param data 更新后的水分摄入记录数据
 * @returns Promise<ApiResponse<WaterIntakeVO>>
 */
export const updateWaterIntake = (
  id: string,
  userId: number,
  data: {
    amount?: number;
    timestamp?: string;
    remark?: string;
  }
): Promise<ApiResponse<WaterIntakeVO>> => {
  return put<WaterIntakeVO>(`/api/water-intake/${id}?userId=${userId}`, data);
};

/**
 * 获取用户喝水时间分布
 * @param userId 用户ID
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @returns Promise<ApiResponse<WaterIntakeTimeDistributionVO>>
 */
export const getWaterIntakeTimeDistribution = (
  userId: number,
  startDate: string,
  endDate: string
): Promise<ApiResponse<WaterIntakeTimeDistributionVO>> => {
  return get<WaterIntakeTimeDistributionVO>(
    `/api/water-intake/time-distribution?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
  );
};

/**
 * 获取用户喝水习惯分析
 * @param userId 用户ID
 * @param days 分析天数，默认30天
 * @returns Promise<ApiResponse<WaterIntakeHabitVO>>
 */
export const getWaterIntakeHabitAnalysis = (
  userId: number,
  days: number = 30
): Promise<ApiResponse<WaterIntakeHabitVO>> => {
  return get<WaterIntakeHabitVO>(
    `/api/water-intake/habit-analysis?userId=${userId}&days=${days}`
  );
};
