import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryBudget } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function getCategoryBudgets(
  supabase: SupabaseClient
): Promise<Result<CategoryBudget[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("category_budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("category_name", { ascending: true });

  if (error) return err(error.message);
  return ok((data ?? []) as CategoryBudget[]);
}

export async function setCategoryBudget(
  supabase: SupabaseClient,
  categoryName: string,
  monthlyLimit: number
): Promise<Result<CategoryBudget>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("category_budgets")
    .upsert(
      {
        user_id: user.id,
        category_name: categoryName,
        monthly_limit: monthlyLimit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,category_name" }
    )
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as CategoryBudget);
}

export async function deleteCategoryBudget(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("category_budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
