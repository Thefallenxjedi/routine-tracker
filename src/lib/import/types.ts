import type { ActivityCategory, TrackingType } from "@/types/database";

export type ImportActivityDefinition = {
  name: string;
  category: ActivityCategory;
  tracking_type: TrackingType;
  metric_key: string;
  metric_label: string | null;
};

export type ImportLogEntry = {
  activityName: string;
  date: string;
  completed: boolean;
  metric_value: number | null;
};

export type CsvImportPreview = {
  activities: ImportActivityDefinition[];
  logs: ImportLogEntry[];
  warnings: string[];
  format: "matrix" | "manifest";
  dateRange: { start: string; end: string } | null;
  skippedRows: number;
};

export type ImportCsvPayload = {
  activities: ImportActivityDefinition[];
  logs: ImportLogEntry[];
};

export type ImportSummary = {
  createdActivities: number;
  reusedActivities: number;
  importedLogs: number;
  skippedRows: number;
  warnings: string[];
};
