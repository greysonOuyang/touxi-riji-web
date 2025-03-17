import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date, formatStr: string): string => {
  return format(date, formatStr, { locale: zhCN });
};

export const getWeekDays = (date: Date): string[] => {
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const currentDay = date.getDay();
  const result: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const index = (currentDay + i) % 7;
    result.push(weekDays[index]);
  }
  
  return result;
};

export const getMonthDays = (date: Date): string[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);
}; 