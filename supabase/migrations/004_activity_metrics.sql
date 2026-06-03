-- Activity tracking: yes/no or numeric metrics (km, steps, etc.)
alter table public.activities
  add column if not exists tracking_type text not null default 'yes_no'
    check (tracking_type in ('yes_no', 'numeric')),
  add column if not exists metric_key text not null default 'yes_no',
  add column if not exists metric_label text;

alter table public.activity_logs
  add column if not exists metric_value numeric(12, 2);
