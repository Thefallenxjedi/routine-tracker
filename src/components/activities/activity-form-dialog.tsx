"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createActivity,
  updateActivity,
} from "@/lib/actions/activities";
import { METRIC_PRESETS } from "@/lib/activity-metrics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  type Activity,
  type ActivityCategory,
} from "@/types/database";

type ActivityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity;
};

export function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
}: ActivityFormDialogProps) {
  const [name, setName] = useState(activity?.name ?? "");
  const [category, setCategory] = useState<ActivityCategory>(
    (activity?.category as ActivityCategory) ?? "General"
  );
  const [metricKey, setMetricKey] = useState(activity?.metric_key ?? "yes_no");
  const [customLabel, setCustomLabel] = useState(activity?.metric_label ?? "");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!activity;

  const selectedPreset = METRIC_PRESETS.find((p) => p.key === metricKey);
  const isCustom = metricKey === "custom";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(activity?.name ?? "");
      setCategory((activity?.category as ActivityCategory) ?? "General");
      setMetricKey(activity?.metric_key ?? "yes_no");
      setCustomLabel(activity?.metric_label ?? "");
    }
    onOpenChange(nextOpen);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = isEditing
        ? await updateActivity(
            activity.id,
            name,
            category,
            metricKey,
            customLabel
          )
        : await createActivity(name, category, metricKey, customLabel);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Activity updated" : "Activity created");
      onOpenChange(false);
      setName("");
      setCategory("General");
      setMetricKey("yes_no");
      setCustomLabel("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Activity" : "New Activity"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update name, category, or how you track this activity."
                : "Add an activity and choose how you want to log it each day."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Run, Walk, Read"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ActivityCategory)}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <div className="space-y-2">
                <Label htmlFor="metric">Tracking metric</Label>
                <Select
                  value={metricKey}
                  onValueChange={(v) => setMetricKey(v ?? "yes_no")}
                >
                  <SelectTrigger id="metric" className="w-full">
                    <SelectValue placeholder="Choose metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_PRESETS.map((preset) => (
                      <SelectItem key={preset.key} value={preset.key}>
                        {preset.trackingType === "yes_no"
                          ? preset.label
                          : `${preset.label} (${preset.unit || "custom"})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreset?.example && (
                  <p className="text-xs text-muted-foreground">
                    Good for: {selectedPreset.example}
                  </p>
                )}
              </div>

              {isCustom && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="custom-unit">Custom unit label</Label>
                  <Input
                    id="custom-unit"
                    placeholder="e.g. miles, glasses, sets"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    required
                  />
                </div>
              )}

              {selectedPreset &&
                selectedPreset.trackingType === "numeric" &&
                !isCustom && (
                  <p className="mt-2 text-xs text-emerald-800">
                    Daily checklist: enter a number in{" "}
                    <strong>{selectedPreset.unit}</strong>.
                  </p>
                )}

              {metricKey === "yes_no" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Daily checklist: tap the checkmark when done.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
