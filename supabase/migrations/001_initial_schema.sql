-- activities
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- activity_logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  date date not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (activity_id, date)
);

create index idx_activities_user_id on public.activities(user_id);
create index idx_activity_logs_activity_date on public.activity_logs(activity_id, date);
create index idx_activity_logs_date on public.activity_logs(date);

alter table public.activities enable row level security;
alter table public.activity_logs enable row level security;

create policy "Users manage own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own logs"
  on public.activity_logs for all
  using (
    exists (
      select 1 from public.activities
      where activities.id = activity_logs.activity_id
        and activities.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.activities
      where activities.id = activity_logs.activity_id
        and activities.user_id = auth.uid()
    )
  );
