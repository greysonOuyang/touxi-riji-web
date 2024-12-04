// utils/tempFormStorage.ts
import Taro from "@tarojs/taro";

// 定义表单类型
export const FORM_TYPES = {
  BLOOD_PRESSURE: "BLOOD_PRESSURE",
  // 其他表单类型...
} as const;

type FormType = keyof typeof FORM_TYPES;

// 定义存储键
export const TEMP_FORM_KEYS = {
  [FORM_TYPES.BLOOD_PRESSURE]: "tempBloodPressureData",
  // 其他表单的key...
};

// 保存临时表单数据
export const saveTempFormData = (formType: FormType, data: any) => {
  const storageKey = TEMP_FORM_KEYS[formType];
  if (!storageKey) {
    console.error("Invalid form type:", formType);
    return;
  }
  try {
    Taro.setStorageSync(storageKey, data);
  } catch (error) {
    console.error("Failed to save temp form data:", error);
  }
};

// 修改获取临时表单数据的函数
export const getTempFormData = (formType: FormType) => {
  const storageKey = TEMP_FORM_KEYS[formType];
  if (!storageKey) {
    console.error("Invalid form type:", formType);
    return null;
  }
  try {
    const data = Taro.getStorageSync(storageKey);
    if (data) {
      // 获取后立即清除数据
      clearTempFormData(formType);
    }
    return data;
  } catch (error) {
    console.error("Failed to get temp form data:", error);
    return null;
  }
};

// 修改清除临时表单数据的函数
export const clearTempFormData = (formType: FormType) => {
  const storageKey = TEMP_FORM_KEYS[formType];
  if (!storageKey) {
    console.error("Invalid form type:", formType);
    return;
  }
  try {
    if (Taro.getStorageSync(storageKey)) {
      Taro.removeStorageSync(storageKey);
      console.log(`Cleared temp form data for ${formType}`);
    }
  } catch (error) {
    console.error("Failed to clear temp form data:", error);
  }
};

// 添加一个新的函数用于检查是否存在临时数据
export const hasTempFormData = (formType: FormType): boolean => {
  const storageKey = TEMP_FORM_KEYS[formType];
  if (!storageKey) {
    return false;
  }
  try {
    return !!Taro.getStorageSync(storageKey);
  } catch (error) {
    console.error("Failed to check temp form data:", error);
    return false;
  }
};
