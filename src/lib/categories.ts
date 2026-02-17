import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

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

export async function addCustomCategory(
  supabase: SupabaseClient,
  name: string
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
