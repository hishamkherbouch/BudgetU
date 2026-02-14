import type { Metadata } from "next";
import EducationCards from "@/components/dashboard/EducationCards";

export const metadata: Metadata = {
  title: "Financial literacy | BudgetU",
  description:
    "A crash course in financial literacy for college students: Roth IRA, 401k, high-yield savings, investing, and emergency funds.",
};

export default function EducationPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">
          Financial literacy crash course
        </h1>
        <p className="text-budgetu-body mt-1 max-w-2xl">
          Click a card or tap “Learn more” to open the full guide. Each topic
          is written for students—digestible but thorough so you can fully
          understand it.
        </p>
      </div>

      <EducationCards />

      <p className="text-budgetu-muted text-sm">
        This is educational content, not professional advice. Consider talking
        to a financial advisor or doing more research before making big
        financial decisions.
      </p>
    </div>
  );
}
