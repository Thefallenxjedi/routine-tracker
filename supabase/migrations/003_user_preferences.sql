-- Per-user app preferences
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weight_automatic boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
