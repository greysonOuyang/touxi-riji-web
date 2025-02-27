// 血压分类标准
export const BP_CATEGORIES = {
  NORMAL: { name: "正常", color: "#4CAF50", className: "normal" },
  ELEVATED: { name: "血压偏高", color: "#FFC107", className: "elevated" },
  HYPERTENSION_1: { name: "高血压一级", color: "#FF9800", className: "hypertension-1" },
  HYPERTENSION_2: { name: "高血压二级", color: "#F44336", className: "hypertension-2" },
  HYPERTENSION_CRISIS: { name: "高血压危象", color: "#D32F2F", className: "hypertension-crisis" },
  LOW: { name: "低血压", color: "#2196F3", className: "low" },
};

// 根据收缩压和舒张压判断血压分类
export const getBPCategory = (systolic: number, diastolic: number) => {
  // 先判断高血压危象
  if (systolic >= 180 || diastolic >= 120) {
    return BP_CATEGORIES.HYPERTENSION_CRISIS;
  } 
  // 再判断高血压二级
  else if (systolic >= 140 || diastolic >= 90) {
    return BP_CATEGORIES.HYPERTENSION_2;
  } 
  // 再判断高血压一级
  else if (systolic >= 130 || diastolic >= 80) {
    return BP_CATEGORIES.HYPERTENSION_1;
  } 
  // 再判断血压偏高
  else if (systolic >= 120 && diastolic < 80) {
    return BP_CATEGORIES.ELEVATED;
  } 
  // 再判断低血压
  else if (systolic < 90 || diastolic < 60) {
    return BP_CATEGORIES.LOW;
  } 
  // 最后是正常血压
  else {
    return BP_CATEGORIES.NORMAL;
  }
};

// 获取血压状态提醒
export const getBPStatusAlert = (systolic: number, diastolic: number) => {
  const category = getBPCategory(systolic, diastolic);
  
  if (category === BP_CATEGORIES.HYPERTENSION_CRISIS) {
    return {
      message: "血压值处于高血压危象范围，请立即就医",
      type: "warning"
    };
  }
  
  if (category === BP_CATEGORIES.HYPERTENSION_2) {
    return {
      message: "血压值处于高血压二级范围，建议咨询医生",
      type: "warning"
    };
  }
  
  if (category === BP_CATEGORIES.HYPERTENSION_1) {
    return {
      message: "血压值处于高血压一级范围，请注意监测",
      type: "notice"
    };
  }
  
  if (category === BP_CATEGORIES.LOW) {
    return {
      message: "血压值偏低，请注意监测",
      type: "notice"
    };
  }
  
  if (category === BP_CATEGORIES.ELEVATED) {
    return {
      message: "血压略高于正常范围，建议保持健康生活方式",
      type: "notice"
    };
  }
  
  return {
    message: "血压状况良好，请继续保持",
    type: "good"
  };
};

// 检查是否为异常血压
export const isAbnormalBP = (systolic: number, diastolic: number) => {
  const category = getBPCategory(systolic, diastolic);
  return (
    category === BP_CATEGORIES.HYPERTENSION_1 ||
    category === BP_CATEGORIES.HYPERTENSION_2 ||
    category === BP_CATEGORIES.HYPERTENSION_CRISIS ||
    category === BP_CATEGORIES.LOW
  );
}; 