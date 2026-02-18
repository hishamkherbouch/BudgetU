-- Recurring transactions table
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(10,2) not null check (amount > 0),
  category text,
  category_id uuid references public.categories(id) on delete set null,
  source text,
  description text,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  start_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.recurring_transactions enable row level security;

create policy "Users can view own recurring transactions"
  on public.recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurring transactions"
  on public.recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurring transactions"
  on public.recurring_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own recurring transactions"
  on public.recurring_transactions for delete
  using (auth.uid() = user_id);

-- Indexes
create index idx_recurring_transactions_user_active
  on public.recurring_transactions (user_id, is_active);

-- updated_at trigger
create trigger handle_recurring_transactions_updated_at
  before update on public.recurring_transactions
  for each row execute function handle_updated_at();
