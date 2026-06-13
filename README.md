# SPD-Fraktion KL Portal

Vercel/Supabase-Neustart des alten FastAPI-Portals als internes Fraktionscockpit.

## Neu in diesem Ausbau

- Next.js App Router für Vercel
- Supabase als Backend
- modernes Glass-Design
- Portal-Branding mit Fraktionslogo
- Profil-Login für alle 12 Ratsmitglieder und Luca Hoffmann als Fraktionssekretär
- personalisiertes Dashboard
- Terminverwaltung
- Aufgaben-Board
- Profile und Rollenrechte
- Mitgliederübersicht
- Dokumentenbereich
- Kalenderquellen für Apple/ICS
- iCal-Export unter `/api/ics`
- Vercel Cron-Endpunkt unter `/api/cron/sync`

## Profile

Die Profile werden in `public.profiles` gespeichert. Enthalten sind die 12 Ratsmitglieder der SPD-Fraktion Kaiserslautern sowie Luca Hoffmann als Fraktionssekretär / Organisation.

## Login

Der aktuelle Login ist ein Profil-Login für den internen Prototypen. Optional kann in Vercel gesetzt werden:

```env
PORTAL_SHARED_CODE=...
```

Wenn diese Variable gesetzt ist, muss beim Profil-Login zusätzlich dieser Zugangscode eingegeben werden. Für echte produktive Nutzung sollte danach Supabase Auth mit Magic Links oder einem rollenbasierten Login ergänzt werden.

## Sicherheit

- Kein normales Apple-ID-Passwort speichern.
- Für Patrick zuerst einen freigegebenen Apple-Kalender als ICS-Link nutzen.
- CalDAV später nur mit app-spezifischem Apple-Passwort ergänzen.
- Supabase-Key nicht in GitHub committen.
- Vercel Environment Variables verwenden.
- Die RLS-Policies in den Migrationen sind für den Prototypen offen und müssen vor echtem produktivem Einsatz auf Auth/Rollen umgestellt werden.

## Setup auf Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://dwbkqpdspbpitzqbjryu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
PORTAL_SHARED_CODE=...
CRON_SECRET=...
```

Supabase GitHub Integration ist auf `main` eingerichtet. Migrationen liegen unter `supabase/migrations` und werden bei Merge nach `main` angewendet.

## Hinweis

Das bestehende `nextjs`-/Kreta-Projekt und seine Domains werden nicht verändert. Dieser Ausbau liegt im Repo `lucahoffmann801-dev/SPD-Fraktion`.
