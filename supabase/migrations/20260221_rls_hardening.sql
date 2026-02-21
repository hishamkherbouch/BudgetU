-- ============================================================
-- RLS Hardening Migration
-- Fixes two gaps found during launch security review:
--   1. category_budgets table was never created / has no RLS
--   2. savings_contributions is missing UPDATE + DELETE policies
-- ============================================================

-- ============================================================
-- 1. category_budgets
--    Referenced by src/lib/category-budgets.ts but never created.
--    Backfill strategy: no existing data to backfill; table is new.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.category_budgets (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_name TEXT          NOT NULL,
  monthly_limit NUMERIC(10,2) NOT NULL CHECK (monthly_limit > 0),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_name)
);

-- Composite index used by getCategoryBudgets and setCategoryBudget (upsert)
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id
  ON public.category_budgets (user_id);

-- auto-update updated_at on every UPDATE
CREATE TRIGGER set_category_budgets_updated_at
  BEFORE UPDATE ON public.category_budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- Policies (use DO blocks so re-running this migration on a DB that
-- already has the policies does not error).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'category_budgets'
      AND policyname = 'Users can read own category budgets'
  ) THEN
    CREATE POLICY "Users can read own category budgets"
      ON public.category_budgets FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'category_budgets'
      AND policyname = 'Users can insert own category budgets'
  ) THEN
    CREATE POLICY "Users can insert own category budgets"
      ON public.category_budgets FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'category_budgets'
      AND policyname = 'Users can update own category budgets'
  ) THEN
    CREATE POLICY "Users can update own category budgets"
      ON public.category_budgets FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'category_budgets'
      AND policyname = 'Users can delete own category budgets'
  ) THEN
    CREATE POLICY "Users can delete own category budgets"
      ON public.category_budgets FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================================
-- 2. savings_contributions – add missing DELETE policy
--    (UPDATE is intentionally omitted: contributions are immutable;
--     the goal's current_amount is the source of truth.)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'savings_contributions'
      AND policyname = 'Users can delete own contributions'
  ) THEN
    CREATE POLICY "Users can delete own contributions"
      ON public.savings_contributions FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ============================================================
-- 3. Verify every user-owned table has RLS enabled
--    (belt-and-suspenders: these are already enabled; re-enabling
--     is a no-op in Postgres, so this is safe to run multiple times)
-- ============================================================

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_overrides  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets        ENABLE ROW LEVEL SECURITY;
