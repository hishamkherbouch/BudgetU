import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import { getMonthExpenses } from "@/lib/expenses";
import { getSavingsGoals } from "@/lib/savings-goals";
import { getDebts } from "@/lib/debts";
import { executeAction, type ChatAction } from "@/lib/chatbot";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are BudgetU, a friendly financial assistant for college students.
You have access to the user's financial data (provided below).

CRITICAL OUTPUT FORMAT RULES:
- You MUST respond with a SINGLE valid JSON object and NOTHING ELSE.
- No markdown, no code fences, no extra text before or after the JSON.
- No "thinking out loud" — do not write explanations outside the JSON object.
- Do not nest JSON inside natural language text.
- Your ENTIRE response must be parseable by JSON.parse().
- If you are unsure, just output: { "reply": "your message here" }

When the user wants to perform an action, respond with this JSON:
{
  "reply": "your conversational response confirming what you did",
  "action": {
    "type": "add_expense" | "update_income" | "add_savings" | "create_goal" | "add_debt" | "add_debt_payment" | "update_general_savings" | "set_general_savings",
    "params": { ... }
  }
}

When the user just asks a question or wants advice, respond with:
{
  "reply": "your answer"
}

Action parameter schemas:
- add_expense: { "amount": number, "category": string, "description": string, "date": "YYYY-MM-DD" }
  Valid categories: Food, Rent/Housing, Transport, Entertainment, Shopping, Education, Utilities, Other
- update_income: { "amount": number }
- add_savings: { "goalName": string (must match an existing goal name), "amount": number }
- create_goal: { "name": string, "targetAmount": number, "isEmergencyFund": boolean }
- add_debt: { "name": string, "debtType": "student_loan" | "credit_card" | "car_loan" | "other", "principal": number, "interestRate": number, "monthlyPayment": number }
- add_debt_payment: { "debtName": string (must match an existing debt name), "amount": number }
- update_general_savings: { "amount": number } — adds the amount to the user's general (unallocated) savings balance. Use this when the user says they saved money but it's not for a specific goal.
- set_general_savings: { "amount": number } — sets the general savings balance to an exact amount. Use this when the user says "my savings are $X" or "set my savings to $X".

IMPORTANT: When a user mentions saving money WITHOUT specifying a goal name, use "update_general_savings" (NOT "add_savings" or "create_goal"). Only use "add_savings" when they name a specific existing goal.

Rules:
- Be short, friendly, non-judgmental, and specific
- Use the user's actual financial data to give personalized responses
- If the user's request is ambiguous, ask a clarifying question instead of guessing
- For dates, use today's date if the user doesn't specify one
- Today's date is ${new Date().toISOString().split("T")[0]}
- Mention "not financial advice" once per conversation (not every message)
- Your ENTIRE output must be a single JSON object — no text outside the braces

FINANCIAL REASONING RULES (follow these carefully for affordability and purchase questions):
- NEVER use absolute language like "you can definitely afford", "you're all set", or "no problem". Use measured language like "this appears feasible", "the math works but consider...", or "this is possible, though it would be aggressive".
- When evaluating large purchases or affordability:
  1. Calculate the math (required savings, timeline, surplus).
  2. Evaluate LIQUIDITY IMPACT: What percentage of total savings would this purchase consume? If > 50%, flag it clearly.
  3. Evaluate EMERGENCY FUND HEALTH: Would the user still have 3 months of expenses covered after the purchase? If not, warn them.
  4. Consider HIDDEN COSTS: For cars mention insurance/taxes/maintenance, for housing mention utilities/deposits, etc.
  5. Consider OPPORTUNITY COST: Money spent on this can't go toward debt payoff or other goals.
  6. Reference the user's DEBT situation: If they have high-interest debt, suggest prioritizing that.
  7. Provide a clear VERDICT using one of: "comfortably feasible", "feasible but tight", "aggressive — high risk", or "not recommended right now".
  8. Optionally suggest an alternative (e.g., lower amount, longer timeline, or saving more first).
- If a purchase would exceed 25% of the user's total liquid savings (general savings + non-emergency goal balances), increase caution in your tone and recommend the user think carefully.
- Always frame advice as considerations, not commands. You are a thinking partner, not a yes-machine.`;

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type ParsedResponse = { reply: string; action?: ChatAction };

/** Try to parse a string as JSON, stripping code fences first. */
function tryParseJson(text: string): ParsedResponse {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj.reply === "string") return obj;
    return { reply: text };
  } catch {
    return { reply: text };
  }
}

/** Extract the first balanced {...} JSON object from mixed text. */
function extractJsonObject(text: string): ParsedResponse | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          const obj = JSON.parse(text.slice(start, i + 1));
          if (obj && typeof obj.reply === "string") return obj;
        } catch {
          // not valid JSON, continue looking
        }
        return null;
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { message, conversationHistory } = (await request.json()) as {
      message: string;
      conversationHistory: ConversationMessage[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { ok: false, error: "message is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user's financial context
    const now = new Date();
    const [profileResult, expensesResult, goalsResult, debtsResult] =
      await Promise.all([
        getProfile(supabase),
        getMonthExpenses(supabase, now.getFullYear(), now.getMonth() + 1),
        getSavingsGoals(supabase),
        getDebts(supabase),
      ]);

    const profile = profileResult.ok ? profileResult.value : null;
    const expenses = expensesResult.ok ? expensesResult.value : [];
    const goals = goalsResult.ok ? goalsResult.value : [];
    const debts = debtsResult.ok ? debtsResult.value : [];

    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const income = Number(profile?.monthly_income ?? 0);

    // Build category breakdown
    const catMap = new Map<string, number>();
    for (const e of expenses) {
      catMap.set(e.category, (catMap.get(e.category) ?? 0) + Number(e.amount));
    }
    const categoryBreakdown = Array.from(catMap.entries())
      .map(([cat, amt]) => ({ category: cat, amount: Math.round(amt * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);

    const generalSavings = Number(profile?.general_savings_balance ?? 0);

    // Derived financial metrics for smarter AI reasoning
    const monthlySurplus = income - totalSpent;
    const savingsRate = income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0;

    const emergencyFundGoals = goals.filter((g) => g.is_emergency_fund);
    const emergencyFundTotal = emergencyFundGoals.reduce((s, g) => s + Number(g.current_amount), 0);
    const emergencyFundTarget = totalSpent > 0 ? totalSpent * 3 : income * 3; // 3 months of expenses

    const nonEmergencyGoalSavings = goals
      .filter((g) => !g.is_emergency_fund)
      .reduce((s, g) => s + Number(g.current_amount), 0);
    const totalLiquidSavings = generalSavings + nonEmergencyGoalSavings;
    const totalAllSavings = generalSavings + goals.reduce((s, g) => s + Number(g.current_amount), 0);

    const totalDebtOwed = debts.reduce((s, d) => s + Number(d.principal), 0);
    const totalMonthlyDebtPayments = debts.reduce((s, d) => s + Number(d.monthly_payment), 0);
    const debtToIncomeRatio = income > 0 ? Math.round((totalMonthlyDebtPayments / income) * 100) : 0;

    const financialContext = `
USER'S FINANCIAL DATA:
- Monthly Income: $${income}
- Total Spent This Month: $${totalSpent.toFixed(2)}
- Monthly Surplus: $${monthlySurplus.toFixed(2)}
- Savings Rate: ${savingsRate}%
- General Savings Balance: $${generalSavings.toFixed(2)}

Derived Metrics (use these for reasoning):
- Total Liquid Savings (general + non-emergency goals): $${totalLiquidSavings.toFixed(2)}
- Total All Savings (including emergency fund): $${totalAllSavings.toFixed(2)}
- Emergency Fund Balance: $${emergencyFundTotal.toFixed(2)}
- Emergency Fund Target (3 months expenses): $${emergencyFundTarget.toFixed(2)}
- Emergency Fund Health: ${emergencyFundTotal >= emergencyFundTarget ? "Healthy" : emergencyFundTotal > 0 ? `Underfunded (${Math.round((emergencyFundTotal / emergencyFundTarget) * 100)}% of target)` : "None"}
- Total Debt Owed: $${totalDebtOwed.toFixed(2)}
- Monthly Debt Payments: $${totalMonthlyDebtPayments.toFixed(2)}
- Debt-to-Income Ratio: ${debtToIncomeRatio}%

Category Breakdown:
${categoryBreakdown.length > 0 ? categoryBreakdown.map((c) => `  - ${c.category}: $${c.amount}`).join("\n") : "  No expenses yet this month"}

Savings Goals:
${goals.length > 0 ? goals.map((g) => `  - "${g.name}": $${Number(g.current_amount)} / $${Number(g.target_amount)}${g.is_emergency_fund ? " (Emergency Fund)" : ""}`).join("\n") : "  No savings goals yet"}

Debts:
${debts.length > 0 ? debts.map((d) => `  - "${d.name}" (${d.debt_type}): $${Number(d.principal)} remaining, ${d.interest_rate}% APR, $${Number(d.monthly_payment)}/mo payment`).join("\n") : "  No debts tracked"}
`;

    // Build Gemini conversation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n" + financialContext }],
      },
    });

    const history = (conversationHistory || []).map((msg: ConversationMessage) => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text().trim();

    // Robust JSON parsing with 3-tier fallback
    let parsed: { reply: string; action?: ChatAction };
    parsed = tryParseJson(responseText);

    // If direct parse failed, try extracting the first JSON object from the text
    if (!parsed.action && parsed.reply === responseText) {
      const extracted = extractJsonObject(responseText);
      if (extracted) {
        parsed = extracted;
      } else {
        // Retry: ask Gemini to fix its output
        try {
          const repairResult = await chat.sendMessage(
            `Your last output was not valid JSON. Return ONLY a valid JSON object matching the schema: { "reply": "..." } or { "reply": "...", "action": { "type": "...", "params": { ... } } }. No extra text. Fix this output:\n\n${responseText}`
          );
          const repairText = repairResult.response.text().trim();
          const repaired = tryParseJson(repairText);
          if (repaired.reply !== repairText) {
            parsed = repaired;
          } else {
            const extractedRepair = extractJsonObject(repairText);
            if (extractedRepair) {
              parsed = extractedRepair;
            } else {
              parsed = { reply: "Sorry — I had trouble formatting that. Can you rephrase?" };
            }
          }
        } catch {
          parsed = { reply: "Sorry — I had trouble formatting that. Can you rephrase?" };
        }
      }
    }

    // Execute action if present
    let actionResult: { ok: boolean; message: string } | null = null;
    if (parsed.action && parsed.action.type && parsed.action.params) {
      actionResult = await executeAction(supabase, parsed.action);
    }

    return NextResponse.json({
      ok: true,
      data: {
        reply: parsed.reply,
        actionTaken: actionResult
          ? { type: parsed.action!.type, ...actionResult }
          : null,
      },
    });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
