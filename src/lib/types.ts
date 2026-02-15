export type Profile = {
  id: string;
  display_name: string | null;
  monthly_income: number;
  general_savings_balance: number;
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
};

export const DEBT_TYPES = [
  { value: "student_loan", label: "Student Loan" },
  { value: "credit_card", label: "Credit Card" },
  { value: "car_loan", label: "Car Loan" },
  { value: "other", label: "Other" },
] as const;
