-- BudgetU Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

-- ============================================================
-- 1. Profiles (extends Supabase auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  monthly_income numeric(10,2) default 0,
  income_frequency text not null default 'monthly' check (income_frequency in ('weekly', 'biweekly', 'bimonthly', 'monthly')),
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

-- ============================================================
-- 4. Savings Contributions (tracks when users add to goals)
-- ============================================================
create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz default now()
);

alter table public.savings_contributions enable row level security;

create policy "Users can read own contributions"
  on public.savings_contributions for select
  using (auth.uid() = user_id);

create policy "Users can insert own contributions"
  on public.savings_contributions for insert
  with check (auth.uid() = user_id);

-- Index for YTD and monthly queries
create index if not exists idx_savings_contributions_user_date
  on public.savings_contributions (user_id, date desc);

-- ============================================================
-- 5. Debts / Loans
-- ============================================================
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  debt_type text not null check (debt_type in ('student_loan', 'credit_card', 'car_loan', 'other')),
  principal numeric(10,2) not null check (principal >= 0),
  interest_rate numeric(5,2) not null default 0 check (interest_rate >= 0),
  loan_length_months integer check (loan_length_months is null or loan_length_months > 0),
  monthly_payment numeric(10,2) not null default 0 check (monthly_payment >= 0),
  due_day integer check (due_day is null or (due_day >= 1 and due_day <= 28)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.debts enable row level security;

create policy "Users can read own debts"
  on public.debts for select using (auth.uid() = user_id);
create policy "Users can insert own debts"
  on public.debts for insert with check (auth.uid() = user_id);
create policy "Users can update own debts"
  on public.debts for update using (auth.uid() = user_id);
create policy "Users can delete own debts"
  on public.debts for delete using (auth.uid() = user_id);

-- ============================================================
-- 6. Debt Payments (tracks each payment; reduces budget)
-- ============================================================
create table if not exists public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  date date not null default current_date,
  is_extra boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table public.debt_payments enable row level security;

create policy "Users can read own debt payments"
  on public.debt_payments for select using (auth.uid() = user_id);
create policy "Users can insert own debt payments"
  on public.debt_payments for insert with check (auth.uid() = user_id);
create policy "Users can update own debt payments"
  on public.debt_payments for update using (auth.uid() = user_id);
create policy "Users can delete own debt payments"
  on public.debt_payments for delete using (auth.uid() = user_id);

create index if not exists idx_debt_payments_user_date
  on public.debt_payments (user_id, date desc);

-- ============================================================
-- 7. Income Entries (tracks money received)
-- ============================================================
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
