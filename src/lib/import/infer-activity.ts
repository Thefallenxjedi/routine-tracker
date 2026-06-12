import type { ImportActivityDefinition } from "@/lib/import/types";

const YES_PATTERN = /^(x|yes|y|1|true|done)$/i;

export function isYesNoCell(value: string): boolean {
  return YES_PATTERN.test(value.trim());
}

export function isNumericCell(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || isYesNoCell(trimmed)) return false;
  const n = Number(trimmed);
  return !Number.isNaN(n) && Number.isFinite(n);
}

export function inferActivityFromColumn(
  header: string,
  columnValues: string[]
): ImportActivityDefinition {
  const name = header.trim();
  const nonEmpty = columnValues.map((v) => v.trim()).filter(Boolean);

  const hasNumeric = nonEmpty.some((v) => isNumericCell(v));
  const hasYesNo = nonEmpty.some((v) => isYesNoCell(v));

  if (hasNumeric && !hasYesNo) {
    return {
      name,
      category: "General",
      tracking_type: "numeric",
      metric_key: "custom",
      metric_label: null,
    };
  }

  return {
    name,
    category: "General",
    tracking_type: "yes_no",
    metric_key: "yes_no",
    metric_label: null,
  };
}

export function parseCellToLog(
  raw: string,
  activity: ImportActivityDefinition
): { completed: boolean; metric_value: number | null } | null {
  const value = raw.trim();
  if (!value) return null;

  if (activity.tracking_type === "numeric") {
    if (isYesNoCell(value)) {
      return { completed: true, metric_value: 1 };
    }
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return null;
    return { completed: n > 0, metric_value: n };
  }

  if (isYesNoCell(value)) {
    return { completed: true, metric_value: null };
  }

  const n = Number(value);
  if (!Number.isNaN(n) && n > 0) {
    return { completed: true, metric_value: null };
  }

  return null;
}

export function normalizeActivityName(name: string): string {
  return name.trim().toLowerCase();
}
