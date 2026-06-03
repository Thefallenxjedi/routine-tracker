type DashboardHeaderProps = {
  displayDate: string;
  userName: string;
};

export function DashboardHeader({ displayDate, userName }: DashboardHeaderProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-100/90 px-5 py-5 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-emerald-950">
        Hi, {userName}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{displayDate}</p>
    </div>
  );
}
