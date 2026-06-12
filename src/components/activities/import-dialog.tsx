"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { importCsvData } from "@/lib/actions/import";
import { parseCsvFile } from "@/lib/import/parse-csv";
import type { CsvImportPreview } from "@/lib/import/types";
import { getActivityMetricLabel } from "@/lib/activity-metrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }

    setFileName(file.name);
    const result = await parseCsvFile(file);
    setPreview(result);

    if (result.activities.length === 0) {
      toast.error("Could not parse activities from this file");
    }
  }

  function handleImport() {
    if (!preview || preview.activities.length === 0) return;

    startTransition(async () => {
      const result = await importCsvData({
        activities: preview.activities,
        logs: preview.logs,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      const parts = [
        result.createdActivities > 0
          ? `${result.createdActivities} new activities`
          : null,
        result.reusedActivities > 0
          ? `${result.reusedActivities} existing matched`
          : null,
        result.importedLogs > 0
          ? `${result.importedLogs} log entries`
          : null,
      ].filter(Boolean);

      toast.success(`Import complete: ${parts.join(", ")}`);
      if (result.warnings.length > 0) {
        toast.warning(result.warnings[0]);
      }

      handleOpenChange(false);
      router.refresh();
    });
  }

  const blockingWarning = preview?.warnings.some(
    (w) =>
      w.startsWith("File too large") ||
      w.startsWith("First column") ||
      w === "File is empty" ||
      w === "No data rows found" ||
      w === "No activity columns found in header row"
  );

  const canImport = Boolean(
    preview && preview.activities.length > 0 && !blockingWarning
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Import from CSV
            <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
              Beta
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Export your Google Sheet as CSV (File → Download → Comma-separated
            values), then upload it here to create activities and backfill
            history. This feature is in beta — review the preview before
            importing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <a
            href="/templates/routine-import-template.csv"
            download
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
          >
            <Download className="size-4 shrink-0" />
            Download Routine template
          </a>

          <div
            className={cn(
              "rounded-lg border-2 border-dashed border-stone-200 bg-white p-6 text-center transition-colors",
              "hover:border-emerald-300 hover:bg-emerald-50/30"
            )}
          >
            <FileSpreadsheet className="mx-auto size-8 text-emerald-600" />
            <p className="mt-2 text-sm font-medium text-stone-800">
              Upload your spreadsheet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              First column = dates, other columns = activities
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-4 border-stone-300"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              Choose CSV file
            </Button>
            {fileName && (
              <p className="mt-2 text-xs text-stone-500">{fileName}</p>
            )}
          </div>

          {preview && (
            <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="font-medium text-emerald-900">
                  {preview.activities.length} activities
                </span>
                <span className="text-stone-600">
                  {preview.logs.length} log entries
                </span>
                {preview.dateRange && (
                  <span className="text-stone-600">
                    {preview.dateRange.start} → {preview.dateRange.end}
                  </span>
                )}
              </div>

              <div className="max-h-32 overflow-y-auto rounded-md border border-stone-200 bg-white p-2">
                <ul className="space-y-1 text-xs text-stone-700">
                  {preview.activities.slice(0, 12).map((a) => (
                    <li key={a.name} className="flex justify-between gap-2">
                      <span className="truncate font-medium">{a.name}</span>
                      <span className="shrink-0 text-stone-500">
                        {a.category} ·{" "}
                        {a.tracking_type === "yes_no"
                          ? "Yes/No"
                          : getActivityMetricLabel({
                              ...a,
                              id: "",
                              user_id: "",
                              is_active: true,
                              created_at: "",
                            })}
                      </span>
                    </li>
                  ))}
                  {preview.activities.length > 12 && (
                    <li className="text-stone-400">
                      +{preview.activities.length - 12} more
                    </li>
                  )}
                </ul>
              </div>

              {preview.warnings.length > 0 && (
                <ul className="space-y-1 text-xs text-amber-800">
                  {preview.warnings.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              )}

              {preview.logs.length > 0 && (
                <p className="text-xs text-stone-500">
                  Existing logs for the same activity and date will be updated.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={!canImport || isPending}
            onClick={handleImport}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importing…
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
