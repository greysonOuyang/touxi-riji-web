import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

// 用户信息类型定义
export interface UserProfileVO {
  userId: number;
  username: string;
  avatarUrl: string;
  name: string;
  gender: string;
  age: number;
  bloodType: string;
  dialysisStartDate: string;
  comorbidities: string;
  height: number;
  weight: number;
}

/**
 * 获取用户个人信息
 * @param userId 用户ID
 * @returns Promise<ApiResponse<UserProfileVO>>
 */
export const getUserProfile = (
  userId: number
): Promise<ApiResponse<UserProfileVO>> => {
  return get<UserProfileVO>(`/api/user/profile/${userId}`);
};
