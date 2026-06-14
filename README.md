# SPD-Fraktion KL Portal

Vercel/Supabase-Neustart des alten FastAPI-Portals als internes Fraktionscockpit.

## Phase 5: Fraktionsbetriebssystem

Dieser Ausbau macht aus der App ein internes Arbeitscockpit für Fraktionsorganisation:

- RIS-fähiges Terminzentrum mit Vorbereitungstatus
- Aufgaben mit Vorgangsbezug
- Vorgänge / Themenakten
- Dokumente mit Status und Vorgangsverknüpfung
- Ausschüsse und stellvertretende Mitglieder
- Profilkarten mit Ausschusskontext
- öffentliche RIS-Quelle Kaiserslautern als vorbereitete Sync-Quelle
- erster RIS-Sync-Endpunkt unter `/api/ris/sync`

## Aktuelle UI-Richtung

- Echtes Fraktionslogo aus `public/FraktionslogoNeu.svg`
- flaches, schlichtes Interface
- weniger Schatten und weniger schwere Glasflächen
- flüssige, dezente Übergänge
- mobile Navigation über Hamburger-Menü

## Datenquellen

Die ersten 10 Ausschüsse wurden aus den hochgeladenen Anwesenheitslisten übernommen. Weitere 6 Ausschüsse können über dieselbe Struktur ergänzt werden.

Der öffentliche RIS-Kalender der Stadt Kaiserslautern wird als Quelle vorbereitet:

```text
https://ris.kaiserslautern.de/buergerinfo/info.asp
```

## Profil-Login

Der aktuelle Login ist ein Profil-Login für den internen Prototypen. Optional kann in Vercel gesetzt werden:

```env
PORTAL_SHARED_CODE=...
```

Für echte produktive Nutzung sollte danach Supabase Auth mit Magic Links oder einem rollenbasierten Login ergänzt werden.
