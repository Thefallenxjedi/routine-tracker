-- weight_logs: daily weight tracking per user
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 2) not null check (weight_kg > 0 and weight_kg < 500),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index idx_weight_logs_user_date on public.weight_logs(user_id, date);

alter table public.weight_logs enable row level security;

create policy "Users manage own weight logs"
  on public.weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
