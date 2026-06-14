# SPD-Fraktion Kaiserslautern — Internes Portal

Internes Fraktionsportal für die SPD-Stadtratsfraktion Kaiserslautern.  
Verwaltet Termine, Aufgaben, Vorgänge, Ausschüsse, Profile, Dokumente und Kalender-Sync.

---

## Überblick

Das Portal besteht aus drei Hauptteilen:

| Artifact | Zweck | Pfad |
|---|---|---|
| `portal` | React-Web-App (Desktop + Mobil) | `artifacts/portal/` |
| `api-server` | Express 5 Backend | `artifacts/api-server/` |
| `portal-mobile` | Expo React Native App | `artifacts/portal-mobile/` |

Gemeinsam genutzte Bibliotheken unter `lib/`:

| Paket | Zweck |
|---|---|
| `lib/api-spec` | OpenAPI 3.1 Spec (Quelle der Wahrheit) |
| `lib/api-zod` | Zod-Schemas (aus OpenAPI generiert, für Server) |
| `lib/api-client-react` | TanStack Query Hooks (aus OpenAPI generiert, für Frontend) |
| `lib/db` | PostgreSQL + Drizzle ORM, Schema-Definition |
| `lib/object-storage-web` | React-Komponenten für Datei-Uploads |

---

## Stack

- **Runtime**: Node.js 24, TypeScript 5.9
- **Paketmanager**: pnpm (Workspaces)
- **Backend**: Express 5
- **Datenbank**: PostgreSQL + Drizzle ORM + Drizzle Kit
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Frontend**: React 19, Vite 7
- **Mobile**: Expo (React Native)
- **API-Codegen**: Orval (aus OpenAPI Spec)
- **Build**: esbuild (CJS-Bundle für API-Server)
- **Supabase**: Optional — als Datenbank-Proxy (Anon-Key client-seitig, Service-Role-Key server-seitig)
- **Storage**: Replit Object Storage (GCS-backed, Presigned URLs)

---

## Voraussetzungen & Setup

### 1. Abhängigkeiten installieren

```bash
pnpm install
```

### 2. Umgebungsvariablen setzen

Datei `.env` im Root anlegen (oder in Replit als Secrets):

```env
# Datenbank (Drizzle ORM)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Supabase (optional — ohne diese Werte läuft die App im Demo-Modus)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Portal-Zugangscode (optional — ohne diesen Wert: kein Passwortschutz)
PORTAL_SHARED_CODE=geheim123

# Upload-Authentifizierung (HMAC-Secret für Upload-Tokens)
PORTAL_UPLOAD_SECRET=random-secret-min-32-chars

# Replit Object Storage Buckets
DEFAULT_OBJECT_STORAGE_BUCKET_ID=bucket-id
PRIVATE_OBJECT_DIR=private/
PUBLIC_OBJECT_SEARCH_PATHS=public/documents,public/assets
```

> **Demo-Modus**: Fehlen `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, arbeitet die App vollständig mit eingebetteten Demo-Daten (read-only). Kein Absturz, kein Fehler.

### 3. Datenbank-Schema anwenden

```bash
# Schema auf die DB pushen (dev-only, kein Migration-File)
pnpm --filter @workspace/db run push

# oder Migrations generieren und anwenden:
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run migrate
```

### 4. API-Code neu generieren (nach OpenAPI-Änderungen)

```bash
pnpm --filter @workspace/api-spec run codegen
```

Generiert:
- `lib/api-zod/src/` — Zod-Schemas für den Server
- `lib/api-client-react/src/` — TanStack Query Hooks für das Frontend

---

## Entwicklung starten

```bash
# API-Server (Port 5000)
pnpm --filter @workspace/api-server run dev

# Web-Portal
pnpm --filter @workspace/portal run dev

# Mobile App (Expo)
pnpm --filter @workspace/portal-mobile run dev
```

---

## Build & Typecheck

```bash
# Typecheck aller Pakete
pnpm run typecheck

# Build aller Pakete (typecheck + bundle)
pnpm run build
```

---

## Datenbankschema (Supabase / PostgreSQL)

Das Schema wird in Supabase verwaltet. Drizzle ORM ist für lokale Migrationen vorbereitet (Schema-Definitionen unter `lib/db/src/schema/`).

### Tabellen

#### `profiles`
Portalmitglieder / Login-Profile

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID (z.B. `p-01`) |
| `slug` | `text` | URL-freundlicher Name (z.B. `patrick-schaefer`) |
| `full_name` | `text` | Vollständiger Name |
| `display_name` | `text` | Kurzname für UI |
| `role` | `text` | Funktionsbezeichnung |
| `board_role` | `text?` | Vorstandsfunktion |
| `portal_role` | `text` | Technische Rolle (`fraktionsvorsitz`, `stellvertretung`, `ratsmitglied`, `fraktionssekretariat`) |
| `is_council_member` | `bool` | Ratsmitglied? |
| `is_staff` | `bool` | Verwaltungs-/Büromitarbeiter? |
| `permissions` | `text[]` | Erlaubte Bereiche (`termine`, `aufgaben`, `dokumente`, `kalender`, `profile`, `admin`, `admin-lite`) |
| `avatar_initials` | `text` | Kürzel für Avatar-Fallback |
| `accent` | `text` | Farb-Accent (z.B. `red`, `blue`) |
| `sort_order` | `int` | Reihenfolge in der Profilauswahl |
| `login_enabled` | `bool` | Account aktiv? |
| `email` | `text?` | E-Mail |
| `phone` | `text?` | Telefon |
| `bio` | `text?` | Kurzbiografie |

#### `events`
Termine / Sitzungskalender

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `title` | `text` | Terminbezeichnung |
| `starts_at` | `timestamptz` | Beginn |
| `ends_at` | `timestamptz?` | Ende |
| `all_day` | `bool` | Ganztägig? |
| `location` | `text?` | Ort |
| `description` | `text?` | Beschreibung |
| `category` | `text` | Kategorie (`Stadtrat`, `Ausschuss`, `Intern`, etc.) |
| `source` | `text` | Quelle (`sitzungskalender_2026`, `supabase`, etc.) |
| `source_uid` | `text?` | Original-UID aus Kalenderquelle |
| `owner` | `text?` | Zuständigkeit |
| `relevance` | `text` | Relevanz (`offen`, `relevant`, `erledigt`) |
| `status` | `text` | Status (`scheduled`, `cancelled`) |
| `meeting_body` | `text?` | Gremium |
| `preparation_status` | `text` | Vorbereitung (`offen`, `in-bearbeitung`, `erledigt`) |
| `requires_preparation` | `bool` | Vorbereitung nötig? |
| `decision_needed` | `bool` | Beschluss erforderlich? |

#### `tasks`
Aufgaben / Arbeitspakete

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `title` | `text` | Aufgabentitel |
| `description` | `text?` | Beschreibung (enthält Marker: `[progress:N]`, `[assignees:slug,slug]`, `[visible:private:slug]`, `[Patrick→Luca]`) |
| `assignee` | `text?` | Primär-Assignee (Slug) |
| `assignees` | `text[]` | Alle Assignees (Slugs) |
| `status` | `text` | `offen`, `in-bearbeitung`, `erledigt`, `verworfen` |
| `priority` | `text` | `niedrig`, `mittel`, `hoch`, `dringend` |
| `progress` | `int` | Fortschritt 0–100 |
| `is_work_order` | `bool` | Arbeitsauftrag Patrick→Luca? |
| `visibility` | `text` | `all`, `private` |
| `visible_to` | `text[]` | Slugs, die private Aufgabe sehen dürfen |
| `due_date` | `date?` | Fälligkeitsdatum |

> **Beschreibungs-Marker**: Die `description`-Spalte enthält kodierte Metadaten als Inline-Marker (Legacy-Format für Supabase-Kompatibilität). Der API-Server normalisiert diese beim Schreiben/Lesen automatisch.

#### `members`
Stadtratsmitglieder (öffentliche Fraktion-Übersicht)

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `name` | `text` | Vollständiger Name |
| `role` | `text` | Funktion |
| `committees` | `text[]` | Ausschuss-Zugehörigkeiten |

#### `documents`
Dokumente / Dateien

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `title` | `text` | Dokumentname |
| `storage_path` | `text` | Pfad im Object Storage |
| `content_type` | `text` | MIME-Typ |
| `size` | `int` | Dateigröße in Bytes |
| `uploaded_by` | `text` | Profil-Slug des Uploaders |
| `created_at` | `timestamptz` | Upload-Zeitpunkt |
| `category` | `text?` | Dokumentkategorie |

#### `committees` / `committee_memberships`
Ausschüsse und Mitgliedschaften

| Tabelle | Spalten |
|---|---|
| `committees` | `id`, `name`, `short_name`, `category` |
| `committee_memberships` | `id`, `profile_id`, `committee_id`, `role` (`mitglied`/`stellvertreter`) |

#### `cases`
Politische Vorgänge / Issues

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `title` | `text` | Vorgangstitel |
| `description` | `text?` | Beschreibung |
| `status` | `text` | Status |
| `category` | `text?` | Kategorie |
| `assignee` | `text?` | Zuständig (Slug) |

#### `calendar_sources`
Externe ICS-Kalenderquellen für automatischen Sync

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | `text` | Eindeutige ID |
| `name` | `text` | Anzeigename |
| `url` | `text` | ICS-URL |
| `active` | `bool` | Aktiv? |
| `last_synced_at` | `timestamptz?` | Letzter Sync |

---

## API-Routen

Basis-URL: `/api`

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/healthz` | Health Check |
| `GET` | `/auth/profiles` | Liste der Login-Profile |
| `POST` | `/auth/session` | Login mit Profil + Zugangscode |
| `GET` | `/data` | Alle Portal-Daten aggregiert (Events, Tasks, Members, Docs, …) |
| `POST` | `/records` | Neuen Datensatz anlegen |
| `PATCH` | `/records` | Datensatz aktualisieren |
| `DELETE` | `/records` | Datensatz löschen |
| `PATCH` | `/work-orders` | Arbeitsauftrag-Status + Fortschritt aktualisieren |
| `GET` | `/ics` | Dynamischer ICS-Kalender-Feed |
| `POST` | `/storage/uploads/request-url` | Presigned Upload-URL generieren |
| `GET` | `/storage/public-objects/:path` | Öffentliche Datei aus Storage abrufen |
| `GET` | `/storage/objects/:path` | Private Datei aus Storage abrufen |

### `/records` — erlaubte Tabellen

`events`, `tasks`, `members`, `documents`, `calendar_sources`, `profiles`, `cases`, `committees`, `committee_memberships`

### Upload-Authentifizierung

Upload-Tokens werden bei `/auth/session` ausgestellt (HMAC-signiert mit `PORTAL_UPLOAD_SECRET`).  
Upload-berechtigt sind nur bestimmte Profil-Slugs (hardcoded in `lib/uploadAuth.ts`).  
Erlaubte MIME-Typen: PDF, Word (`.doc`/`.docx`), Excel (`.xls`/`.xlsx`). Max. 20 MB.

---

## Architektur-Entscheidungen

### Demo-Modus (Offline-First)
Die App funktioniert vollständig ohne Supabase/Datenbank. Alle Routen fallen auf eingebettete Demo-Daten zurück. Das ist kein Fehlerfall, sondern Feature für lokale Entwicklung und Präsentationen.

### Single-Page-App
`artifacts/portal/src/pages/home.tsx` enthält alle Views. Navigation erfolgt über React-State (`view`), kein Router.

### Anon-Key vs. Service-Role-Key
- **Anon-Key** (`VITE_SUPABASE_ANON_KEY`): Client-seitig (Browser) — nur Lesezugriff auf erlaubte Tabellen via Row Level Security.
- **Service-Role-Key** (`SUPABASE_SERVICE_ROLE_KEY`): Server-seitig (API-Server) — voller Zugriff, umgeht RLS für Schreiboperationen.

### API-Codegen-Workflow
1. OpenAPI Spec ändern: `lib/api-spec/openapi.yaml`
2. Codegen ausführen: `pnpm --filter @workspace/api-spec run codegen`
3. Generierte Dateien in `lib/api-zod/` und `lib/api-client-react/` werden committed

### Drizzle vs. Supabase
Drizzle ORM ist für lokale Datenbankmigrationen und TypeScript-Typen zuständig.  
Supabase ist der Produktions-Datenbankhost mit eigenem Auth-Layer.  
Beide Schichten sind entkoppelt — Drizzle schreibt nie direkt in Supabase, das läuft über den API-Server.

---

## Projektstruktur

```
/
├── artifacts/
│   ├── api-server/           # Express 5 Backend
│   │   └── src/
│   │       ├── routes/       # API-Routen (portal-auth, portal-data, portal-records, …)
│   │       └── lib/          # supabase.ts, uploadAuth.ts, objectStorage.ts
│   ├── portal/               # Vite + React Web-App
│   │   └── src/
│   │       ├── pages/home.tsx       # Haupt-SPA (alle Views)
│   │       ├── lib/                 # Types, Demo-Daten, Supabase-Client
│   │       ├── components/          # UI-Komponenten
│   │       ├── hooks/               # React Hooks
│   │       ├── globals.css          # Haupt-Stylesheet
│   │       ├── interface-polish.css # UI-Detailverfeinerungen
│   │       ├── mobile-monday.css    # Mobile-spezifische Styles
│   │       └── visual-tuning.css    # Visuelle Feinabstimmung
│   └── portal-mobile/        # Expo React Native App
│
├── lib/
│   ├── api-spec/             # OpenAPI 3.1 Spec (openapi.yaml)
│   ├── api-zod/              # Generierte Zod-Schemas (Server-Validation)
│   ├── api-client-react/     # Generierte TanStack Query Hooks
│   ├── db/                   # Drizzle ORM: Schema, Migrationen, DB-Client
│   └── object-storage-web/   # Upload-Komponenten für Browser
│
├── pnpm-workspace.yaml       # Workspace-Konfiguration
├── tsconfig.base.json        # Basis-TypeScript-Konfiguration
└── package.json              # Root-Scripts (build, typecheck)
```

---

## Mobile Breakpoints

- Desktop: `> 860px`
- Mobil: `≤ 860px` (`@media (max-width: 860px)` in `globals.css`)
- Safe Area Insets für iOS: `env(safe-area-inset-bottom)` im Tab-Bar und Sheet-Komponenten

---

## Lizenzen

Privates internes Tool — nicht für öffentliche Nutzung.
