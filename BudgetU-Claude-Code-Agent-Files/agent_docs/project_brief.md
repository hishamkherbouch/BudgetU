# Project Brief (Persistent)

## Product Vision
BudgetU helps broke undergrads understand and manage money through simple budgeting, visual progress tracking, and plain-English guidance.

## Hard Constraints
- Hackathon timeline, ship in 24 to 36 hours.
- Free tiers only (tools already paid for are fine).
- Demo must not fail even if AI is disabled.

## Scope Guardrails
Build only PRD P0 features:
- Financial Dashboard
- Manual Expense Entry
- Savings Goal + Emergency Fund Tracker
- Spending Insights + Risk Score
- AI Financial Advisor (optional, behind flag)

Explicitly NOT in MVP:
- Plaid or bank syncing
- Auto transaction imports
- Credit score tracking
- Mobile native app
- Multi-user accounts
- Advanced analytics

## UX Requirements
- Clean, modern, friendly, simple, non-intimidating
- Large clear numbers
- Soft greens and blues
- Minimal clutter
- Clear progress bars

## Workflow Expectations
- Small PRs and commits.
- After each feature, run verification from `agent_docs/testing.md`.
- If something is unclear, ask one specific question, then proceed.

## Key Commands
```bash
npm run dev
npm run lint
npm run build
```

## Update Cadence
Update this file and `AGENTS.md` whenever:
- A phase completes
- A major decision changes (stack, schema, auth flow)
- Deployment process changes
