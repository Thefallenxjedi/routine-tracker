import { eachDayOfInterval, format, parseISO, subDays } from "date-fns";

export type DateRangePreset = "week" | "month" | "custom";

export function resolveDateRange(
  preset: DateRangePreset,
  today: string,
  customStart: string,
  customEnd: string
): { start: string; end: string; days: string[]; label: string } {
  const todayDate = parseISO(`${today}T12:00:00`);

  if (preset === "week") {
    const start = format(subDays(todayDate, 6), "yyyy-MM-dd");
    const days = eachDayOfInterval({
      start: parseISO(`${start}T12:00:00`),
      end: todayDate,
    }).map((d) => format(d, "yyyy-MM-dd"));
    return { start, end: today, days, label: "Last 7 days" };
  }

  if (preset === "month") {
    const start = format(subDays(todayDate, 29), "yyyy-MM-dd");
    const days = eachDayOfInterval({
      start: parseISO(`${start}T12:00:00`),
      end: todayDate,
    }).map((d) => format(d, "yyyy-MM-dd"));
    return { start, end: today, days, label: "Last 30 days" };
  }

  const start = customStart <= customEnd ? customStart : customEnd;
  const end = customStart <= customEnd ? customEnd : customStart;
  if (!start || !end) {
    return resolveDateRange("week", today, customStart, customEnd);
  }

  const days = eachDayOfInterval({
    start: parseISO(`${start}T12:00:00`),
    end: parseISO(`${end}T12:00:00`),
  }).map((d) => format(d, "yyyy-MM-dd"));

  return { start, end, days, label: `${start} → ${end}` };
}
