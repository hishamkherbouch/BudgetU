import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, CategoryType } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

/** Returns all categories visible to the user (defaults + their own custom). */
export async function getCategories(
  supabase: SupabaseClient
): Promise<Result<Category[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("is_default", { ascending: false })
    .order("name");

  if (error) return err(error.message);
  return ok((data ?? []) as Category[]);
}

/** Categories usable on expense forms (type = 'expense' or 'both'). */
export async function getExpenseCategories(
  supabase: SupabaseClient
): Promise<Result<Category[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .in("type", ["expense", "both"])
    .order("is_default", { ascending: false })
    .order("name");

  if (error) return err(error.message);
  return ok((data ?? []) as Category[]);
}

/** Categories usable on income forms (type = 'income' or 'both'). */
export async function getIncomeCategories(
  supabase: SupabaseClient
): Promise<Result<Category[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .in("type", ["income", "both"])
    .order("is_default", { ascending: false })
    .order("name");

  if (error) return err(error.message);
  return ok((data ?? []) as Category[]);
}

export async function addCustomCategory(
  supabase: SupabaseClient,
  name: string,
  type: CategoryType = "expense"
): Promise<Result<Category>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const trimmed = name.trim();
  if (!trimmed) return err("Category name cannot be empty");

  // Check if a category with this name already exists (default or custom)
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .ilike("name", trimmed)
    .limit(1);

  if (existing && existing.length > 0) {
    return err("A category with this name already exists");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: trimmed,
      type,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return err("Category already exists");
    return err(error.message);
  }
  return ok(data as Category);
}

export async function deleteCustomCategory(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
