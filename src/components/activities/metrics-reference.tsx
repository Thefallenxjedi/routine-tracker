import { METRIC_PRESETS } from "@/lib/activity-metrics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetricsReference() {
  const numeric = METRIC_PRESETS.filter((p) => p.trackingType === "numeric");

  return (
    <Card className="border-stone-200 bg-stone-50/80">
      <CardHeader>
        <CardTitle>Tracking metrics</CardTitle>
        <CardDescription>
          Global metric types you can assign when creating an activity. Each
          activity uses one metric for its daily log.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-emerald-950">Yes / No</span>
            <Badge variant="secondary" className="text-xs">
              Checkbox
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Simple done or not — meditation, vitamins, etc.
          </p>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Number metrics
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {numeric.map((preset) => (
            <div
              key={preset.key}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-emerald-950">
                  {preset.label}
                </span>
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {preset.key === "custom" ? "custom unit" : preset.unit}
                </Badge>
              </div>
              {preset.example && (
                <p className="mt-1 text-xs text-muted-foreground">
                  e.g. {preset.example}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
