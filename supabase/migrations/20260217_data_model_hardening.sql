-- ============================================================
-- STEP 3: Data Model Hardening
-- 3.1 Add updated_at fields + auto-update triggers
-- 3.2 Add indexes on savings_goals and debts
-- 3.3 Category system
-- ============================================================

-- 3.1a: Create the trigger function (reusable for all tables)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3.1b: Add updated_at to tables missing it
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.savings_contributions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.debt_payments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.income_entries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3.1c: Create triggers on ALL user-owned tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles', 'expenses', 'savings_goals', 'savings_contributions',
    'debts', 'debt_payments', 'income_entries'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', tbl);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW
       EXECUTE FUNCTION public.handle_updated_at()',
      tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 3.2: Add indexes on tables missing them
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id
  ON public.savings_goals (user_id);

CREATE INDEX IF NOT EXISTS idx_debts_user_id
  ON public.debts (user_id);

-- ============================================================
-- 3.3: Category system
-- ============================================================

-- 3.3a: Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, name)
);

-- 3.3b: Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read default and own categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (user_id = auth.uid() AND is_default = false);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (user_id = auth.uid() AND is_default = false);

-- 3.3c: Seed default categories
INSERT INTO public.categories (user_id, name, is_default) VALUES
  (NULL, 'Food', true),
  (NULL, 'Rent/Housing', true),
  (NULL, 'Transport', true),
  (NULL, 'Entertainment', true),
  (NULL, 'Shopping', true),
  (NULL, 'Education', true),
  (NULL, 'Utilities', true),
  (NULL, 'Other', true)
ON CONFLICT (user_id, name) DO NOTHING;

-- 3.3d: Add category_id FK to expenses
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3.3e: Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category_id
  ON public.expenses (category_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id
  ON public.categories (user_id);
