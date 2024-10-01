export interface HealthCardData {
    id: string;
    title: string;
    value: string;
    unit?: string;
    isFullWidth: boolean;
  }
  
  export const cardLayout: HealthCardData[] = [
    { id: '1', title: '体重', value: '65', unit: 'kg', isFullWidth: false },
    { id: '2', title: '血压', value: '120/80', unit: 'mmHg', isFullWidth: false },
    { id: '3', title: '心率', value: '75', unit: 'bpm', isFullWidth: false },
    { id: '4', title: '血糖', value: '5.5', unit: 'mmol/L', isFullWidth: false },
    { id: '5', title: '尿量', value: '1500', unit: 'ml', isFullWidth: true },
    { id: '6', title: '透析时间', value: '4', unit: '小时', isFullWidth: false },
    { id: '7', title: '干体重', value: '63', unit: 'kg', isFullWidth: false },
    { id: '8', title: '超滤量', value: '2.5', unit: 'L', isFullWidth: false },
    { id: '9', title: '血磷', value: '1.8', unit: 'mmol/L', isFullWidth: false },
    { id: '10', title: '血钾', value: '4.5', unit: 'mmol/L', isFullWidth: false },
    { id: '11', title: '每日饮水量', value: '500', unit: 'ml', isFullWidth: true },
    { id: '12', title: '血红蛋白', value: '110', unit: 'g/L', isFullWidth: false },
  ];