// /utils/tempFormStorage.ts
import Taro from '@tarojs/taro';

const TEMP_FORM_KEYS = {
  BLOOD_PRESSURE: 'tempBloodPressureData',
  // 添加其他表单的key
};

// 检查是否有未提交的数据
export const hasUnsubmittedData = (): boolean => {
  try {
    return Object.values(TEMP_FORM_KEYS).some(key => {
      const data = Taro.getStorageSync(key);
      return !!data;
    });
  } catch (error) {
    console.error('检查临时数据失败:', error);
    return false;
  }
};

// 清除所有临时表单数据
export const clearAllTempFormData = (): void => {
  try {
    Object.values(TEMP_FORM_KEYS).forEach(key => {
      Taro.removeStorageSync(key);
    });
    console.log('所有临时表单数据已清除');
  } catch (error) {
    console.error('清除临时表单数据失败:', error);
  }
};

// 保存临时表单数据
export const saveTempFormData = (key: string, data: any): void => {
  try {
    if (TEMP_FORM_KEYS[key]) {
      Taro.setStorageSync(TEMP_FORM_KEYS[key], data);
    }
  } catch (error) {
    console.error('保存临时表单数据失败:', error);
  }
};

// 获取临时表单数据
export const getTempFormData = (key: string): any => {
  try {
    if (TEMP_FORM_KEYS[key]) {
      return Taro.getStorageSync(TEMP_FORM_KEYS[key]);
    }
    return null;
  } catch (error) {
    console.error('获取临时表单数据失败:', error);
    return null;
  }
};

// 清除特定的临时表单数据
export const clearTempFormData = (key: string): void => {
  try {
    if (TEMP_FORM_KEYS[key]) {
      Taro.removeStorageSync(TEMP_FORM_KEYS[key]);
    }
  } catch (error) {
    console.error('清除临时表单数据失败:', error);
  }
};
