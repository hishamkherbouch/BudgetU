# Supabase Migrations

If you get the error **"Could not find the table 'public.savings_contributions' in the schema cache"**, you need to run the migrations in your Supabase project.

## How to run migrations

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Open **SQL Editor**
3. Run the migrations in order:

### 1. Savings contributions (required for adding money to savings)

Copy and paste the contents of `supabase/migrations/20250214000000_add_savings_contributions.sql` into the SQL Editor and click **Run**.

### 2. Debts & loans (required for the Debt feature)

Copy and paste the contents of `supabase/migrations/20250214000001_add_debts.sql` into the SQL Editor and click **Run**.

---

**New project?** If you're setting up from scratch, run the full schema in `supabase/schema.sql` instead—it includes all tables.
