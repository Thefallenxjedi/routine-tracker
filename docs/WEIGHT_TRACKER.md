# Weight tracker — how to change it

Quick map of where weight logging lives and what each piece does.

## Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/weight-tracker.tsx` | UI: form, bar chart (1 entry), line chart (2+ entries) |
| `src/lib/actions/weight.ts` | Server action `saveWeight(date, weightKg)` — upserts to Supabase |
| `src/lib/data/dashboard.ts` | Loads `weightLogs` and `todayWeight` for the dashboard |
| `src/lib/data/preferences.ts` | Reads `weight_automatic` from `user_preferences` |
| `src/lib/actions/settings.ts` | Updates automatic vs manual mode |
| `src/components/settings/settings-panel.tsx` | Settings toggle for automatic/manual |
| `supabase/migrations/002_weight_logs.sql` | `weight_logs` table |
| `supabase/migrations/003_user_preferences.sql` | `weight_automatic` preference |

## Automatic vs manual (Settings toggle)

- **Automatic ON** (`weight_automatic: true`): After save, the form hides until you tap **Edit** (you can still change today’s weight). Uses `localStorage` key `routine-weight-{date}` as backup.
- **Automatic OFF** (`weight_automatic: false`): Form stays visible; you can edit and save again anytime.

To change this behavior, edit `showForm` in `weight-tracker.tsx`:

```ts
const showForm = !weightAutomatic || !hasLoggedToday;
```

## Chart behavior

- **1 log** → vertical bar (`singleBarHeightPct` in `weight-tracker.tsx`)
- **2+ logs** → SVG line chart with gradient fill

Change bar styling in the `chartData.length === 1` block; change the line chart in the `else` SVG block.

## Saving weight

`saveWeight` in `weight.ts` upserts on `(user_id, date)`. To allow multiple entries per day, you would need a schema change (remove unique constraint) and UI changes.

## Database

Run migrations in Supabase SQL Editor if tables are missing:

1. `002_weight_logs.sql`
2. `003_user_preferences.sql`
