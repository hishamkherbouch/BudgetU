-- Add general_savings_balance column to profiles table
-- This stores unallocated savings not tied to a specific goal
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS general_savings_balance NUMERIC DEFAULT 0 NOT NULL;
