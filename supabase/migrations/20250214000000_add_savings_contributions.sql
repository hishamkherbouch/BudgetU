-- Add savings_contributions table to track when users add money to savings
-- This enables: (1) deducting savings from budget, (2) year-to-date savings tracking
-- Run in Supabase SQL Editor if you already have the base schema

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

create index if not exists idx_savings_contributions_user_date
  on public.savings_contributions (user_id, date desc);
