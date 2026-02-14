import type { SupabaseClient } from "@supabase/supabase-js";
import { addExpense } from "@/lib/expenses";
import { updateMonthlyIncome } from "@/lib/profiles";
import {
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsProgress,
} from "@/lib/savings-goals";
import { createDebt, getDebts, addDebtPayment } from "@/lib/debts";
import type { DebtType } from "@/lib/types";

export type ChatAction = {
  type:
    | "add_expense"
    | "update_income"
    | "add_savings"
    | "create_goal"
    | "add_debt"
    | "add_debt_payment";
  params: Record<string, unknown>;
};

export async function executeAction(
  supabase: SupabaseClient,
  action: ChatAction
): Promise<{ ok: boolean; message: string }> {
  try {
    switch (action.type) {
      case "add_expense": {
        const { amount, category, description, date } = action.params as {
          amount: number;
          category: string;
          description: string;
          date: string;
        };
        const result = await addExpense(supabase, {
          amount,
          category,
          description: description || "",
          date: date || new Date().toISOString().split("T")[0],
        });
        if (!result.ok) return { ok: false, message: result.error };
        return { ok: true, message: `Added $${amount} expense for ${category}` };
      }

      case "update_income": {
        const { amount } = action.params as { amount: number };
        const result = await updateMonthlyIncome(supabase, amount);
        if (!result.ok) return { ok: false, message: result.error };
        return { ok: true, message: `Updated monthly income to $${amount}` };
      }

      case "add_savings": {
        const { goalName, amount } = action.params as {
          goalName: string;
          amount: number;
        };
        // Find the goal by name
        const goalsResult = await getSavingsGoals(supabase);
        if (!goalsResult.ok)
          return { ok: false, message: goalsResult.error };

        const goal = goalsResult.value.find(
          (g) => g.name.toLowerCase() === goalName.toLowerCase()
        );
        if (!goal)
          return {
            ok: false,
            message: `Could not find a savings goal named "${goalName}"`,
          };

        const result = await updateSavingsProgress(supabase, goal.id, amount);
        if (!result.ok) return { ok: false, message: result.error };
        return {
          ok: true,
          message: `Added $${amount} to "${goal.name}"`,
        };
      }

      case "create_goal": {
        const { name, targetAmount, isEmergencyFund } = action.params as {
          name: string;
          targetAmount: number;
          isEmergencyFund: boolean;
        };
        const result = await createSavingsGoal(supabase, {
          name,
          target_amount: targetAmount,
          is_emergency_fund: isEmergencyFund ?? false,
        });
        if (!result.ok) return { ok: false, message: result.error };
        return {
          ok: true,
          message: `Created savings goal "${name}" for $${targetAmount}`,
        };
      }

      case "add_debt": {
        const { name, debtType, principal, interestRate, monthlyPayment } =
          action.params as {
            name: string;
            debtType: DebtType;
            principal: number;
            interestRate: number;
            monthlyPayment: number;
          };
        const result = await createDebt(supabase, {
          name,
          debt_type: debtType || "other",
          principal,
          interest_rate: interestRate ?? 0,
          monthly_payment: monthlyPayment ?? 0,
        });
        if (!result.ok) return { ok: false, message: result.error };
        return { ok: true, message: `Added debt "${name}" — $${principal}` };
      }

      case "add_debt_payment": {
        const { debtName, amount } = action.params as {
          debtName: string;
          amount: number;
        };
        // Find the debt by name
        const debtsResult = await getDebts(supabase);
        if (!debtsResult.ok) return { ok: false, message: debtsResult.error };

        const debt = debtsResult.value.find(
          (d) => d.name.toLowerCase() === debtName.toLowerCase()
        );
        if (!debt)
          return {
            ok: false,
            message: `Could not find a debt named "${debtName}"`,
          };

        const result = await addDebtPayment(supabase, debt.id, {
          amount,
          date: new Date().toISOString().split("T")[0],
        });
        if (!result.ok) return { ok: false, message: result.error };
        return {
          ok: true,
          message: `Recorded $${amount} payment on "${debt.name}"`,
        };
      }

      default:
        return { ok: false, message: `Unknown action: ${action.type}` };
    }
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Action failed",
    };
  }
}
