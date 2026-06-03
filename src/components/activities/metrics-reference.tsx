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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tracking metrics</CardTitle>
        <CardDescription className="text-xs">
          Metric types available when you create an activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-emerald-950">Yes / No</span>
          <Badge variant="secondary" className="text-xs">
            checkbox
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {numeric.map((preset) => (
            <Badge
              key={preset.key}
              variant="secondary"
              className="text-xs font-normal"
            >
              {preset.label}
              {preset.unit ? ` (${preset.unit})` : ""}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
