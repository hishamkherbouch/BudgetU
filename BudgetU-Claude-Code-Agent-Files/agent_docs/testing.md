# Testing Strategy (Hackathon MVP)

## Goals
- Catch breaking issues fast.
- Keep checks lightweight.
- Ensure demo flow never fails.

## Automated Checks
Run after each feature slice:
```bash
npm run lint
npm run build
```

If you add a test runner later, keep it minimal:
- Unit tests for insight math functions
- Smoke test for expense insert and list

## Manual Smoke Tests (Required)
1. **Auth**
   - Sign up
   - Log in
   - Log out
2. **Onboarding**
   - Set monthly income
   - Set goal amount and current saved
3. **Expenses**
   - Add expense with category and amount
   - Confirm it appears in list
   - Refresh page, confirm it persists
   - Delete expense, confirm totals update
4. **Dashboard**
   - Totals update after adding expenses
   - Category breakdown renders
   - Savings progress bar renders
5. **Insights**
   - Risk score shows label and top category driver
6. **Responsive**
   - Check dashboard and add expense screens at mobile width

## Pre-Commit Hooks (Optional but Recommended)
If time allows, add:
- Prettier formatting
- ESLint
- Type check (Next.js build covers most)

If hooks are added, do not bypass failures.
