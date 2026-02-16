-- Add income_frequency to profiles
alter table public.profiles
  add column if not exists income_frequency text not null default 'monthly'
  check (income_frequency in ('weekly', 'biweekly', 'bimonthly', 'monthly'));

-- Income entries table
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  source text not null,
  description text,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.income_entries enable row level security;

create policy "Users can read own income entries"
  on public.income_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own income entries"
  on public.income_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own income entries"
  on public.income_entries for delete
  using (auth.uid() = user_id);

create policy "Users can update own income entries"
  on public.income_entries for update
  using (auth.uid() = user_id);

create index if not exists idx_income_entries_user_date
  on public.income_entries (user_id, date desc);
