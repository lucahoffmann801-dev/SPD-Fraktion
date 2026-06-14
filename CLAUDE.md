# CLAUDE.md — AI Assistant Context

This file gives Claude, ChatGPT, and other AI assistants everything needed to work on this codebase confidently. Read it fully before making any changes.

---

## What this project is

Internal portal for the **SPD-Fraktion Kaiserslautern** (German city council faction).  
Features: calendar/events, tasks, political cases, committee memberships, documents, member profiles, ICS calendar sync.

**Language of the UI**: German. All labels, button text, section titles, and user-facing strings are in German. Keep this when editing UI code.

---

## Primary deployment target: `artifacts/portal-next/`

The canonical production artifact is **`artifacts/portal-next/`** — a Next.js 15 (App Router) application that contains both the full frontend SPA and all API routes. It is deployed to Vercel.

The old `artifacts/portal/` (Vite+React SPA) and `artifacts/api-server/` (Express 5) are **legacy Replit-only artifacts** kept for parallel running during transition. Do not add new features there — all new work goes into `portal-next`.

---

## Monorepo layout

```
artifacts/portal-next/     Next.js 15 — PRIMARY (Vercel deployment)
artifacts/portal/          Legacy Vite+React SPA (Replit only, do not add features)
artifacts/api-server/      Legacy Express 5 API (Replit only, do not add features)
artifacts/portal-mobile/   Expo React Native mobile app
lib/api-spec/              OpenAPI 3.1 spec — source of truth for API shape
lib/api-zod/               Zod schemas (auto-generated, DO NOT edit by hand)
lib/api-client-react/      TanStack Query hooks (auto-generated, DO NOT edit by hand)
lib/db/                    Drizzle ORM schema + migrations
lib/object-storage-web/    React upload components
```

Package names follow `@workspace/<name>` convention.

---

## Key files to know (portal-next)

| File | What it does |
|---|---|
| `artifacts/portal-next/app/layout.tsx` | Root layout — imports all 8 CSS files in order |
| `artifacts/portal-next/app/page.tsx` | Entry page — imports `ClientHome` (Server Component) |
| `artifacts/portal-next/app/client-home.tsx` | **"use client"** wrapper with `dynamic(..., { ssr: false })` |
| `artifacts/portal-next/src/pages/home.tsx` | **Entire portal SPA** — all views, all UI logic, all state (`"use client"`) |
| `artifacts/portal-next/app/api/data/route.ts` | `GET /api/data` — aggregates all portal data, contains full demo data |
| `artifacts/portal-next/app/api/auth/profiles/route.ts` | `GET /api/auth/profiles` — login profile list |
| `artifacts/portal-next/app/api/auth/session/route.ts` | `POST /api/auth/session` — login, token issuance |
| `artifacts/portal-next/app/api/records/route.ts` | `POST/PATCH/DELETE /api/records` — generic CRUD |
| `artifacts/portal-next/app/api/work-orders/route.ts` | `PATCH /api/work-orders` — work order updates |
| `artifacts/portal-next/app/api/ics/route.ts` | `GET /api/ics` — ICS calendar feed |
| `artifacts/portal-next/src/server/supabase.ts` | Server-side Supabase client (may return null) |
| `artifacts/portal-next/src/server/uploadAuth.ts` | HMAC upload token sign/verify |
| `artifacts/portal-next/src/server/objectStorage.ts` | Replit Object Storage client |
| `artifacts/portal-next/src/lib/` | Browser-side: types, demo data, Supabase client, calendar utils |
| `artifacts/portal-next/next.config.ts` | Next.js config: basePath from BASE_PATH env, standalone output |

---

## CSS architecture (portal-next)

All CSS lives in `artifacts/portal-next/src/`:

- `globals.css` — main stylesheet, all CSS custom properties, mobile block at bottom
- `interface-polish.css` — UI micro-polish (shadows, transitions, hover states)
- `mobile-monday.css` — mobile-specific component overrides
- `visual-tuning.css` — final visual pass (colors, spacing tweaks)
- `work-orders.css` — work order / task styles
- `termine-filter.css` — event filter styles
- `progress-slider.css` — progress bar / slider styles
- `task-assignment.css` — assignee picker styles

All 8 are imported in `app/layout.tsx` in this exact order. Preserve the order.

**Mobile breakpoint**: `@media (max-width: 860px)` — all mobile overrides go inside this block.  
**iOS safe areas**: use `env(safe-area-inset-bottom)` for tab bar and bottom sheets.  
**No Tailwind** — plain CSS custom properties only. Variables defined in `globals.css` (`:root { --red: ...; --surface: ...; ... }`).

---

## Architecture decisions (critical — do not violate)

### 1. Single-page app, no router

`src/pages/home.tsx` is the entire portal UI. Navigation is a React `useState` called `view`. There is no React Router, no Wouter routing. Do not add page routing.

### 2. Demo-mode fallback (always present)

The app works fully without Supabase. Every API route checks `if (!supabase) return NextResponse.json(demoData)`. Do not remove this pattern. Demo data is embedded inline in the route files (not imported from separate files).

### 3. ssr: false must be in a Client Component

`next/dynamic` with `ssr: false` is not allowed in Server Components (Next.js 15 enforces this). The pattern used:

```tsx
// app/client-home.tsx — "use client" wrapper
"use client";
import dynamic from "next/dynamic";
const Home = dynamic(() => import("@/pages/home"), { ssr: false });
export default function ClientHome() { return <Home />; }

// app/page.tsx — Server Component, just imports the wrapper
import ClientHome from "./client-home";
export default function Page() { return <ClientHome />; }
```

Do not move `ssr: false` back into a Server Component.

### 4. Supabase key separation

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser client, read-only, respects Row Level Security
- `SUPABASE_SERVICE_ROLE_KEY` — server only (API routes), full access, bypasses RLS
- Never expose the service role key to the browser (never use `NEXT_PUBLIC_` prefix)
- The server-side `getSupabase()` in `src/server/supabase.ts` prefers the service role key, falls back to anon key

### 5. Description-field markers (tasks)

The `tasks.description` field encodes metadata as inline text markers (legacy Supabase compatibility):
- `[progress:75]` — progress percentage
- `[assignees:slug1,slug2]` — multiple assignees
- `[visible:private:slug1,slug2]` — restrict visibility
- `[Patrick→Luca]` or `[Patrick-Luca]` — marks as a work order

`normalizeTaskPayload()` in `app/api/records/route.ts` strips/parses these on every write. Do not bypass this normalization.

### 6. Upload authentication

Upload tokens are HMAC-signed, issued at `/api/auth/session` for permitted profiles.  
Upload permission slugs are hardcoded in `src/server/uploadAuth.ts` (`UPLOAD_ALLOWED_SLUGS`).  
Token is sent as `X-Portal-Upload-Token` header to `POST /api/storage/uploads/request-url`.

### 7. Generated files — never edit by hand

`lib/api-zod/src/` and `lib/api-client-react/src/` are auto-generated by Orval from the OpenAPI spec.  
To change: edit `lib/api-spec/openapi.yaml`, then run `pnpm --filter @workspace/api-spec run codegen`.

### 8. basePath in Next.js

`next.config.ts` reads `BASE_PATH` env var (set by Replit artifact system) and strips trailing slash:
```ts
const basePath = (process.env.BASE_PATH || "").replace(/\/$/, "");
```
On Vercel, `BASE_PATH` is not set → basePath is empty string → app served from root `/`. Correct behavior.

---

## Environment variables

### In Vercel (production)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key (browser-safe, respects RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role key (server-only, bypasses RLS) |
| `PORTAL_SHARED_CODE` | Optional | Shared access code for login (omit = no password) |
| `PORTAL_UPLOAD_SECRET` | Optional | HMAC secret for upload tokens (min 32 chars) |

Missing optional vars = graceful degradation (demo mode), not a crash.

### In Replit (development)

Additional Replit-specific vars (not needed on Vercel):

| Variable | Description |
|---|---|
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Replit Object Storage bucket |
| `PRIVATE_OBJECT_DIR` | Path prefix for private storage objects |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Comma-separated paths for public objects |
| `BASE_PATH` | Set by Replit artifact system (e.g. `/portal-next/`) |

---

## Supabase: full connection guide

### How the app connects to Supabase

**Browser (client components):**
Uses `src/lib/supabase.ts` (or similar in `src/lib/`). Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Subject to Row Level Security.

**Server (API routes):**
Uses `src/server/supabase.ts`. Reads env vars in this priority order:
1. `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (preferred — full access)
2. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback)
3. Legacy aliases: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Replit backwards compat)
4. If none set → returns `null` → demo mode

### Supabase database schema

All tables use **text primary keys** (not UUIDs, not serial integers) to match the demo data IDs.

#### `profiles`
```sql
create table profiles (
  id text primary key,                   -- e.g. "p-01"
  slug text unique not null,             -- e.g. "patrick-schaefer"
  full_name text not null,               -- "Patrick Schäfer"
  display_name text,                     -- "Patrick"
  role text,                             -- "Fraktionsvorsitzender"
  board_role text,                       -- "Vorsitzender" (null if none)
  portal_role text,                      -- see values below
  is_council_member boolean default false,
  is_staff boolean default false,
  email text,
  phone text,
  committees text[],
  bio text,
  permissions text[] default '{}',       -- see values below
  avatar_initials text,                  -- "PS"
  accent text default 'red',             -- CSS color name
  sort_order integer default 999,        -- display order
  login_enabled boolean default true
);
```

`portal_role` values: `fraktionsvorsitz`, `stellvertretung`, `ratsmitglied`, `fraktionssekretariat`

`permissions` values: `termine`, `aufgaben`, `dokumente`, `kalender`, `profile`, `admin`, `admin-lite`

#### `events`
```sql
create table events (
  id text primary key,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean default false,
  location text,
  description text,
  category text,                         -- "Stadtrat", "Ausschuss", "Intern", etc.
  source text,                           -- "sitzungskalender_2026", "supabase", etc.
  source_uid text,                       -- original UID from ICS source
  owner text,
  relevance text default 'offen',        -- "offen", "relevant", "nicht-relevant"
  status text default 'scheduled',       -- "scheduled", "cancelled"
  meeting_body text,                     -- Gremium name
  preparation_status text default 'offen', -- "offen", "in-bearbeitung", "erledigt"
  requires_preparation boolean default false,
  decision_needed boolean default false,
  created_at timestamptz default now()
);
```

**Important**: The API merges hardcoded `sitzungskalender2026` events with Supabase events, deduplicating by `[starts_at:title]` key. Supabase events with matching keys override the static ones.

#### `tasks`
```sql
create table tasks (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,                      -- may contain inline markers (see architecture #5)
  assignee text,                         -- primary assignee slug
  assignees text[] default '{}',         -- all assignee slugs
  status text default 'offen',           -- "offen", "in-bearbeitung", "erledigt", "verworfen"
  priority text default 'normal',        -- "niedrig", "normal", "hoch", "dringend"
  progress integer default 0,            -- 0–100
  is_work_order boolean default false,   -- Patrick→Luca work orders
  visibility text default 'all',         -- "all", "private"
  visible_to text[] default '{}',        -- slugs allowed to see private tasks
  due_date date,
  event_id text,                         -- linked event
  case_id text,                          -- linked case
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `members`
```sql
create table members (
  id text primary key,
  name text not null,
  role text,
  committees text[]
);
```

#### `documents`
```sql
create table documents (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  storage_path text,                     -- path in object storage
  content_type text,
  size integer,
  uploaded_by text,                      -- profile slug
  category text,
  url text,                              -- direct URL if not in storage
  description text,
  owner text,
  document_date date,
  status text default 'freigegeben',     -- "freigegeben", "arbeitsstand", "archiviert"
  kind text,                             -- "Arbeitsordner", "Beschluss", etc.
  created_at timestamptz default now()
);
```

#### `committees`
```sql
create table committees (
  id text primary key,                   -- e.g. "c-ba"
  slug text unique not null,             -- e.g. "bauausschuss"
  title text not null,                   -- "Bauausschuss"
  short_ref text,                        -- "BA"
  source text,
  notes text
);
```

#### `committee_memberships`
```sql
create table committee_memberships (
  id text primary key,
  committee_slug text references committees(slug),
  person_name text not null,             -- full name string (not a profile slug)
  role text default 'member',            -- "member" or "substitute"
  sort_order integer default 999,
  source_file text
);
```

Note: `person_name` is a free-text name, not a foreign key to `profiles`. Council members who are not portal members appear here.

#### `cases`
```sql
create table cases (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,
  status text default 'offen',
  category text,
  assignee text,                         -- profile slug
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `calendar_sources`
```sql
create table calendar_sources (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text default 'ics',
  url text,
  owner text,
  enabled boolean default true,
  last_synced_at timestamptz,
  notes text,
  created_at timestamptz default now()
);
```

#### `sync_logs`
```sql
create table sync_logs (
  id text primary key default gen_random_uuid()::text,
  source_id text references calendar_sources(id),
  status text,
  message text,
  events_added integer default 0,
  events_updated integer default 0,
  created_at timestamptz default now()
);
```

### Row Level Security recommendation

All writes go through the server-side API routes using the service role key (bypasses RLS).  
The anon key is used browser-side for any direct Supabase reads.

Minimal RLS setup:
```sql
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
alter table members enable row level security;
alter table documents enable row level security;
alter table committees enable row level security;
alter table committee_memberships enable row level security;
alter table cases enable row level security;
alter table calendar_sources enable row level security;
alter table sync_logs enable row level security;

-- Allow anon read on non-sensitive tables
create policy "anon read" on profiles for select using (true);
create policy "anon read" on events for select using (true);
create policy "anon read" on members for select using (true);
create policy "anon read" on committees for select using (true);
create policy "anon read" on committee_memberships for select using (true);
-- tasks, cases, documents: server-only (service role key bypasses RLS, anon gets nothing)
```

---

## Running the project

```bash
# Install all dependencies
pnpm install

# Run Next.js portal (primary — port assigned by PORT env or 3000)
pnpm --filter @workspace/portal-next run dev

# Typecheck everything
pnpm run typecheck

# Build Next.js for production
pnpm --filter @workspace/portal-next run build

# Legacy Replit artifacts (do not add features here)
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/portal run dev
pnpm --filter @workspace/portal-mobile run dev
```

---

## Common tasks

### Add a new view/section to the portal

1. Add a new tab to the bottom nav in `home.tsx` (mobile) and sidebar (desktop)
2. Add a case to the `view` state switch in the render logic
3. Add the view component inline in `home.tsx` (keep everything in one file unless explicitly told otherwise)
4. Add any new CSS class to the appropriate CSS file in `artifacts/portal-next/src/`

### Add a new API route (Next.js)

1. Create `artifacts/portal-next/app/api/<name>/route.ts`
2. Export async functions named `GET`, `POST`, `PATCH`, `DELETE` as needed
3. Always handle the `!supabase` case with demo data fallback
4. If it's a new endpoint shape: also add to `lib/api-spec/openapi.yaml` and run codegen

### Add a new database table

1. Define in `lib/db/src/schema/index.ts` using Drizzle's `pgTable`
2. Add the table name to `ALLOWED_TABLES` in `app/api/records/route.ts` if it needs generic CRUD
3. Add SQL to the Supabase SQL Editor

### Change profile images

Profile images live in `artifacts/portal-next/public/profile-images/`.  
The mapping `profileImageBySlug` in `home.tsx` maps slugs to image paths.  
Format: JPEG, named `<slug>.jpeg`.

### Regenerate API types after spec change

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Gotchas

- **`home.tsx` is intentionally large** — all views are inline. Do not refactor into separate files unless explicitly asked.
- **`ssr: false` must be in a Client Component** — this is a Next.js 15 hard requirement. The pattern is `client-home.tsx` wrapping the dynamic import. See architecture decision #3.
- **CSS mobile block**: Mobile overrides must be inside `@media (max-width: 860px)` in `globals.css`. Accidentally placing rules outside will affect desktop.
- **pnpm only** — `npm install` or `yarn` will be rejected by the preinstall hook.
- **Generated files**: Never edit `lib/api-zod/src/` or `lib/api-client-react/src/` manually.
- **Supabase null check**: `getSupabase()` can return `null`. Every API route must handle this gracefully with a demo-data fallback.
- **Task description markers**: The `description` field encodes structured data as text markers. Always pass tasks through `normalizeTaskPayload()` on write.
- **DELETE reads from JSON body**: The `DELETE /api/records` handler reads `table` and `id` from the JSON request body (not query string). This is intentional and correct.
- **React version**: Pinned to `19.1.0` (exact) because Expo requires it. Do not change.
- **esbuild version**: Pinned to `0.27.3` in workspace overrides (for legacy api-server). Do not bump.
- **basePath on Vercel**: `BASE_PATH` env is not set on Vercel → `basePath` is `""` → app at root `/`. On Replit the artifact system sets `BASE_PATH=/portal-next/`.
- **Sitzungskalender 2026 is hardcoded**: 55 entries for 2026 are embedded in `app/api/data/route.ts`. They are merged with Supabase events at runtime. Events with the same `[starts_at:title]` key from Supabase override the static ones.
