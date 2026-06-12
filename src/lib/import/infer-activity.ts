import { getMetricPreset, METRIC_PRESETS } from "@/lib/activity-metrics";
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  type TrackingType,
} from "@/types/database";
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

export function parseActivityHeader(raw: string): {
  name: string;
  category: ActivityCategory;
  unitHint: string | null;
} {
  let header = raw.trim();
  let category: ActivityCategory = "General";
  let unitHint: string | null = null;

  const bracket = header.match(/^(.+?)\s*\[([^\]]+)\]\s*$/);
  if (bracket) {
    header = bracket[1].trim();
    const cat = bracket[2].trim();
    if (ACTIVITY_CATEGORIES.includes(cat as ActivityCategory)) {
      category = cat as ActivityCategory;
    }
  }

  const paren = header.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    header = paren[1].trim();
    unitHint = paren[2].trim();
  }

  return { name: header, category, unitHint };
}

function resolveMetricFromUnitHint(
  unitHint: string | null
): Pick<ImportActivityDefinition, "tracking_type" | "metric_key" | "metric_label"> {
  if (!unitHint) {
    return {
      tracking_type: "yes_no",
      metric_key: "yes_no",
      metric_label: null,
    };
  }

  const lower = unitHint.toLowerCase();
  const byUnit = METRIC_PRESETS.find(
    (p) => p.unit.toLowerCase() === lower || p.key.toLowerCase() === lower
  );
  if (byUnit && byUnit.key !== "yes_no") {
    return {
      tracking_type: byUnit.trackingType,
      metric_key: byUnit.key,
      metric_label: byUnit.key === "custom" ? unitHint : null,
    };
  }

  return {
    tracking_type: "numeric",
    metric_key: "custom",
    metric_label: unitHint,
  };
}

export function inferActivityFromColumn(
  header: string,
  columnValues: string[]
): ImportActivityDefinition {
  const { name, category, unitHint } = parseActivityHeader(header);
  const nonEmpty = columnValues.map((v) => v.trim()).filter(Boolean);

  const hasNumeric = nonEmpty.some((v) => isNumericCell(v));
  const hasYesNo = nonEmpty.some((v) => isYesNoCell(v));

  if (hasNumeric && !hasYesNo) {
    const fromHint = resolveMetricFromUnitHint(unitHint);
    if (fromHint.metric_key !== "yes_no") {
      return { name, category, ...fromHint };
    }
    return {
      name,
      category,
      tracking_type: "numeric",
      metric_key: "custom",
      metric_label: unitHint ?? "units",
    };
  }

  if (unitHint) {
    const fromHint = resolveMetricFromUnitHint(unitHint);
    if (fromHint.tracking_type === "numeric") {
      return { name, category, ...fromHint };
    }
  }

  return {
    name,
    category,
    tracking_type: "yes_no",
    metric_key: "yes_no",
    metric_label: null,
  };
}

export function parseManifestActivity(row: Record<string, string>): {
  activity: ImportActivityDefinition | null;
  warning?: string;
} {
  const name = (row.name ?? row.activity ?? "").trim();
  if (!name) {
    return { activity: null, warning: "Skipped row with empty activity name" };
  }

  const categoryRaw = (row.category ?? "General").trim();
  const category = ACTIVITY_CATEGORIES.includes(categoryRaw as ActivityCategory)
    ? (categoryRaw as ActivityCategory)
    : "General";

  const trackingType = (row.tracking_type ?? row.type ?? "yes_no").trim() as TrackingType;
  const metricKey = (row.metric_key ?? row.metric ?? "yes_no").trim();
  const customUnit = (row.custom_unit ?? row.unit ?? "").trim();

  if (trackingType === "numeric" || metricKey !== "yes_no") {
    const preset = getMetricPreset(metricKey);
    if (metricKey === "custom") {
      if (!customUnit) {
        return {
          activity: null,
          warning: `Activity "${name}" needs custom_unit for custom metric`,
        };
      }
      return {
        activity: {
          name,
          category,
          tracking_type: "numeric",
          metric_key: "custom",
          metric_label: customUnit,
        },
      };
    }
    if (preset && preset.key !== "yes_no") {
      return {
        activity: {
          name,
          category,
          tracking_type: "numeric",
          metric_key: preset.key,
          metric_label: null,
        },
      };
    }
    return {
      activity: {
        name,
        category,
        tracking_type: "numeric",
        metric_key: "custom",
        metric_label: customUnit || "units",
      },
    };
  }

  return {
    activity: {
      name,
      category,
      tracking_type: "yes_no",
      metric_key: "yes_no",
      metric_label: null,
    },
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
