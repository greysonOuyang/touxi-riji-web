import { get, post, put } from "../utils/request";
import { ApiResponse } from "../utils/request";

// 用户信息类型定义
export interface UserProfileVO {
  userId: number;
  userName: string;
  avatarUrl: string;
  avatarBase64: string;
  name: string;
  gender: string;
  age: number;
  bloodType: string;
  birthDate: string;
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

/**
 * 更新用户个人信息
 * @param userId 用户ID
 * @param profileData 要更新的用户信息（部分字段）
 * @returns Promise<ApiResponse<void>>
 */
export const updateUserProfile = (
  userId: number,
  profileData: Partial<UserProfileVO>
): Promise<ApiResponse<void>> => {
  return put<void>(`/api/user/profile/update/${userId}`, profileData);
};
