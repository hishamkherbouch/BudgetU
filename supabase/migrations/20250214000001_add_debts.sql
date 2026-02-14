-- Add debts and debt_payments tables
-- Run in Supabase SQL Editor if you already have the base schema

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
