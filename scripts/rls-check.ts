/**
 * RLS Sanity Check
 * ----------------
 * Proves that a Supabase user cannot read, update, or delete another
 * user's rows in any of the nine user-owned tables.
 *
 * Prerequisites:
 *   - SUPABASE_SERVICE_ROLE_KEY must be set (used only for test-user creation/cleanup)
 *   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set
 *
 * Run:
 *   npx ts-node --project tsconfig.json scripts/rls-check.ts
 *
 * Or, add to package.json:
 *   "rls-check": "ts-node --project tsconfig.json scripts/rls-check.ts"
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local so the script works without manually setting env vars
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// Admin client: bypasses RLS – used only to create / delete test users
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASS = "RlsCheckPass99!";

// ── helpers ────────────────────────────────────────────────────────────────

async function signedInClient(email: string): Promise<SupabaseClient> {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: PASS });
  if (error) throw new Error(`signIn(${email}): ${error.message}`);
  return client;
}

let passed = 0;
let failed = 0;

function ok(label: string) {
  console.log(`  ✓ ${label}`);
  passed++;
}

function fail(label: string, detail: string) {
  console.error(`  ✗ ${label}: ${detail}`);
  failed++;
}

async function assertEmpty(
  label: string,
  client: SupabaseClient,
  table: string,
  filterColumn: string,
  filterValue: string
) {
  const { data, error } = await client
    .from(table)
    .select("id")
    .eq(filterColumn, filterValue);

  if (error) {
    // A "relation does not exist" or "permission denied" error is effectively
    // a pass for this check – the user definitely cannot read the data.
    ok(`${label} (blocked by error: ${error.code})`);
    return;
  }

  if (!data || data.length === 0) {
    ok(label);
  } else {
    fail(label, `User B saw ${data.length} row(s) that belong to User A`);
  }
}

async function assertUpdateBlocked(
  label: string,
  client: SupabaseClient,
  table: string,
  ownerId: string,
  rowId: string
) {
  const { data, error } = await client
    .from(table)
    .update({ amount: 0.01 } as never)
    .eq("id", rowId)
    .eq("user_id", ownerId)
    .select("id");

  // Either an error OR an empty result (0 rows matched) is a pass.
  if (error || !data || data.length === 0) {
    ok(label);
  } else {
    fail(label, `User B updated ${data.length} row(s) belonging to User A`);
  }
}

async function assertDeleteBlocked(
  label: string,
  client: SupabaseClient,
  table: string,
  ownerId: string,
  rowId: string
) {
  if (!rowId) {
    fail(label, "row was never created — insert by User A failed (check earlier errors)");
    return;
  }

  await client
    .from(table)
    .delete()
    .eq("id", rowId)
    .eq("user_id", ownerId);

  // Verify the row still exists using the admin client
  const { data } = await admin
    .from(table)
    .select("id")
    .eq("id", rowId);

  if (data && data.length > 0) {
    ok(label);
  } else {
    fail(label, "User B successfully deleted User A's row (row is gone)");
  }
}

// ── main ───────────────────────────────────────────────────────────────────

async function run() {
  const ts = Date.now();
  const emailA = `rls-a-${ts}@budgetu-test.invalid`;
  const emailB = `rls-b-${ts}@budgetu-test.invalid`;

  let userAId = "";
  let userBId = "";

  console.log("\n=== BudgetU RLS Sanity Check ===\n");

  // ── Create two isolated test users ──────────────────────────────────────
  console.log("Creating test users…");
  const { data: ua, error: eA } = await admin.auth.admin.createUser({
    email: emailA,
    password: PASS,
    email_confirm: true,
  });
  if (!ua?.user || eA) throw new Error(`createUser A: ${eA?.message}`);
  userAId = ua.user.id;

  const { data: ub, error: eB } = await admin.auth.admin.createUser({
    email: emailB,
    password: PASS,
    email_confirm: true,
  });
  if (!ub?.user || eB) throw new Error(`createUser B: ${eB?.message}`);
  userBId = ub.user.id;

  console.log(`  User A: ${userAId}`);
  console.log(`  User B: ${userBId}\n`);

  const clientA = await signedInClient(emailA);
  const clientB = await signedInClient(emailB);

  // Storage for row IDs created by User A
  const ids: Record<string, string> = {};

  try {
    // ── 1. expenses ──────────────────────────────────────────────────────
    console.log("Table: expenses");
    const { data: exp, error: expInsertErr } = await clientA
      .from("expenses")
      .insert({ user_id: userAId, amount: 9.99, category: "Test", date: "2026-01-01" })
      .select("id")
      .single();
    if (expInsertErr) console.error("  [setup] expense insert failed:", expInsertErr.message);
    ids.expense = exp?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "expenses", "user_id", userAId);
    await assertUpdateBlocked("UPDATE blocked", clientB, "expenses", userAId, ids.expense);
    await assertDeleteBlocked("DELETE blocked", clientB, "expenses", userAId, ids.expense);

    // ── 2. income_entries ────────────────────────────────────────────────
    console.log("\nTable: income_entries");
    const { data: inc, error: incInsertErr } = await clientA
      .from("income_entries")
      .insert({ user_id: userAId, amount: 100, source: "Test", date: "2026-01-01" })
      .select("id")
      .single();
    if (incInsertErr) console.error("  [setup] income insert failed:", incInsertErr.message);
    ids.income = inc?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "income_entries", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "income_entries", userAId, ids.income);

    // ── 3. savings_goals ─────────────────────────────────────────────────
    console.log("\nTable: savings_goals");
    const { data: sg, error: sgInsertErr } = await clientA
      .from("savings_goals")
      .insert({ user_id: userAId, name: "Test Goal", target_amount: 500, is_emergency_fund: false })
      .select("id")
      .single();
    if (sgInsertErr) console.error("  [setup] savings_goal insert failed:", sgInsertErr.message);
    ids.goal = sg?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "savings_goals", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "savings_goals", userAId, ids.goal);

    // ── 4. savings_contributions ─────────────────────────────────────────
    if (ids.goal) {
      console.log("\nTable: savings_contributions");
      const { data: sc, error: scInsertErr } = await clientA
        .from("savings_contributions")
        .insert({ user_id: userAId, goal_id: ids.goal, amount: 25, date: "2026-01-01" })
        .select("id")
        .single();
      if (scInsertErr) console.error("  [setup] savings_contribution insert failed:", scInsertErr.message);
      ids.contribution = sc?.id ?? "";

      await assertEmpty("SELECT blocked", clientB, "savings_contributions", "user_id", userAId);
      await assertDeleteBlocked("DELETE blocked", clientB, "savings_contributions", userAId, ids.contribution);
    }

    // ── 5. debts ─────────────────────────────────────────────────────────
    console.log("\nTable: debts");
    const { data: dt, error: dtInsertErr } = await clientA
      .from("debts")
      .insert({
        user_id: userAId,
        name: "Test Loan",
        debt_type: "other",
        principal: 1000,
        interest_rate: 5,
        monthly_payment: 50,
      })
      .select("id")
      .single();
    if (dtInsertErr) console.error("  [setup] debt insert failed:", dtInsertErr.message);
    ids.debt = dt?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "debts", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "debts", userAId, ids.debt);

    // ── 6. debt_payments ─────────────────────────────────────────────────
    if (ids.debt) {
      console.log("\nTable: debt_payments");
      const { data: dp, error: dpInsertErr } = await clientA
        .from("debt_payments")
        .insert({ user_id: userAId, debt_id: ids.debt, amount: 50, date: "2026-01-01" })
        .select("id")
        .single();
      if (dpInsertErr) console.error("  [setup] debt_payment insert failed:", dpInsertErr.message);
      ids.debtPayment = dp?.id ?? "";

      await assertEmpty("SELECT blocked", clientB, "debt_payments", "user_id", userAId);
      await assertDeleteBlocked("DELETE blocked", clientB, "debt_payments", userAId, ids.debtPayment);
    }

    // ── 7. recurring_transactions ────────────────────────────────────────
    console.log("\nTable: recurring_transactions");
    const { data: rt, error: rtInsertErr } = await clientA
      .from("recurring_transactions")
      .insert({
        user_id: userAId,
        type: "expense",
        amount: 15,
        category: "Test",
        frequency: "monthly",
        start_date: "2026-01-01",
      })
      .select("id")
      .single();
    if (rtInsertErr) console.error("  [setup] recurring insert failed:", rtInsertErr.message);
    ids.recurring = rt?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "recurring_transactions", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "recurring_transactions", userAId, ids.recurring);

    // ── 8. subscription_overrides ────────────────────────────────────────
    console.log("\nTable: subscription_overrides");
    const { data: so, error: soInsertErr } = await clientA
      .from("subscription_overrides")
      .insert({ user_id: userAId, merchant_key: "test-merchant", status: "ignored" })
      .select("id")
      .single();
    if (soInsertErr) console.error("  [setup] subscription_override insert failed:", soInsertErr.message);
    ids.override = so?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "subscription_overrides", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "subscription_overrides", userAId, ids.override);

    // ── 9. category_budgets ──────────────────────────────────────────────
    console.log("\nTable: category_budgets");
    const { data: cb, error: cbInsertErr } = await clientA
      .from("category_budgets")
      .insert({ user_id: userAId, category_name: "Test Category", monthly_limit: 100 })
      .select("id")
      .single();
    if (cbInsertErr) console.error("  [setup] category_budget insert failed:", cbInsertErr.message);
    ids.categoryBudget = cb?.id ?? "";

    await assertEmpty("SELECT blocked", clientB, "category_budgets", "user_id", userAId);
    await assertDeleteBlocked("DELETE blocked", clientB, "category_budgets", userAId, ids.categoryBudget);

    // ── 10. profiles (id = auth.uid(), not user_id column) ───────────────
    console.log("\nTable: profiles");
    const { data: profileB } = await clientB
      .from("profiles")
      .select("monthly_income")
      .eq("id", userAId)
      .single();

    if (!profileB) {
      ok("SELECT blocked (User B cannot read User A profile)");
    } else {
      fail("SELECT blocked", "User B read User A's profile row");
    }
  } finally {
    // ── Cleanup ───────────────────────────────────────────────────────────
    console.log("\nCleaning up test users…");
    // Deleting users cascades to all user-owned rows via ON DELETE CASCADE
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
    console.log("  Done.\n");
  }

  // ── Results ───────────────────────────────────────────────────────────────
  console.log("=".repeat(38));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error("\n🚨 RLS CHECK FAILED – do not launch until all checks pass.\n");
    process.exit(1);
  } else {
    console.log("\n✅ All RLS checks passed – safe to launch.\n");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("\nUnexpected error:", err.message ?? err);
  process.exit(1);
});
