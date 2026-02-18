export type IncomeFrequency = "weekly" | "biweekly" | "bimonthly" | "monthly";

export type Profile = {
  id: string;
  display_name: string | null;
  monthly_income: number;
  income_frequency: IncomeFrequency;
  general_savings_balance: number;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  category_id: string | null;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  is_emergency_fund: boolean;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Transport",
  "Subscriptions",
  "Education",
  "Entertainment",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type DebtType = "student_loan" | "credit_card" | "car_loan" | "other";

export type Debt = {
  id: string;
  user_id: string;
  name: string;
  debt_type: DebtType;
  principal: number;
  interest_rate: number;
  loan_length_months: number | null;
  monthly_payment: number;
  due_day: number | null;
  created_at: string;
  updated_at: string;
};

export type DebtPayment = {
  id: string;
  user_id: string;
  debt_id: string;
  amount: number;
  date: string;
  is_extra: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const DEBT_TYPES = [
  { value: "student_loan", label: "Student Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "car_loan", label: "Car Loan" },
  { value: "other", label: "Other" },
] as const;

export type IncomeEntry = {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
};

export type SavingsContribution = {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export type RecurringFrequency = "weekly" | "biweekly" | "monthly";

export type RecurringTransaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string | null;
  category_id: string | null;
  source: string | null;
  description: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const RECURRING_FREQUENCIES: Record<RecurringFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
};

export const INCOME_SOURCES = [
  "Paycheck",
  "Freelance",
  "Gift",
  "Refund",
  "Investment",
  "Scholarship",
  "Other",
] as const;

export const PAY_PERIODS: Record<IncomeFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  bimonthly: "Bimonthly",
  monthly: "Monthly",
};
