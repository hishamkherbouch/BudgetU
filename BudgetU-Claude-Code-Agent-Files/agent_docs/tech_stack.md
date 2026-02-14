# Tech Stack & Tools (BudgetU)

## Core Stack
- **Frontend:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Supabase (Auth + Postgres + APIs)
- **Database:** PostgreSQL (via Supabase)
- **Security:** Supabase Row Level Security (RLS)
- **Deployment:** Vercel

## Setup Commands
### Create app
```bash
npx create-next-app@latest budgetu --ts --eslint --tailwind --app
cd budgetu
npm run dev
```

### Add shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button card input select textarea tabs badge progress dialog
```

## Environment Variables
Create `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
Optional:
- `AI_API_KEY=...` (only if enabling chat)

## Supabase Client Pattern
Client-side (browser):
```ts
// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

Server-side (route handlers):
- Prefer using Supabase server client helpers if you add `@supabase/ssr`.
- Keep secrets server-only.

## Error Handling Pattern
```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err(message: string): Result<never> {
  return { ok: false, error: message };
}
```

## Naming Conventions
- Components: `PascalCase.tsx`
- Routes: `src/app/<route>/page.tsx`
- Utilities: `src/lib/<name>.ts`
- Server route handlers: `src/app/api/<name>/route.ts`
- Use `data-testid` attributes for key flows to make manual testing easier.
