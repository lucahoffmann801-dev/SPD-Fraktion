# SPD-Fraktion Kaiserslautern — Internes Portal

Ein internes Fraktionsportal für Termine, Aufgaben, Vorgänge, Ausschüsse, Profile, Dokumente und Kalender-Sync.

## Run & Operate

```bash
# Primäres Artifact (Next.js 15 — Vercel-Deployment)
pnpm --filter @workspace/portal-next run dev

# Legacy Replit-Artifacts
pnpm --filter @workspace/api-server run dev   # Port 5000
pnpm --filter @workspace/portal run dev

# Alles
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen  # nach OpenAPI-Änderungen
```

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **PRIMARY**: Next.js 15 (App Router) in `artifacts/portal-next/` → Vercel
- **Legacy (Replit only)**: Express 5 (`artifacts/api-server/`) + Vite React (`artifacts/portal/`)
- Mobile: Expo React Native (`artifacts/portal-mobile/`)
- DB: Supabase (PostgreSQL) — App läuft ohne Supabase im Demo-Modus
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/portal-next/app/` — Next.js App Router (layouts, pages, API routes)
- `artifacts/portal-next/src/pages/home.tsx` — Haupt-SPA (alle Views, "use client")
- `artifacts/portal-next/src/lib/` — Browser-Typen, Demo-Daten, Supabase-Client
- `artifacts/portal-next/src/server/` — Server-only: supabase.ts, uploadAuth.ts, objectStorage.ts
- `artifacts/portal-next/src/*.css` — Stylesheets (8 Dateien)
- `artifacts/portal-next/public/` — Profilfotos, Icons, Logo

## Architecture decisions

- Single-page app: Navigation ist React-State (`view`), kein Router
- App läuft ohne Supabase: Alle API-Routen fallen auf Demo-Daten zurück
- `ssr: false` muss in einer Client Component sein (`app/client-home.tsx`)
- Supabase: Anon Key (browser, RLS), Service Role Key (server only, bypasses RLS)
- API-Routen proxien Supabase-Mutations — Service Role Key bleibt server-seitig
- DELETE `/api/records` liest `table`/`id` aus JSON-Body (nicht Query-String)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `ssr: false` in Next.js 15 muss in `"use client"` Komponente (`client-home.tsx`)
- Sitzungskalender 2026 (55 Einträge) ist hardcoded in `app/api/data/route.ts`, wird mit Supabase-Events gemergt
- CSS-Reihenfolge in `app/layout.tsx` muss erhalten bleiben (8 Dateien)
- React pinned auf `19.1.0` (exact) wegen Expo-Kompatibilität

## Pointers

- Vollständige KI-Anleitung: `CLAUDE.md`
- Supabase-Setup (SQL, RLS, Env-Vars): `README.md` und `CLAUDE.md`
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
