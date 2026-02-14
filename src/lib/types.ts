export type Profile = {
  id: string;
  display_name: string | null;
  monthly_income: number;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  is_emergency_fund: boolean;
  created_at: string;
  updated_at: string;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Rent/Housing",
  "Transport",
  "Entertainment",
  "Shopping",
  "Education",
  "Utilities",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
