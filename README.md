# SPD-Fraktion KL Portal

Vercel/Supabase-Neustart des alten FastAPI-Portals als internes Fraktionscockpit.

## Aktuelle UI-Richtung

- Echtes Fraktionslogo aus `public/fraktionslogo.svg`
- deutlich flacheres, schlichteres Interface
- weniger Schatten und weniger schwere Glasflächen
- flüssige, dezente Übergänge
- mobile Navigation über Hamburger-Menü

## Profil-Login

Der aktuelle Login ist ein Profil-Login für den internen Prototypen. Optional kann in Vercel gesetzt werden:

```env
PORTAL_SHARED_CODE=...
```

Für echte produktive Nutzung sollte danach Supabase Auth mit Magic Links oder einem rollenbasierten Login ergänzt werden.
