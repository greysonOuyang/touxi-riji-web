// types/bloodPressure.ts
export interface BloodPressureRecord {
    id?: number;
    userId: number;
    systolic: number;
    diastolic: number;
    heartRate: number;
    measurementTime: string;
    createdAt?: string;
    notes?: string;
  }
  
  export interface BloodPressureFormData {
    systolic: string;
    diastolic: string;
    heartRate: string;
    date: string;
    time: string;
  }
  
  // 血压数据范围常量
  export const BP_RANGES = {
    SYSTOLIC: {
      MIN: 60,
      MAX: 250
    },
    DIASTOLIC: {
      MIN: 40,
      MAX: 150
    },
    HEART_RATE: {
      MIN: 40,
      MAX: 200
    }
  } as const;
  
  // 存储键名常量
  export const STORAGE_KEYS = {
    TEMP_BP_DATA: 'tempBloodPressureData',
    REDIRECT_URL: 'redirectUrl'
  } as const;
  