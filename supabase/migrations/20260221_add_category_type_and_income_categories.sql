-- ============================================================
-- Category type + income_entries.category_id
-- ============================================================

-- 1. Add type column to categories
--    'expense' = shown only on expense forms
--    'income'  = shown only on income forms
--    'both'    = shown on both (reserved for future use)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'expense'
  CHECK (type IN ('expense', 'income', 'both'));

-- 2. Explicitly tag all current default categories as 'expense'
UPDATE public.categories
  SET type = 'expense'
  WHERE is_default = true AND user_id IS NULL;

-- 3. Seed default income categories
--    Use a safe INSERT that skips rows that already exist by name.
--    (The UNIQUE constraint on (user_id, name) uses NULLs-distinct semantics,
--     so we guard with NOT EXISTS instead of ON CONFLICT.)
INSERT INTO public.categories (user_id, name, type, is_default)
SELECT s.user_id, s.name, s.type, s.is_default
FROM (VALUES
  (NULL::uuid, 'Paycheck',     'income', true),
  (NULL::uuid, 'Freelance',    'income', true),
  (NULL::uuid, 'Scholarship',  'income', true),
  (NULL::uuid, 'Financial Aid','income', true),
  (NULL::uuid, 'Investment',   'income', true),
  (NULL::uuid, 'Gift',         'income', true),
  (NULL::uuid, 'Tax Refund',   'income', true),
  (NULL::uuid, 'Other Income', 'income', true)
) AS s(user_id, name, type, is_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c
  WHERE c.user_id IS NULL AND c.name = s.name
);

-- 4. Add category_id FK to income_entries
ALTER TABLE public.income_entries
  ADD COLUMN IF NOT EXISTS category_id UUID
  REFERENCES public.categories(id) ON DELETE SET NULL;

-- 5. Index for join queries on income_entries.category_id
CREATE INDEX IF NOT EXISTS idx_income_entries_category_id
  ON public.income_entries (category_id);
