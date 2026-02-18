# Project Specification: BudgetU UI/UX & Feature Overhaul
**Version:** 1.0 (Production-Ready)
**Goal:** Transition BudgetU from a prototype to a high-aesthetic, professional student fintech app inspired by industry leaders like Copilot and Rocket Money.

---

## 1. Core Visual Identity (The "Bento" Design)
**Instruction:** Redesign the [Dashboard](https://budget-u-ten.vercel.app/dashboard) and sub-pages using a modern Bento-Box grid system.

- **Color Palette:** - Primary: Indigo-500 (`#6366F1`)
  - Background: Deep Slate (`#0F172A`)
  - Accent: Success Green (`#22C55E`) / Warning Amber (`#F59E0B`)
- **UI Style:** - Glassmorphism: Use `backdrop-filter: blur(10px)` with `bg-slate-900/70` for cards.
  - Border: 1px subtle borders (`border-slate-800`).
  - Typography: Inter or Geist Sans; use bold weights for monetary values.

---

## 2. Technical Fixes & Logic (Critical)
**Instruction:** Audit and synchronize the state management across all pages.

- **Savings Rate Discrepancy:** - Current Issue: Dashboard shows 10% in one card and 85% in Insights.
  - Required Logic: `Total_Saved = (Income - Expenses)`. `Savings_Rate = (Total_Saved / Income) * 100`.
- **Global State:** Ensure that adding an expense on the [Expenses Page](https://budget-u-ten.vercel.app/expenses) immediately updates the Dashboard's "Remaining" and "Spent" cards.

---

## 3. Module-Specific Enhancements

### A. Dashboard ([Dashboard](https://budget-u-ten.vercel.app/dashboard))
- **Hero Card:** Implement a large "Available to Spend" card with a glowing border.
- **Spending Overview:** Replace static data with a functional Bar Chart (using Recharts) showing a 3-month trend.
- **Empty States:** For the [Debt & Loans](https://budget-u-ten.vercel.app/debt) section, add a placeholder illustration and a prominent "Add Your First Loan" button.

### B. Income & Expenses ([Income](https://budget-u-ten.vercel.app/income) | [Expenses](https://budget-u-ten.vercel.app/expenses))
- **Form UX:** Implement Shadcn/ui Dialogs (Modals) for adding transactions instead of inline forms.
- **Categorization:** Standardize categories: Food, Housing, Transport, Subscriptions, Education, Entertainment.
- **Recurring Transactions:** In the Expenses tab, add a "Mark as Subscription" toggle that adds a small "🔁" icon next to the item.

### C. Education ([Education](https://budget-u-ten.vercel.app/education))
- **Interactive Quests:** Change the "Learn More" buttons to "Start Quest." 
- **Content Delivery:** Use a slide-over (Sheet) component to display financial literacy content without leaving the page.

---

## 4. Implementation Prompt for AI
**Paste this into the chat:**
> "I want to refactor the BudgetU app according to `@BudgetU_Dev_Spec.md`. Start by redesigning the Dashboard layout into a Bento-style grid. Fix the math for the Savings Rate logic first, then apply the Glassmorphism card styles. Ensure all components are responsive for mobile student users."

---

## 5. Deployment Checklist
- [ ] **Accessibility:** Ensure a contrast ratio of 4.5:1 for all text.
- [ ] **Performance:** Lazy load the charts on the Dashboard.
- [ ] **Dark Mode:** Set Dark Mode as the default theme.
- [ ] **SEO:** Add Meta Tags: 'BudgetU - The Smart Student Budgeting App'.


## Rules:
