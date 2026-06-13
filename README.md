# SPD-Fraktion KL Portal

Massiver Vercel/Supabase-Neustart des alten FastAPI-Portals.

## Was neu ist

- Next.js App Router für Vercel
- Supabase als Backend
- Fraktionscockpit mit Dashboard
- Terminverwaltung
- Aufgaben-Board
- Mitgliederübersicht
- Dokumentenbereich
- Kalenderquellen für Apple/ICS
- iCal-Export unter `/api/ics`
- Vercel Cron-Endpunkt unter `/api/cron/sync`
- Fallback/Demo-Daten, falls Supabase noch nicht konfiguriert ist

## Wichtige Sicherheitshinweise

- Kein normales Apple-ID-Passwort speichern.
- Für Patrick zuerst einen freigegebenen Apple-Kalender als ICS-Link nutzen.
- CalDAV kann später ergänzt werden, dann nur mit app-spezifischem Apple-Passwort.
- Den Supabase-Key nicht in GitHub committen.
- Vercel Environment Variables verwenden.
- Die RLS-Policies in `supabase/schema.sql` sind bewusst prototypisch offen und müssen vor echtem produktivem Einsatz auf Auth/Rollen umgestellt werden.

## Setup auf Vercel

1. Vercel-Projekt mit diesem Repository verbinden.
2. Environment Variables setzen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dwbkqpdspbpitzqbjryu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
CRON_SECRET=...
```

3. In Supabase im SQL Editor `supabase/schema.sql` ausführen.
4. Deploy auf Vercel starten.
5. `/api/data` prüfen.
6. `/api/ics` als Kalender abonnieren.

## Hinweis zur aktuellen Vercel-Verknüpfung

Das aktuell über die Tools sichtbare Vercel-Projekt heißt `nextjs` und ist mit dem privaten Repo `lucahoffmann801-dev/nextjs` verbunden. Dieses Repo wirkt nach dem Stand der Deployments eher wie die Kreta-App. Deshalb wurde der SPD-Ausbau hier im Repo `lucahoffmann801-dev/SPD-Fraktion` als eigener Branch vorbereitet, damit nichts Bestehendes überschrieben wird.

## Nächster Ausbau

- ICS-Import vollständig aktivieren: Quellen aus `calendar_sources` abrufen, Events parsen und via `source_uid` upserten.
- Auth ergänzen: Luca/Patrick Login mit Rollen.
- Dokumente mit Supabase Storage verbinden.
- E-Mail-Scanner aus dem alten Python-Projekt als Edge/Route-Logik neu bauen.
- Änderungsverlauf und Benachrichtigungen einbauen.
