# SPD-Fraktion Kaiserslautern — Internes Portal

Internes Fraktionsportal für die SPD-Stadtratsfraktion Kaiserslautern.  
Verwaltet Termine, Aufgaben, Vorgänge, Ausschüsse, Profile, Dokumente und Kalender-Sync.

> **Produktions-App**: `artifacts/portal-next/` — Next.js 15, läuft auf Vercel  
> **Legacy (Replit-only)**: `artifacts/portal/` + `artifacts/api-server/` — Vite + Express, wird abgelöst

---

## Überblick

### Produktions-Stack (Vercel)

| Artifact | Zweck | Pfad |
|---|---|---|
| `artifacts/portal-next/` | Next.js 15 App — Web-UI + alle API-Routen | → Vercel |
| `artifacts/portal-mobile/` | Expo React Native App | → EAS Build |

### Gemeinsame Bibliotheken (`lib/`)

| Paket | Zweck |
|---|---|
| `lib/api-spec` | OpenAPI 3.1 Spec (Quelle der Wahrheit) |
| `lib/api-zod` | Zod-Schemas (aus OpenAPI generiert, nicht manuell editieren) |
| `lib/api-client-react` | TanStack Query Hooks (aus OpenAPI generiert, nicht manuell editieren) |
| `lib/db` | PostgreSQL + Drizzle ORM, Schema-Definition |
| `lib/object-storage-web` | React-Komponenten für Datei-Uploads |

---

## Stack

- **Runtime**: Node.js 24, TypeScript 5.9
- **Paketmanager**: pnpm (Workspaces)
- **Frontend + Backend**: Next.js 15 (App Router) — UI und API-Routen in einem Paket
- **Datenbank**: Supabase (PostgreSQL) — App läuft auch ohne Supabase im Demo-Modus
- **Mobile**: Expo (React Native)
- **Deployment**: Vercel (Next.js), EAS Build (Expo)
- **Storage**: Replit Object Storage (GCS-backed, Presigned URLs) — nur in Replit-Umgebung

---

## Lokale Entwicklung

### 1. Abhängigkeiten installieren

```bash
pnpm install
```

### 2. Umgebungsvariablen setzen

Datei `.env.local` in `artifacts/portal-next/` anlegen:

```env
# Supabase (optional — ohne diese Werte läuft die App im Demo-Modus)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Portal-Zugangscode (optional — ohne diesen Wert: kein Passwortschutz)
PORTAL_SHARED_CODE=geheim123

# Upload-Authentifizierung (HMAC-Secret für Upload-Tokens, mind. 32 Zeichen)
PORTAL_UPLOAD_SECRET=random-secret-min-32-chars

# Replit Object Storage (nur in Replit-Umgebung relevant)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=bucket-id
PRIVATE_OBJECT_DIR=/bucket-id/private
PUBLIC_OBJECT_SEARCH_PATHS=/bucket-id/public
```

> **Demo-Modus**: Fehlen die Supabase-Variablen, arbeitet die App vollständig mit eingebetteten Demo-Daten (read-only, kein Absturz, kein Fehler). Ideal für lokale Entwicklung ohne DB.

### 3. Next.js Dev-Server starten

```bash
pnpm --filter @workspace/portal-next run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

### Vercel-Konfiguration

`vercel.json` im Repository-Root ist bereits konfiguriert:

```json
{
  "buildCommand": "pnpm --filter @workspace/portal-next run build",
  "outputDirectory": "artifacts/portal-next/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Umgebungsvariablen in Vercel setzen

In den Vercel-Projekteinstellungen → Environment Variables:

| Variable | Wert | Wo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (Anon Key) | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (Service Role Key) | Production only |
| `PORTAL_SHARED_CODE` | Zugangscode für Login | Production, Preview |
| `PORTAL_UPLOAD_SECRET` | HMAC-Secret (≥32 Zeichen) | Production, Preview |

> **Sicherheitshinweis**: `SUPABASE_SERVICE_ROLE_KEY` ist ein Server-Secret und darf **nie** mit `NEXT_PUBLIC_` Präfix gesetzt werden. Er ist nur in API-Routen (Server-side) verfügbar.

### Supabase-Tabellen anlegen

Bevor das Portal Daten speichern kann, müssen die Tabellen in Supabase angelegt werden. Siehe Abschnitt [Datenbankschema](#datenbankschema) unten.

SQL-Befehle können direkt im Supabase SQL Editor ausgeführt werden.

---

## Supabase Setup (Schritt für Schritt)

### 1. Projekt anlegen

1. [supabase.com](https://supabase.com) → Neues Projekt anlegen
2. Region: Frankfurt (`eu-central-1`) empfohlen
3. Passwort sicher speichern

### 2. API-Zugangsdaten abrufen

Supabase Dashboard → Settings → API:

- **Project URL**: `https://xxx.supabase.co`
- **anon key** (public): Für `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (secret): Für `SUPABASE_SERVICE_ROLE_KEY`

### 3. Tabellen anlegen

Im Supabase SQL Editor folgenden Code ausführen:

```sql
-- profiles: Portalmitglieder / Login-Profile
create table profiles (
  id text primary key,
  slug text unique not null,
  full_name text not null,
  display_name text,
  role text,
  board_role text,
  portal_role text,
  is_council_member boolean default false,
  is_staff boolean default false,
  email text,
  phone text,
  committees text[],
  bio text,
  permissions text[] default '{}',
  avatar_initials text,
  accent text default 'red',
  sort_order integer default 999,
  login_enabled boolean default true
);

-- events: Termine / Sitzungskalender
create table events (
  id text primary key,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean default false,
  location text,
  description text,
  category text,
  source text,
  source_uid text,
  owner text,
  relevance text default 'offen',
  status text default 'scheduled',
  meeting_body text,
  preparation_status text default 'offen',
  requires_preparation boolean default false,
  decision_needed boolean default false,
  created_at timestamptz default now()
);

-- tasks: Aufgaben / Arbeitspakete
create table tasks (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,
  assignee text,
  assignees text[] default '{}',
  status text default 'offen',
  priority text default 'normal',
  progress integer default 0,
  is_work_order boolean default false,
  visibility text default 'all',
  visible_to text[] default '{}',
  due_date date,
  event_id text,
  case_id text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- members: Ratsmitglieder (öffentliche Übersicht)
create table members (
  id text primary key,
  name text not null,
  role text,
  committees text[]
);

-- documents: Hochgeladene Dokumente
create table documents (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  storage_path text,
  content_type text,
  size integer,
  uploaded_by text,
  category text,
  url text,
  description text,
  owner text,
  document_date date,
  status text default 'freigegeben',
  kind text,
  created_at timestamptz default now()
);

-- committees: Ausschüsse
create table committees (
  id text primary key,
  slug text unique not null,
  title text not null,
  short_ref text,
  source text,
  notes text
);

-- committee_memberships: Ausschussmitgliedschaften
create table committee_memberships (
  id text primary key,
  committee_slug text references committees(slug),
  person_name text not null,
  role text default 'member',
  sort_order integer default 999,
  source_file text
);

-- cases: Politische Vorgänge
create table cases (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,
  status text default 'offen',
  category text,
  assignee text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- calendar_sources: Externe ICS-Kalenderquellen
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

-- sync_logs: Kalender-Sync-Protokoll
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

### 4. Row Level Security (RLS)

Das Portal verwendet den **Service Role Key** server-seitig, der RLS umgeht. Für den Anon Key (client-seitig) sollte RLS aktiviert und nur Lesezugriff gewährt werden.

Einfachste Konfiguration — alle Tabellen öffentlich lesbar:

```sql
-- RLS aktivieren
alter table profiles enable row level security;
alter table events enable row level security;
alter table tasks enable row level security;
-- ... (für alle Tabellen)

-- Lesezugriff für alle (anon key)
create policy "public read" on profiles for select using (true);
create policy "public read" on events for select using (true);
-- Schreibzugriffe gehen immer über den API-Server mit Service Role Key
```

### 5. Daten aus Demo-Modus übernehmen

Beim ersten Start im Demo-Modus zeigt die App alle 13 Fraktionsmitglieder, den Sitzungskalender 2026 und alle Ausschüsse. Diese Demo-Daten können als SQL-INSERT in Supabase übernommen werden — bei Bedarf auf Anfrage generieren.

---

## Build & Typecheck

```bash
# Typecheck aller Pakete
pnpm run typecheck

# Next.js Build (für Vercel)
pnpm --filter @workspace/portal-next run build

# Build aller Pakete
pnpm run build
```

---

## Datenbankschema

Vollständige Feldliste: siehe `CLAUDE.md` (AI-Kontext) oder den SQL-Block oben.

Kurzzusammenfassung:

| Tabelle | Zweck |
|---|---|
| `profiles` | Portalmitglieder, Login-Accounts, Berechtigungen |
| `events` | Termine, Sitzungskalender, Vorbereitungsstatus |
| `tasks` | Aufgaben, Arbeitspakete, Arbeitsaufträge |
| `members` | Ratsmitglieder (öffentliche Fraktionsliste) |
| `documents` | Hochgeladene Dokumente |
| `committees` | Ausschüsse |
| `committee_memberships` | Ausschussmitgliedschaften (ordentlich/stellvertretend) |
| `cases` | Politische Vorgänge |
| `calendar_sources` | Externe ICS-Kalenderquellen |
| `sync_logs` | Kalender-Sync-Protokoll |

---

## API-Routen (Next.js)

Alle Routen unter `artifacts/portal-next/app/api/`:

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/healthz` | Health Check |
| `GET` | `/api/auth/profiles` | Login-Profile laden |
| `POST` | `/api/auth/session` | Login: Profil + Zugangscode validieren, Token ausstellen |
| `GET` | `/api/data` | Alle Portal-Daten aggregiert (Events, Tasks, Members, …) |
| `POST` | `/api/records` | Datensatz anlegen |
| `PATCH` | `/api/records` | Datensatz aktualisieren |
| `DELETE` | `/api/records` | Datensatz löschen |
| `PATCH` | `/api/work-orders` | Arbeitsauftrag-Status/Fortschritt aktualisieren |
| `GET` | `/api/ics` | ICS-Kalender-Feed |
| `POST` | `/api/storage/uploads/request-url` | Presigned Upload-URL |
| `GET` | `/api/storage/public-objects/[...path]` | Öffentliche Datei aus Storage |
| `GET` | `/api/storage/objects/[...path]` | Private Datei aus Storage |

---

## Projektstruktur

```
/
├── artifacts/
│   ├── portal-next/              # PRIMÄR — Next.js 15, Vercel-Deployment
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root Layout (CSS-Importe)
│   │   │   ├── page.tsx          # Einstiegspunkt → client-home.tsx
│   │   │   ├── client-home.tsx   # Client Component mit ssr:false dynamic import
│   │   │   └── api/              # API-Routen (Next.js Route Handlers)
│   │   └── src/
│   │       ├── pages/home.tsx    # Haupt-SPA (alle Views, "use client")
│   │       ├── lib/              # Types, Demo-Daten, Supabase-Client (browser)
│   │       ├── server/           # Server-only: supabase.ts, uploadAuth.ts, objectStorage.ts
│   │       └── *.css             # Stylesheets (globals, mobile, polish, …)
│   ├── portal/                   # Legacy Vite+React (Replit-only)
│   ├── api-server/               # Legacy Express 5 (Replit-only)
│   └── portal-mobile/            # Expo React Native App
│
├── lib/
│   ├── api-spec/                 # OpenAPI 3.1 Spec
│   ├── api-zod/                  # Generierte Zod-Schemas
│   ├── api-client-react/         # Generierte TanStack Query Hooks
│   ├── db/                       # Drizzle ORM Schema + Migrationen
│   └── object-storage-web/       # Upload-Komponenten
│
├── vercel.json                   # Vercel-Deployment-Konfiguration
├── pnpm-workspace.yaml           # Workspace-Konfiguration
└── tsconfig.base.json            # Basis TypeScript-Konfiguration
```

---

## Lizenz

Privates internes Tool — nicht für öffentliche Nutzung.
