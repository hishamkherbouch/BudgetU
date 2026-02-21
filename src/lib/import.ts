import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/types";
import { getExpenseCategories } from "@/lib/categories";
import { ok, err, type Result } from "@/lib/result";

export type ParsedExpense = {
  date: string;
  amount: number;
  description: string;
  category: string;
  category_id: string | null;
  hash: string;
  isDuplicate: boolean;
};

export type ColumnMapping = {
  date: string;
  amount: string;
  description: string;
};

// Keyword rules for auto-categorizing expenses
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    "grocery", "groceries", "restaurant", "food", "pizza", "burger",
    "coffee", "starbucks", "chipotle", "mcdonald", "doordash",
    "grubhub", "uber eats", "dining", "lunch", "dinner", "breakfast",
    "cafe", "bakery", "deli", "taco",
  ],
  "Rent/Housing": [
    "rent", "housing", "mortgage", "apartment", "lease", "landlord",
  ],
  Transport: [
    "gas", "fuel", "uber", "lyft", "bus", "metro", "transit",
    "parking", "toll", "car wash", "oil change", "auto",
  ],
  Entertainment: [
    "netflix", "spotify", "hulu", "disney", "movie", "theater",
    "concert", "game", "gaming", "steam", "xbox", "playstation",
    "youtube", "twitch",
  ],
  Shopping: [
    "amazon", "walmart", "target", "costco", "clothing", "shoes",
    "best buy", "online order", "ebay", "shop",
  ],
  Education: [
    "tuition", "textbook", "book", "school", "university", "college",
    "course", "class", "education", "student",
  ],
  Utilities: [
    "electric", "electricity", "water", "gas bill", "internet",
    "wifi", "phone", "mobile", "utility", "cable", "power",
  ],
};

export function autoCategorize(
  description: string,
  categories: Category[]
): { name: string; id: string | null } {
  const lower = description.toLowerCase();

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        const cat = categories.find((c) => c.name === categoryName);
        return { name: categoryName, id: cat?.id ?? null };
      }
    }
  }

  const otherCat = categories.find((c) => c.name === "Other");
  return { name: "Other", id: otherCat?.id ?? null };
}

export function computeHash(date: string, amount: number, description: string): string {
  const raw = `${date}|${amount}|${description.trim().toLowerCase()}`;
  // Simple hash - good enough for duplicate detection
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export async function getExistingHashes(
  supabase: SupabaseClient
): Promise<Result<Set<string>>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, description, date")
    .eq("user_id", user.id);

  if (error) return err(error.message);

  const hashes = new Set<string>();
  for (const row of data ?? []) {
    const h = computeHash(row.date, Number(row.amount), row.description || "");
    hashes.add(h);
  }

  return ok(hashes);
}

export async function importExpenses(
  supabase: SupabaseClient,
  expenses: ParsedExpense[]
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const nonDuplicates = expenses.filter((e) => !e.isDuplicate);
  if (nonDuplicates.length === 0) return ok(0);

  const rows = nonDuplicates.map((e) => ({
    user_id: user.id,
    amount: e.amount,
    category: e.category,
    category_id: e.category_id,
    description: e.description,
    date: e.date,
  }));

  const { error } = await supabase.from("expenses").insert(rows);

  if (error) return err(error.message);
  return ok(nonDuplicates.length);
}
