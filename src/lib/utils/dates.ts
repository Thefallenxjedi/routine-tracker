import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekRange(referenceDate: Date = new Date()) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
    days: eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd")),
  };
}

export function getMonthRange(referenceDate: Date = new Date()) {
  const start = startOfMonth(referenceDate);
  const end = endOfMonth(referenceDate);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
    days: eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd")),
  };
}

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, "MMM d");
}

export function formatDayLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return format(date, "EEE");
}
