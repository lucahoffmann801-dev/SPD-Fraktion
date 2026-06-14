"""
Email-Scanner – SPD Fraktion Kaiserslautern
Strategie:
  1. Bekannte Absender (sitzungsdienst, pressestelle, koo) → dedizierter Parser
  2. Alle anderen → Claude Haiku (schnell, günstig, zuverlässig)
  3. Kein API-Key → nur bekannte Absender verarbeiten, Rest ignorieren
"""
import imaplib
import email
import re
import os
import json
from email.header import decode_header
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

load_dotenv()

IMAP_HOST         = os.getenv("IMAP_HOST", "secureimap.t-online.de")
IMAP_PORT         = int(os.getenv("IMAP_PORT", 993))
EMAIL_ADDRESS     = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD    = os.getenv("EMAIL_PASSWORD")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Bekannte Absender mit dediziertem Parser
BEKANNTE_ABSENDER = {
    "sitzungsdienst@kaiserslautern.de": "sitzungsdienst",
    "pressestelle@kaiserslautern.de":   "pressestelle",
    "nadin.robarge@kaiserslautern.de":  "koo",
}

MONATE = {
    "januar":1,"februar":2,"märz":3,"maerz":3,"april":4,"mai":5,"juni":6,
    "juli":7,"august":8,"september":9,"oktober":10,"november":11,"dezember":12,
    "jan":1,"feb":2,"mär":3,"mar":3,"apr":4,"jun":6,"jul":7,"aug":8,
    "sep":9,"sept":9,"okt":10,"nov":11,"dez":12,
}

KATEGORIE_MAP = {
    "Stadtrat":                   ["stadtrat"],
    "Haupt- und Finanzausschuss": ["haupt- und finanzausschuss","hfa"],
    "Bauausschuss":               ["bauausschuss"],
    "Umweltausschuss":            ["umweltausschuss"],
    "Sozialausschuss":            ["sozialausschuss"],
    "Jugendhilfeausschuss":       ["jugendhilfeausschuss"],
    "Kulturausschuss":            ["kulturausschuss"],
    "Sportausschuss":             ["sportausschuss"],
    "Schulträgerausschuss":       ["schulträgerausschuss"],
    "Rechnungsprüfungsausschuss": ["rechnungsprüfungsausschuss"],
    "Ortsbeirat":                 ["ortsbeirat"],
    "Fraktionssitzung":           ["fraktionssitzung","spd-fraktion","spd fraktion"],
    "Sonstiges":                  ["arbeitskreis","ak ","ak tik"],
    "Ausschuss":                  ["ausschuss"],
    "Veranstaltung":              ["vernissage","eröffnung","feier","tagung"],
}


# ── Encoding ─────────────────────────────────────────────────────

def decode_str(s):
    if s is None:
        return ""
    if isinstance(s, bytes):
        return s.decode("utf-8", errors="replace")
    parts = decode_header(s)
    result = ""
    for part, enc in parts:
        if isinstance(part, bytes):
            try:
                result += part.decode(enc or "utf-8", errors="replace")
            except (LookupError, UnicodeDecodeError):
                result += part.decode("latin-1", errors="replace")
        else:
            result += part
    return result


def get_email_body(msg):
    """Extrahiert Textbody mit korrektem Charset (wichtig für dt. Behörden-Mails)."""
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype   = part.get_content_type()
            charset = part.get_content_charset() or "latin-1"
            if ctype == "text/plain":
                raw = part.get_payload(decode=True)
                if raw:
                    try:
                        body += raw.decode(charset, errors="replace")
                    except LookupError:
                        body += raw.decode("latin-1", errors="replace")
            elif ctype == "text/html" and not body:
                raw = part.get_payload(decode=True)
                if raw:
                    try:
                        html = raw.decode(charset, errors="replace")
                    except LookupError:
                        html = raw.decode("latin-1", errors="replace")
                    body += re.sub(r'<[^>]+>', ' ', html)
    else:
        charset = msg.get_content_charset() or "latin-1"
        raw = msg.get_payload(decode=True)
        if raw:
            try:
                body = raw.decode(charset, errors="replace")
            except LookupError:
                body = raw.decode("latin-1", errors="replace")
    # Whitespace bereinigen
    body = re.sub(r'[ \t]{3,}', ' ', body)
    body = re.sub(r'\n{4,}', '\n\n', body)
    return body.strip()


def get_sender_address(msg):
    von = decode_str(msg.get("From", ""))
    m = re.search(r'<([^>]+)>', von)
    return (m.group(1) if m else von).lower().strip()


# ── Datum / Uhrzeit ───────────────────────────────────────────────

def normalize_datum(tag, monat, jahr):
    try:
        t = int(str(tag).strip())
        j = int(str(jahr).strip())
        m_str = str(monat).strip()
        if m_str.isdigit():
            m = int(m_str)
        else:
            m = MONATE.get(m_str.lower())
            if m is None:
                return None
        if not (1 <= t <= 31 and 1 <= m <= 12 and 2025 <= j <= 2030):
            return None
        return date(j, m, t).isoformat()
    except (ValueError, TypeError):
        return None


def ist_zukunft(datum_str):
    try:
        return date.fromisoformat(datum_str) >= date.today() - timedelta(days=1)
    except Exception:
        return False


def uhrzeit_aus_text(text):
    """Findet Uhrzeiten die explizit als solche markiert sind (mit 'Uhr' oder 'um')."""
    m = re.search(
        r'(?:um\s+|Beginn\s*:?\s*|ab\s+)(\d{1,2})[.:](\d{2})\s*(?:Uhr)?'
        r'|(\d{1,2})[.:](\d{2})\s+Uhr',
        text, re.IGNORECASE
    )
    if m:
        h_s  = m.group(1) or m.group(3)
        mi_s = m.group(2) or m.group(4)
        if h_s:
            h = int(h_s)
            if 0 <= h <= 23:
                return f"{h:02d}:{mi_s}"
    return None


def errate_kategorie(text):
    low = (text or "").lower()
    for kat, kws in KATEGORIE_MAP.items():
        if any(kw in low for kw in kws):
            return kat
    return "Sonstiges"


def bereinige_betreff(subject):
    s = re.sub(r'^(re|fwd|fw|aw|wg|antw|pe)\s*:\s*', '', subject or "", flags=re.I).strip()
    s = re.sub(r'\s*(?:am\s+\w+,?\s*)?\d{1,2}\.\d{1,2}\.\d{4}.*$', '', s).strip()
    s = re.sub(r'\s*[;,]\s*(einladung|tagesordnung|mit tagesordnung).*$', '', s, flags=re.I).strip()
    return s or (subject or "")


# ── Dedizierte Parser ─────────────────────────────────────────────

def parse_sitzungsdienst(subject, body):
    """
    sitzungsdienst@kaiserslautern.de:
    Betreff: "Umweltausschuss am Montag, 23.06.2026; Einladung mit Tagesordnung"
    """
    # Datum aus Betreff
    m = re.search(
        r'^(.+?)\s+am\s+(?:\w+,?\s*)?(\d{1,2})\.(\d{1,2})\.(\d{4})',
        subject, re.IGNORECASE
    )
    if m:
        datum = normalize_datum(m.group(2), m.group(3), m.group(4))
        if datum and ist_zukunft(datum):
            titel = bereinige_betreff(m.group(1).strip())
            return [{"titel": titel, "datum": datum,
                     "uhrzeit": uhrzeit_aus_text(body),
                     "ort": "Rathaus Kaiserslautern",
                     "kategorie": errate_kategorie(titel)}]

    # Vergangenheitsbezug → kein Termin
    if re.search(r'\bvom\b\s+\d{1,2}\.\d{1,2}\.\d{4}', subject, re.I):
        return []

    # Datum nur im Body
    dm = re.search(r'\bam\s+(\d{1,2})\.(\d{1,2})\.(\d{4})\b', body, re.I)
    if dm:
        datum = normalize_datum(dm.group(1), dm.group(2), dm.group(3))
        if datum and ist_zukunft(datum):
            titel = bereinige_betreff(subject)
            return [{"titel": titel, "datum": datum,
                     "uhrzeit": uhrzeit_aus_text(body),
                     "ort": "Rathaus Kaiserslautern",
                     "kategorie": errate_kategorie(titel)}]
    return []


def parse_pressestelle(subject, body):
    """
    pressestelle@kaiserslautern.de:
    Body: "Datum und Ort: Mittwoch, 25. März 2026, 12.30 Uhr, Kaiserbrunnen"
    """
    pat = re.compile(
        r'Datum\s+und\s+Ort\s*:?\s*(?:\w+,?\s*)?'
        r'(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s+(\d{4})'
        r'(?:[,\s]+(\d{1,2})[.:](\d{2})\s*Uhr)?'
        r'(?:[,\s]+([^\n]{3,60}))?',
        re.IGNORECASE
    )
    termine = []
    for m in pat.finditer(body):
        datum = normalize_datum(m.group(1), m.group(2), m.group(3))
        if not datum or not ist_zukunft(datum):
            continue
        uhrzeit = f"{int(m.group(4)):02d}:{m.group(5)}" if m.group(4) else None
        ort = (m.group(6) or "").strip() or None
        titel = bereinige_betreff(subject)
        termine.append({"titel": titel, "datum": datum, "uhrzeit": uhrzeit,
                        "ort": ort, "kategorie": errate_kategorie(titel)})
    return termine


def parse_koo(subject, body):
    """Koordinierungsprotokolle: 'nächste Sitzung ist auf Montag, den 13.04.2026 anberaumt'"""
    m = re.search(
        r'n[äa]chste\s+(?:\w+\s+)?(?:ist\s+(?:auf|am)\s+)?'
        r'(?:\w+,?\s*)?(?:den\s+)?(\d{1,2})\.(\d{1,2})\.(\d{4})',
        body, re.IGNORECASE
    )
    if m:
        datum = normalize_datum(m.group(1), m.group(2), m.group(3))
        if datum and ist_zukunft(datum):
            titel = bereinige_betreff(subject) or "KOO-Sitzung"
            return [{"titel": titel, "datum": datum,
                     "uhrzeit": uhrzeit_aus_text(body),
                     "ort": "Rathaus Kaiserslautern",
                     "kategorie": "Ausschuss"}]
    return []


# ── Claude-Analyse ────────────────────────────────────────────────

def analyse_mit_claude(subject, body, sender):
    """
    Nutzt Claude Haiku für alle unbekannten Absender.
    Haiku: schnell, günstig (~$0.30/Monat für tägliche Scans), zuverlässig.
    """
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        heute = date.today().isoformat()

        # Body bereinigen
        body_gekuerzt = "\n".join(
            line for line in (body or "").splitlines() if line.strip()
        )[:2500]
        if not body_gekuerzt.strip():
            return []

        prompt = f"""Du analysierst eine E-Mail der SPD-Fraktion Kaiserslautern auf bevorstehende Termine.
Heute: {heute}

Von: {sender}
Betreff: {subject}

E-Mail:
{body_gekuerzt}

AUFGABE: Extrahiere bevorstehende Termine (Datum ≥ {heute}).

AUFNAHME NUR WENN ALLE 4 KRITERIEN ERFÜLLT:
1. THEMA: Klarer, konkreter Terminname (nicht nur "Termin" oder "Sitzung")
2. DATUM: Konkretes Datum mit Tag, Monat, Jahr
3. UHRZEIT: Konkrete Uhrzeit – AUSNAHME: explizit ganztägige Veranstaltungen (z.B. Feiertag, Messe)
4. ORT: Vollständige, konkrete Ortsangabe (Gebäudename + Straße ODER bekanntes Gebäude wie "Rathaus Kaiserslautern", "Pfalzbau", etc.)
   → "Kaiserslautern" allein reicht NICHT
   → "Jugendzentrum" allein reicht NICHT – muss "Jugendzentrum, Steinstraße 47, Kaiserslautern" sein
   → Suche aktiv im gesamten Text nach Straße, Hausnummer, Gebäudebezeichnung

NICHT aufnehmen:
- Vergangene Daten, Protokolle, Versionsangaben, Signaturen, URLs
- Sendedatum der E-Mail
- Spam, Werbung, Verifizierungsmails, Rechnungen
- Fristen/Deadlines ohne Veranstaltungscharakter
- Termine bei denen Ort ODER Uhrzeit fehlen (außer nachweislich ganztägig)

Titel: 3–8 Wörter, präzise (z.B. "Stadtratssitzung", "Vernissage Stadtmuseum Kaiserslautern")
ganztaegig: true nur wenn explizit ganztägig, sonst false

Antworte NUR mit JSON:
[{{"titel":"...","datum":"YYYY-MM-DD","uhrzeit":"HH:MM oder null","ganztaegig":false,"ort":"vollständige Adresse","kategorie":"Stadtrat|Fraktionssitzung|Ausschuss|Ortsbeirat|Veranstaltung|Sonstiges"}}]"""

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.content[0].text.strip()
        text = re.sub(r'```(?:json)?\s*', '', text).strip()
        m = re.search(r'\[.*\]', text, re.DOTALL)
        if not m:
            return []

        result = json.loads(m.group())
        valide = []
        for t in result:
            d = t.get("datum", "")
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
                continue
            if not ist_zukunft(d):
                continue
            titel = (t.get("titel") or "").strip()
            if len(titel) < 5:
                continue
            # Uhrzeit Pflicht – außer ganztägig
            uhrzeit = (t.get("uhrzeit") or "").strip()
            ganztaegig = t.get("ganztaegig", False)
            if not uhrzeit and not ganztaegig:
                continue
            # Ort Pflicht – muss konkret sein (mehr als nur "Kaiserslautern")
            ort = (t.get("ort") or "").strip()
            if not ort or len(ort) < 8:
                continue
            # Vage Orte ablehnen
            vage_orte = ["kaiserslautern", "online", "tbd", "wird noch", "unbekannt", "n/a"]
            if ort.lower() in vage_orte:
                continue
            valide.append(t)
        return valide

    except Exception as e:
        print(f"Claude Fehler: {e}")
        return []


# ── Duplikat-Check ────────────────────────────────────────────────

def bereits_vorhanden(db, datum, titel):
    from app.database import Termin
    existing = db.query(Termin).filter(Termin.datum == datum).all()
    titel_l = titel.lower()
    words_new = {w for w in titel_l.split() if len(w) > 3}
    for e in existing:
        if e.titel.lower() == titel_l:
            return True
        if len(words_new) >= 2:
            words_ex = {w for w in e.titel.lower().split() if len(w) > 3}
            if words_new and words_ex:
                if len(words_new & words_ex) / max(len(words_new), len(words_ex)) >= 0.7:
                    return True
    return False


# ── Hauptfunktion ─────────────────────────────────────────────────

def scan_emails():
    """Wird täglich Mo–Fr um 17:00 Uhr aufgerufen."""
    from app.database import SessionLocal, EmailLog, Termin

    db = SessionLocal()
    neue_termine_count = 0
    hat_claude = bool(ANTHROPIC_API_KEY and not ANTHROPIC_API_KEY.startswith("sk-ant-HIER"))

    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        mail.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        mail.select("INBOX")

        # Nur Mails seit dem letzten Scan (oder letzte 3 Monate beim ersten Mal)
        letzter_scan = db.query(EmailLog).order_by(EmailLog.verarbeitet_am.desc()).first()
        if letzter_scan:
            # Einen Tag Puffer damit keine Mail verloren geht
            since = (letzter_scan.verarbeitet_am.date() - timedelta(days=1)).strftime("%d-%b-%Y")
        else:
            since = (date.today() - timedelta(days=90)).strftime("%d-%b-%Y")
        _, message_ids = mail.search(None, f'SINCE {since}')
        ids = message_ids[0].split()
        ids_to_scan = ids

        for msg_id in reversed(ids_to_scan):
            _, msg_data = mail.fetch(msg_id, "(RFC822)")
            raw = msg_data[0][1]
            msg = email.message_from_bytes(raw)

            message_id   = msg.get("Message-ID", str(msg_id))
            subject      = decode_str(msg.get("Subject", ""))
            von          = decode_str(msg.get("From", ""))
            datum_header = msg.get("Date", "")
            sender       = get_sender_address(msg)

            if db.query(EmailLog).filter(EmailLog.message_id == message_id).first():
                continue

            body = get_email_body(msg)

            # ── Extraktionsstrategie ──────────────────────────────
            absender_typ = BEKANNTE_ABSENDER.get(sender)

            if absender_typ == "sitzungsdienst":
                termine = parse_sitzungsdienst(subject, body)
            elif absender_typ == "pressestelle":
                termine = parse_pressestelle(subject, body)
            elif absender_typ == "koo":
                termine = parse_koo(subject, body)
            elif hat_claude:
                termine = analyse_mit_claude(subject, body, sender)
            else:
                termine = []   # Kein Key → lieber nichts als Müll

            # ── Speichern ─────────────────────────────────────────
            count = 0
            for t in termine:
                d = t.get("datum", "")
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', d):
                    continue
                if not ist_zukunft(d):
                    continue
                titel = (t.get("titel") or "").strip()
                if len(titel) < 5:
                    continue
                # Uhrzeit oder ganztägig erforderlich
                uhrzeit = (t.get("uhrzeit") or "").strip() or None
                ganztaegig = t.get("ganztaegig", False)
                if not uhrzeit and not ganztaegig:
                    continue
                # Ort: wenn fehlend → Hinweis, aber trotzdem aufnehmen
                ort = (t.get("ort") or "").strip() or None
                beschreibung = (t.get("beschreibung") or "").strip() or None
                if not ort or len(ort) < 8:
                    ort = None
                    hinweis = "Bitte Luca nach dem genauen Ort fragen."
                    beschreibung = (beschreibung + "\n" + hinweis) if beschreibung else hinweis
                if bereits_vorhanden(db, d, titel):
                    continue

                db.add(Termin(
                    titel=titel,
                    datum=d,
                    uhrzeit=t.get("uhrzeit"),
                    ort=ort,
                    beschreibung=beschreibung,
                    quelle="email",
                    kategorie=t.get("kategorie") or errate_kategorie(titel),
                    email_subject=subject,
                    manuell=False
                ))
                count += 1
                neue_termine_count += 1

            db.add(EmailLog(
                message_id=message_id,
                subject=subject,
                von=von,
                datum=datum_header,
                termine_gefunden=count
            ))
            db.commit()

        mail.logout()
        print(f"[{datetime.now().strftime('%d.%m.%Y %H:%M')}] Scan abgeschlossen: {neue_termine_count} neue Termine")

    except Exception as e:
        print(f"[{datetime.now().strftime('%d.%m.%Y %H:%M')}] Scan-Fehler: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

    return neue_termine_count
