"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { importCsvData } from "@/lib/actions/import";
import { parseCsvFile } from "@/lib/import/parse-csv";
import type { CsvImportPreview } from "@/lib/import/types";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
} from "@/types/database";
import { cn } from "@/lib/utils";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [categoryByActivity, setCategoryByActivity] = useState<
    Record<string, ActivityCategory>
  >({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!preview) {
      setCategoryByActivity({});
      return;
    }
    const next: Record<string, ActivityCategory> = {};
    for (const a of preview.activities) {
      next[a.name] = categoryByActivity[a.name] ?? a.category ?? "General";
    }
    setCategoryByActivity(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset categories when preview changes
  }, [preview]);

  function reset() {
    setPreview(null);
    setCategoryByActivity({});
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

    const activities = preview.activities.map((a) => ({
      ...a,
      category: categoryByActivity[a.name] ?? "General",
    }));

    startTransition(async () => {
      const result = await importCsvData({
        activities,
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
            Export your Google Sheet as CSV, upload it here, map categories, then
            import. You can change metric units later under Activities → Edit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50/80 p-3 text-xs text-stone-700">
            <p className="font-semibold text-stone-900">How to fill your sheet</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Row 1: <strong>Date</strong> in column A, then any activity names
              </li>
              <li>
                Done: <strong>yes</strong>, <strong>x</strong>, <strong>1</strong>,{" "}
                <strong>done</strong>
              </li>
              <li>Not done: leave the cell empty</li>
              <li>Numbers: type the value only (Routine detects numeric columns)</li>
            </ul>
          </div>

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

              <div>
                <Label className="text-xs text-muted-foreground">
                  Map each activity to a category
                </Label>
                <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                  {preview.activities.map((a) => (
                    <li
                      key={a.name}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-stone-200 bg-white px-2 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
                        {a.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        {a.tracking_type === "yes_no" ? "Yes/No" : "Number"}
                      </Badge>
                      <Select
                        value={categoryByActivity[a.name] ?? "General"}
                        onValueChange={(v) =>
                          setCategoryByActivity((prev) => ({
                            ...prev,
                            [a.name]: v as ActivityCategory,
                          }))
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-[120px] shrink-0 text-xs"
                          aria-label={`Category for ${a.name}`}
                        >
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </li>
                  ))}
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
