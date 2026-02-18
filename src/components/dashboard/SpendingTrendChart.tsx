"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MonthlyTrendPoint } from "@/lib/dashboard";

export default function SpendingTrendChart() {
  const [data, setData] = useState<MonthlyTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spending-trend?months=3")
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-budgetu-accent border-t-transparent" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-budgetu-muted text-sm py-8 text-center">
        No spending data for the last 3 months yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="monthLabel"
          tick={{ fill: "var(--budgetu-body)", fontSize: 12 }}
          axisLine={{ stroke: "var(--budgetu-muted)" }}
        />
        <YAxis
          tick={{ fill: "var(--budgetu-body)", fontSize: 12 }}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--budgetu-surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"]}
          labelStyle={{ color: "var(--budgetu-heading)" }}
        />
        <Bar
          dataKey="spent"
          fill="var(--budgetu-accent)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
