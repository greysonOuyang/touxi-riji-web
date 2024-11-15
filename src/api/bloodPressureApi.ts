// /api/bloodPressure.ts
import { get, post } from '../utils/request';
import { ApiResponse } from '../utils/request';

interface BloodPressureRecord {
    id?: number;
    userId: number;
    systolic: number;
    diastolic: number;
    heartRate?: number;
    measurementTime?: string;
    createdAt?: string;
    notes?: string;
    formattedMeasurementTime?: string;
}

// 修改返回类型以支持 null 的情况
export const fetchLatestBloodPressure = async (): Promise<ApiResponse<BloodPressureRecord> | null> => {
    return get<BloodPressureRecord>('/api/bpRecord/latest');
};

export const addBloodPressureRecord = async (data: BloodPressureRecord): Promise<ApiResponse<null> | null> => {
    return post<null>('/api/bpRecord/add', data);
};
