import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

// 透析计划详情
export interface PdDailySchedule {
  sequence: number;
  timeSlot: string;
  concentration: string;
  volume: number;
}

// 透析方案详情
export interface PdPlanVO {
  id: number;
  userId: string;
  dailyFrequency: number;
  startDate: string;
  status: number;
  schedules: PdDailySchedule[];
  createdAt?: string;
  updatedAt?: string;
}

// 创建透析方案请求参数
export interface PdPlanDTO {
  userId: string;
  dailyFrequency: number;
  startDate: string;
  schedules: {
    sequence: number;
    timeSlot: string;
    concentration: string;
    volume: number;
  }[];
}

/**
 * 创建新的透析方案
 * @param data PdPlanDTO 透析方案数据
 * @returns Promise<ApiResponse<number>> 返回方案ID
 */
export const createPdPlan = (data: PdPlanDTO): Promise<ApiResponse<number>> => {
  return post<number>("/api/pd-plan/create", data);
};

/**
 * 获取当前使用中的透析方案
 * @param userId 用户ID
 * @returns Promise<ApiResponse<PdPlanVO>> 返回透析方案详情
 */
export const getCurrentPdPlan = (
  userId: string
): Promise<ApiResponse<PdPlanVO>> => {
  return get<PdPlanVO>(`/api/pd-plan/current?userId=${userId}`);
};

// 根据需要可以添加更多的类型定义和API方法
export interface PdPlanListQuery {
  userId: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface PdPlanListVO {
  records: PdPlanVO[];
  total: number;
  pages: number;
  current: number;
  size: number;
}

/**
 * 获取透析方案历史记录
 * @param query PdPlanListQuery 查询参数
 * @returns Promise<ApiResponse<PdPlanListVO>> 返回分页数据
 */
export const getPdPlanHistory = (
  query: PdPlanListQuery
): Promise<ApiResponse<PdPlanListVO>> => {
  return get<PdPlanListVO>("/api/pd-plan/list", { params: query });
};

/**
 * 修改透析方案
 * @param planId 方案ID
 * @param data PdPlanDTO 更新的方案数据
 * @returns Promise<ApiResponse<null>>
 */
export const updatePdPlan = (
  planId: number,
  data: PdPlanDTO
): Promise<ApiResponse<null>> => {
  return post<null>(`/api/pd-plan/update/${planId}`, data);
};
