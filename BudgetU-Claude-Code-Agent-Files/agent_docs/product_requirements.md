# Product Requirements (BudgetU MVP)

## One-line Description
Student-first budgeting web app that tracks manual expenses, shows a simple dashboard, and teaches financial basics with optional AI coaching.

## Primary User
"Alex" is an 18–22 year old undergrad with part-time income and possible student loans.

## P0 Features (Must Have)
1. **Financial Dashboard**
   - User story: As a student, I want to see all my finances in one simple view so I can understand my situation quickly.
   - Success: Income displayed clearly, expenses categorized, savings goal visual progress bar.
2. **Manual Expense Entry**
   - User story: As a student, I want to add expenses easily so I can track my spending.
   - Success: Expense form works, categories selectable, entries persist correctly.
3. **AI Financial Advisor (Chatbot)**
   - User story: As a student, I want to ask financial questions and get simple answers so I can learn.
   - Success: Responds to questions, suggests budget adjustments, explains concepts clearly.
4. **Spending Insights + Risk Score**
   - User story: As a student, I want to know if I’m overspending so I can adjust.
   - Success: Detects high spending categories, displays risk score.
5. **Savings Goal + Emergency Fund Tracker**
   - User story: As a student, I want to see progress toward a goal so I stay motivated.
   - Success: Savings percentage displayed, emergency fund readiness indicator.

## NOT in MVP
- Plaid and transaction syncing
- Real-time investment tracking
- Paper trading simulator
- Credit score tracking
- Mobile app version
- Multi-user accounts
- Advanced analytics

## Success Metrics
- Signups: 100
- Monthly active users: 25
- Demo reliability: 100% end-to-end functional
- Clarity test: users understand in under 30 seconds

## Constraints
- Web app, responsive
- Page load under 3 seconds
- Basic accessibility
- No bank integration and no sensitive syncing
- Basic auth and encrypted database
- Scale target 100 to 500 users
