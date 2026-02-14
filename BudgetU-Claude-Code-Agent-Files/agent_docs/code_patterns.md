# Code Patterns (BudgetU)

## Architectural Boundaries
- UI components render and collect input only.
- Data access goes through a small `lib/` layer so it is easy to swap later.
- Avoid clever abstractions. Hackathon code should be readable.

## Data Flow
- Read current user from Supabase auth session.
- Query expenses for current month for dashboard calculations.
- Compute insights on the server or in a shared `lib/insights.ts` module.

## Deterministic Insights (Preferred)
Implement risk score without LLM:
- Savings rate
- Overspend detection
- Category concentration

This makes the demo reliable and fast.

## AI Chat Feature Flag
- If `AI_API_KEY` is missing, show deterministic coach tips and disable sending requests.
- UI should look complete in both modes.

## UI Guidelines
- Large numbers in cards
- Progress bars for goal and budget remaining
- Empty states with 1 clear CTA (Add expense)

## Minimal Dependency Rule
- Do not add libraries unless needed.
- Prefer built-in fetch, simple utils, and shadcn components.
