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

IMPORTANT: You MUST respond with valid JSON only. No markdown, no code fences, no extra text.

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
- ONLY output valid JSON, nothing else`;

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

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

    const financialContext = `
USER'S FINANCIAL DATA:
- Monthly Income: $${income}
- Total Spent This Month: $${totalSpent.toFixed(2)}
- Budget Remaining: $${(income - totalSpent).toFixed(2)}
- Savings Rate: ${income > 0 ? Math.round(((income - totalSpent) / income) * 100) : 0}%
- General Savings Balance: $${generalSavings.toFixed(2)}

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

    // Parse Gemini's JSON response
    let parsed: { reply: string; action?: ChatAction };
    try {
      // Strip markdown code fences if present
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, treat the whole response as the reply
      parsed = { reply: responseText };
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
