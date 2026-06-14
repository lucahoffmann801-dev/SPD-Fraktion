# SPD-Fraktion Kaiserslautern — Internes Portal

Ein internes Fraktionsportal für Termine, Aufgaben, Vorgänge, Ausschüsse, Profile, Dokumente und Kalender-Sync.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/portal/src/pages/home.tsx` — single-page app (all views/sections)
- `artifacts/portal/src/lib/` — types, demo data, supabase client, calendar utils
- `artifacts/portal/public/` — profile images, menu icons, logo
- `artifacts/api-server/src/routes/portal-*.ts` — API routes (data, auth, records, work-orders, ics)
- `artifacts/api-server/src/lib/supabase.ts` — server-side Supabase client

## Architecture decisions

- Single-page app: all navigation is internal state (`view` state), no page routing needed
- App works fully without Supabase — falls back to demo data automatically
- Supabase anon key used client-side (`VITE_SUPABASE_*`); server routes also support it via `process.env.VITE_SUPABASE_*`
- API routes proxy Supabase mutations so the service role key never reaches the browser

## Product

- Login screen with profile selection and shared access code
- Dashboard: upcoming events, open tasks, prep checklist
- Termine (events): filterable calendar with preparation status tracking
- Aufgaben (tasks): kanban-style board with assignee and priority
- Vorgänge (cases): political case/issue tracking
- Ausschüsse: committee membership overview
- Profile, Fraktion (members), Dokumente, Kalender sync

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
