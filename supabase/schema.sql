-- BudgetU Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

-- ============================================================
-- 1. Profiles (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  monthly_income numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. Expenses
-- ============================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  category text not null,
  description text,
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Users can read own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

-- Index for dashboard queries (current month expenses)
create index if not exists idx_expenses_user_date
  on public.expenses (user_id, date desc);

-- ============================================================
-- 3. Savings Goals
-- ============================================================
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(10,2) not null check (target_amount > 0),
  current_amount numeric(10,2) not null default 0 check (current_amount >= 0),
  is_emergency_fund boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.savings_goals enable row level security;

create policy "Users can read own goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.savings_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);
