type DashboardHeaderProps = {
  displayDate: string;
  userName: string;
  completed: number;
  total: number;
  rate: number;
};

export function DashboardHeader({
  displayDate,
  userName,
  completed,
  total,
  rate,
}: DashboardHeaderProps) {
  const percentage = Math.round(rate * 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-5 py-6 text-white shadow-lg shadow-emerald-900/20"
    >
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 right-12 size-24 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-sm font-medium text-emerald-100">{displayDate}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Hi, {userName}
        </h1>
        <p className="mt-2 text-sm text-emerald-100">
          {total > 0 ? (
            <>
              <span className="text-2xl font-bold text-white">{percentage}%</span>
              {" · "}
              {completed}/{total} activities done today
            </>
          ) : (
            "Create activities to start your routine"
          )}
        </p>
        {total > 0 && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-900/50">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
