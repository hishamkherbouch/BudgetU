# CLAUDE.md — Claude Code Configuration for BudgetU

## Project Context
**App:** BudgetU  
**Stack:** Next.js + Tailwind + shadcn/ui + Supabase + Vercel  
**Stage:** MVP Development (Hackathon)  
**User Level:** A (Vibe-coder, AI builds, user tests)

## Directives
1. Read `AGENTS.md` first to see current phase and tasks.
2. Use `agent_docs/` for details. Do not paste giant context into chat.
3. Plan-first: propose a brief plan and wait for approval before coding.
4. Incremental build: implement one small feature slice at a time.
5. Verify after each slice using `agent_docs/testing.md`.
6. Do not add features not listed as P0 or explicitly approved.
7. If stuck, ask one specific question, then proceed with the safest assumption.

## What NOT To Do
- Do not delete files without explicit confirmation.
- Do not change database schema without stating migration steps.
- Do not bypass failing lint/build checks.
- Do not introduce new dependencies without checking `package.json`.

## Commands
- `npm run dev` start dev server
- `npm run lint` lint
- `npm run build` production build check
