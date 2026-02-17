export function parseMonth(
  searchParams: Record<string, string | string[] | undefined>
): { year: number; month: number } {
  const param = typeof searchParams.month === "string" ? searchParams.month : null;
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
