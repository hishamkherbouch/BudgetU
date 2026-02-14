# AGENTS.md — Master Plan for BudgetU

## Project Overview
**App:** BudgetU  
**Goal:** Student-first budgeting web app that teaches financial basics with a simple dashboard, manual expenses, goal tracking, and an optional AI coach.  
**Stack:** Next.js (App Router) + Tailwind + shadcn/ui + Supabase (Auth + Postgres + RLS) + Vercel  
**Current Phase:** Phase 1 — Foundation

## Non-Negotiables (Hackathon)
- Deliver a polished demo that always works.
- Prefer simple, deterministic logic over complex AI when time is tight.
- Keep scope strictly to PRD P0 features.

## How I Should Think
1. **Understand Intent First**: Before answering, identify what the user actually needs.
2. **Ask If Unsure**: If critical information is missing, ask before proceeding.
3. **Plan Before Coding**: Propose a brief plan, ask for approval, then implement.
4. **Verify After Changes**: Run tests/linters or manual checks after each change.
5. **Explain Trade-offs**: When recommending something, mention alternatives.

## Plan → Execute → Verify
1. **Plan:** Outline a brief approach and ask for approval before coding.
2. **Execute:** Implement one feature at a time, smallest shippable slice first.
3. **Verify:** Run checks after each slice; fix failures before moving on.
4. **Checkpoint:** Commit after each milestone.

## Context & Memory
- Treat `AGENTS.md` and `agent_docs/` as living docs.
- Use tool configs (`CLAUDE.md`, `GEMINI.md`, `.cursorrules`) for concise persistent rules.
- Put details in `agent_docs/` and only load what is needed.

## Optional Roles (If Supported)
- **Explorer:** Scan repo and existing patterns before proposing changes.
- **Builder:** Implement approved plan in small commits.
- **Tester:** Run lint/build and manual smoke tests; report issues with reproduction steps.

## Testing & Verification
Follow `agent_docs/testing.md`. If tests are not set up yet, at minimum:
- `npm run lint`
- `npm run build`
- Manual smoke test flows described in `agent_docs/testing.md`

## Checkpoints & Pre-Commit Hooks
- Create commits after milestones.
- If hooks exist, they must pass before commit.

## Context Files
Load only when needed:
- `agent_docs/tech_stack.md`
- `agent_docs/code_patterns.md`
- `agent_docs/project_brief.md`
- `agent_docs/product_requirements.md`
- `agent_docs/testing.md`

## Current State (Update This!)
**Last Updated:** 2026-02-14  
**Working On:** Phase 3 (optional) or polish
**Recently Completed:** Phase 2 Core Features (Auth, Onboarding, Expenses, Dashboard, Savings Goals, Spending Insights)
**Blocked By:** User needs to run `supabase/schema.sql` in Supabase SQL Editor and create `.env.local` with keys (if not done already)

## Roadmap

### Phase 1: Foundation
- [x] Initialize Next.js app with Tailwind and shadcn/ui
- [x] Create Supabase project, tables, and RLS policies (schema.sql ready)
- [x] Wire Supabase client/server helpers
- [ ] Configure environment variables and deploy to Vercel (user action needed)
- [x] Add basic lint and formatting
- [x] Port existing landing page (Header, Hero, DashboardPreview) to Tailwind

### Phase 2: Core Features (P0 from PRD)
- [x] Authentication and onboarding (monthly income + goal)
- [x] Manual expense entry (create, list, delete)
- [x] Dashboard totals and category breakdown
- [x] Savings goal + emergency fund tracker
- [x] Spending insights + risk score (deterministic)

### Phase 3: Optional (Only if time remains)
- [ ] AI financial advisor chat (behind env flag with deterministic fallback)

## What NOT To Do
- Do NOT delete files without explicit confirmation.
- Do NOT modify database schemas without a quick backup plan (migration or export).
- Do NOT add features not in the current phase.
- Do NOT skip tests for "simple" changes.
- Do NOT bypass failing lint/build checks.
- Do NOT introduce new dependencies without checking existing `package.json` and explaining why.
