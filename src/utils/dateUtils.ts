/**
 * 日期工具函数
 */

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式化字符串，例如 "yyyy-MM-dd HH:mm:ss"
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return format
    .replace(/yyyy/g, year.toString())
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/dd/g, day.toString().padStart(2, '0'))
    .replace(/HH/g, hours.toString().padStart(2, '0'))
    .replace(/mm/g, minutes.toString().padStart(2, '0'))
    .replace(/ss/g, seconds.toString().padStart(2, '0'));
}

/**
 * 获取日期是当月的第几周
 * @param date 日期对象
 * @returns 周数
 */
export function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDay.getDay() || 7; // 如果是周日，则为7
  const offset = dayOfWeek - 1; // 调整为周一为一周的开始
  const day = date.getDate();
  return Math.ceil((day + offset) / 7);
}

/**
 * 获取一周的开始日期（周一）
 * @param date 日期对象
 * @returns 周一的日期对象
 */
export function getStartOfWeek(date: Date): Date {
  const day = date.getDay() || 7; // 如果是周日，则为7
  const diff = day - 1; // 调整为周一为一周的开始
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - diff);
  return startOfWeek;
}

/**
 * 获取一周的结束日期（周日）
 * @param date 日期对象
 * @returns 周日的日期对象
 */
export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
}

/**
 * 获取当前日期
 * @returns 当前日期对象
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * 判断两个日期是否是同一天
 * @param date1 日期对象1
 * @param date2 日期对象2
 * @returns 是否是同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
} 