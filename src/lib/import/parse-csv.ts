import Papa from "papaparse";
import { format, isValid, parseISO } from "date-fns";
import { inferActivityFromColumn, parseCellToLog } from "@/lib/import/infer-activity";
import type { CsvImportPreview, ImportLogEntry } from "@/lib/import/types";

export const MAX_CSV_BYTES = 500 * 1024;

const DATE_HEADER_PATTERN = /^(date|day)$/i;

function normalizeDateString(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = parseISO(`${value}T12:00:00`);
    return isValid(d) ? value : null;
  }

  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, a, b, year] = slash;
    const m = Number(a);
    const d = Number(b);
    const y = Number(year);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const date = new Date(y, m - 1, d);
      if (isValid(date)) {
        return format(date, "yyyy-MM-dd");
      }
    }
  }

  const parsed = parseISO(value);
  if (isValid(parsed)) {
    return format(parsed, "yyyy-MM-dd");
  }

  return null;
}

function isMatrixHeader(row: string[]): boolean {
  const first = row[0]?.trim() ?? "";
  return DATE_HEADER_PATTERN.test(first);
}

function computeDateRange(logs: ImportLogEntry[]) {
  if (logs.length === 0) return null;
  const dates = logs.map((l) => l.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

function parseMatrixRows(
  headers: string[],
  dataRows: string[][]
): CsvImportPreview {
  const warnings: string[] = [];
  let skippedRows = 0;

  const activityHeaders = headers.slice(1).filter((h) => h.trim());
  if (activityHeaders.length === 0) {
    return {
      activities: [],
      logs: [],
      warnings: ["No activity columns found in header row"],
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    };
  }

  const columnValues: string[][] = activityHeaders.map(() => []);
  for (const row of dataRows) {
    activityHeaders.forEach((_, i) => {
      columnValues[i].push(row[i + 1] ?? "");
    });
  }

  const activities = activityHeaders.map((header, i) =>
    inferActivityFromColumn(header, columnValues[i])
  );

  const logs: ImportLogEntry[] = [];

  for (const row of dataRows) {
    const dateRaw = row[0]?.trim() ?? "";
    const date = normalizeDateString(dateRaw);
    if (!date) {
      if (dateRaw) {
        warnings.push(`Skipped row with invalid date: "${dateRaw}"`);
      }
      skippedRows += 1;
      continue;
    }

    activityHeaders.forEach((_, i) => {
      const activity = activities[i];
      const cell = row[i + 1] ?? "";
      const parsed = parseCellToLog(cell, activity);
      if (!parsed) return;

      logs.push({
        activityName: activity.name,
        date,
        completed: parsed.completed,
        metric_value: parsed.metric_value,
      });
    });
  }

  if (logs.length === 0 && dataRows.length > 0) {
    warnings.push(
      "No log entries found — use yes/x/1 for habits or numbers for metrics"
    );
  }

  return {
    activities,
    logs,
    warnings,
    format: "matrix",
    dateRange: computeDateRange(logs),
    skippedRows,
  };
}

export function parseCsvText(text: string): CsvImportPreview {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      activities: [],
      logs: [],
      warnings: ["File is empty"],
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    };
  }

  const withoutComments = trimmed
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  const parsed = Papa.parse<string[]>(withoutComments, {
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return {
      activities: [],
      logs: [],
      warnings: parsed.errors.map((e) => e.message),
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    };
  }

  const rows = parsed.data.filter((row) => row.some((cell) => cell?.trim()));
  if (rows.length < 1) {
    return {
      activities: [],
      logs: [],
      warnings: ["No data rows found"],
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    };
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  if (!isMatrixHeader(headers)) {
    return {
      activities: [],
      logs: [],
      warnings: [
        'First column must be "Date". Add one column per activity (any names you want).',
      ],
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    };
  }

  return parseMatrixRows(headers, dataRows);
}

export function parseCsvFile(file: File): Promise<CsvImportPreview> {
  if (file.size > MAX_CSV_BYTES) {
    return Promise.resolve({
      activities: [],
      logs: [],
      warnings: [`File too large (max ${MAX_CSV_BYTES / 1024}KB)`],
      format: "matrix",
      dateRange: null,
      skippedRows: 0,
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      resolve(parseCsvText(text));
    };
    reader.onerror = () => {
      resolve({
        activities: [],
        logs: [],
        warnings: ["Failed to read file"],
        format: "matrix",
        dateRange: null,
        skippedRows: 0,
      });
    };
    reader.readAsText(file);
  });
}
