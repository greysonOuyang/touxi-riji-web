import { get, post } from '../utils/request';
import { ApiResponse } from '../utils/request'; // 引入封装类

// 血压记录类型定义
interface BloodPressureRecord {
    id?: number; // 可选，因为在获取最新记录时可能没有
    userId: number;
    systolic: number;
    diastolic: number;
    heartRate?: number; // 可选，可能不是每次都提供
    measurementTime?: string; // 可选，可能在创建时不提供
    createdAt?: string; // 可选，创建时间
    notes?: string; // 可选，备注
    formattedMeasurementTime?: string;// 格式化时间
}

// 获取最新的血压记录
export const fetchLatestBloodPressure = (): Promise<ApiResponse<BloodPressureRecord>> => {
    return get<BloodPressureRecord>('/api/bpRecord/latest');
};

// 添加新的血压记录
export const addBloodPressureRecord = (data: BloodPressureRecord): Promise<ApiResponse<null>> => {
    return post<null>('/api/bpRecord/add', data);
};