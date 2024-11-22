import { get, post } from "../utils/request";
import { ApiResponse } from "../utils/request";

interface UserSetting {
  id?: number;
  userId: number;
  feature: string;
  configKey: string;
  value: string; // JSON 格式的字符串
  createdAt?: string;
  updatedAt?: string;
}

// 获取特定功能的用户设置
export const fetchUserSettings = async (
  userId: number,
  feature: string
): Promise<ApiResponse<UserSetting[]> | null> => {
  return get<UserSetting[]>(`/api/user-settings/${userId}/${feature}`);
};

// 新增或更新用户设置
export const saveUserSetting = async (
  data: UserSetting
): Promise<ApiResponse<null> | null> => {
  return post<null>("/api/user-settings", data);
};

// 根据 userId, feature, key 查询配置的 value
export const fetchSettingValue = async (
  userId: number,
  feature: string,
  configKey: string
): Promise<ApiResponse<string> | null> => {
  return get<string>(
    `/api/user-settings/value?userId=${userId}&feature=${feature}&key=${configKey}`
  );
};

// 新增喝水标签的接口
export const saveWaterTags = async (
  userId: number,
  tags: string // 标签数组
): Promise<ApiResponse<null> | null> => {
  const data: UserSetting = {
    userId,
    feature: "water_card",
    configKey: "tags",
    value: tags,
  };
  return saveUserSetting(data);
};

// /api/userSettings.ts
export const fetchWaterTags = async (
  userId: number
): Promise<ApiResponse<string[]> | null> => {
  return await get<string[]>(
    `/api/user-settings/value?userId=${userId}&feature=water_card&key=tags`
  );
};
