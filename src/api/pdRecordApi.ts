import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

// Base interface for PD record data
export interface PdRecordData {
  userId: number;
  recordDate: string; // ISO date string
  recordTime: string; // ISO time string
  dialysateType: string;
  infusionVolume: number;
  drainageVolume: number;
  ultrafiltration: number | null;
  notes?: string;
}

// Interface for adding a new PD record (same as PdRecordData)
export type NewPdRecord = PdRecordData;

// Interface for PD record with date grouping
export interface PdRecordDateVO {
  date: string; // ISO date string
  totalUltrafiltration: number;
  recordData: PdRecordData[];
}

// Interface for daily PD record summary
export interface PdRecordVO {
  dailyFrequency: number;
  totalUltrafiltration: number;
  totalCount: number;
  dateRecords: PdRecordData[];
}

// Interface for latest PD record
export interface LatestPdRecordDTO {
  totalUltrafiltration: number;
  latestConcentration: string;
  sequenceNumber: number;
  dailyFrequency: number;
  updateTime: string;
}

// Interface for paginated PD records
export interface PaginatedPdRecordDateVO {
  records: PdRecordDateVO[];
  total: number;
  size: number;
  current: number;
}

export interface PaginatedPdRecordDataVO {
  records: PdRecordData[];
  total: number;
  size: number;
  current: number;
}

// API Functions

/**
 * 获取用户最新的腹透记录
 */
export const getLatestPdRecord = (
  userId: number
): Promise<ApiResponse<LatestPdRecordDTO>> => {
  return get<LatestPdRecordDTO>(`/api/pd-record/latest/${userId}`);
};

/**
 * 添加新的腹透记录
 */
export const addPdRecord = (data: NewPdRecord): Promise<ApiResponse<null>> => {
  return post<null>("/api/pd-record/add", data);
};

/**
 * 检查用户是否是第一次使用（没有腹透记录）
 */
export const isFirstTimeUser = (
  userId: number
): Promise<ApiResponse<boolean>> => {
  return get<boolean>(`/api/pd-record/is-first-time/${userId}`);
};

/**
 * 获取用户指定日期的腹透记录
 */
export const getPdRecordsByDate = (
  userId: number,
  date: string
): Promise<ApiResponse<PdRecordVO>> => {
  return get<PdRecordVO>(`/api/pd-record/by-date/${userId}?date=${date}`);
};

/**
 * 获取用户的分页腹透记录
 */
export const getPaginatedPdRecords = (
  userId: number,
  pageNum: number,
  pageSize: number,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<PaginatedPdRecordDateVO>> => {
  let url = `/api/pd-record/paginated/${userId}?pageNum=${pageNum}&pageSize=${pageSize}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  return get<PaginatedPdRecordDateVO>(url);
};

export const getPaginatedPdRecordsData = (
  userId: number,
  pageNum: number,
  pageSize: number,
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<PaginatedPdRecordDataVO>> => {
  let url = `/api/pd-record/paginated/data/${userId}?pageNum=${pageNum}&pageSize=${pageSize}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  return get<PaginatedPdRecordDataVO>(url);
};

export interface PdRecordStatistics {
  minUltrafiltration: number;
  maxUltrafiltration: number;
  averageUltrafiltration: number;
}

export async function getPdRecordsStatistics(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<PdRecordStatistics> {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await get<PdRecordStatistics>(
      `/api/pd-record/statistics/${userId}`,
      params
    );

    if (response.isSuccess()) {
      return response.data;
    } else {
      throw new Error(response.msg || "Failed to fetch PD record statistics");
    }
  } catch (error) {
    console.error("Error fetching PD record statistics:", error);
    throw error;
  }
}

export interface PdAggregatedStats {
  id: number;
  userId: number;
  timeKey: string;
  timeDimension: "week" | "month" | "year";
  totalUltrafiltration: number;
  avgUltrafiltration: number;
  avgDwellTime: number;
  varianceDwellTime: number;
  actualRecords: number;
  createdAt: string;
  updatedAt: string;
  maxUltrafiltration: number;
  minUltrafiltration: number;
}

export interface DetailItem {
  key: string;
  value: number;
}

export interface AggregatedStatsVO {
  aggregatedStats: PdAggregatedStats;
  details: DetailItem[];
}

export interface StatsQuery {
  userId: number;
  timeDimension: "week" | "month" | "year";
  timeKey: string;
}

export const getStats = async (
  query: StatsQuery
): Promise<ApiResponse<AggregatedStatsVO>> => {
  const params = new URLSearchParams({
    userId: query.userId.toString(),
    timeDimension: query.timeDimension,
    timeKey: query.timeKey,
  });
  const url = `/api/stats?${params.toString()}`;
  console.log(`Sending request to: ${url}`);
  try {
    const response = await get<AggregatedStatsVO>(url);
    console.log(`Response received:`, response);
    return response;
  } catch (error) {
    console.error(`Error in getStats:`, error);
    throw error;
  }
};
