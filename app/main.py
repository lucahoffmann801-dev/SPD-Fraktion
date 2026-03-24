from fastapi import FastAPI, Request, Form, Depends, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import os
import shutil
import uuid
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db, get_db, Termin, Dokument, Aufgabe, Mitglied, EmailLog
from app.email_scanner import scan_emails

APP_PASSWORD = os.getenv("APP_PASSWORD", "fraktion2024")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "spd-admin-kl2024")
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="SPD Fraktion KL - Internes Portal")
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")

# Scheduler für automatischen E-Mail-Scan
scheduler = BackgroundScheduler(timezone="Europe/Berlin")


@app.on_event("startup")
def startup_event():
    init_db()
    # Mo–Fr um 17:00 Uhr (Berliner Zeit)
    scheduler.add_job(
        scan_emails,
        CronTrigger(day_of_week="mon-fri", hour=17, minute=0, timezone="Europe/Berlin"),
        id="email_scan_taeglich",
        replace_existing=True,
    )
    scheduler.start()
    print("E-Mail Scanner aktiv: Mo–Fr 17:00 Uhr (Europe/Berlin)")


@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


# --- Auth Helper ---
def check_auth(request: Request):
    return request.cookies.get("auth") in ("user", "admin")

def check_admin(request: Request):
    return request.cookies.get("auth") == "admin"


# --- Routen ---

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, error: str = None):
    return templates.TemplateResponse("login.html", {"request": request, "error": error})


@app.post("/login")
async def login(request: Request, password: str = Form(...)):
    if password == ADMIN_PASSWORD:
        response = RedirectResponse(url="/", status_code=302)
        response.set_cookie("auth", "admin", max_age=86400 * 7)
        return response
    if password == APP_PASSWORD:
        response = RedirectResponse(url="/", status_code=302)
        response.set_cookie("auth", "user", max_age=86400 * 7)
        return response
    return templates.TemplateResponse("login.html", {"request": request, "error": "Falsches Passwort"})


@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("auth")
    return response


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, db: Session = Depends(get_db)):
    if not check_auth(request):
        return RedirectResponse(url="/login")

    heute = date.today().isoformat()
    bevorstehende_alle = db.query(Termin).filter(Termin.datum >= heute).order_by(Termin.datum, Termin.uhrzeit)
    naechste_termine = bevorstehende_alle.limit(5).all()
    anzahl_bevorstehend = bevorstehende_alle.count()
    offene_aufgaben = db.query(Aufgabe).filter(Aufgabe.status != "erledigt").count()
    letzte_scan = db.query(EmailLog).order_by(EmailLog.verarbeitet_am.desc()).first()
    anzahl_mitglieder = db.query(Mitglied).count()

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "naechste_termine": naechste_termine,
        "anzahl_bevorstehend": anzahl_bevorstehend,
        "offene_aufgaben": offene_aufgaben,
        "letzte_scan": letzte_scan,
        "anzahl_mitglieder": anzahl_mitglieder,
        "is_admin": check_admin(request),
        "heute": heute,
    })


# --- Termine ---

@app.get("/termine", response_class=HTMLResponse)
async def termine_liste(
    request: Request,
    db: Session = Depends(get_db),
    monat: str = None,
    jahr: str = None,
    kategorie: str = None,
    gremium: str = None,
    quelle: str = None,
    suche: str = None,
):
    if not check_auth(request):
        return RedirectResponse(url="/login")

    q = db.query(Termin)
    if jahr:
        q = q.filter(Termin.datum.like(f"{jahr}-%"))
    if monat and jahr:
        q = q.filter(Termin.datum.like(f"{jahr}-{monat.zfill(2)}-%"))
    elif monat:
        q = q.filter(Termin.datum.like(f"%-{monat.zfill(2)}-%"))
    if gremium:
        # Gremium-Filter überschreibt Kategorie-Filter (impliziert Kategorie)
        q = q.filter(Termin.titel == gremium)
    elif kategorie:
        q = q.filter(Termin.kategorie == kategorie)
    if quelle:
        q = q.filter(Termin.quelle == quelle)
    if suche:
        q = q.filter(Termin.titel.ilike(f"%{suche}%"))

    termine = q.order_by(Termin.datum, Termin.uhrzeit).all()

    # Für Filter-Dropdowns
    alle_kategorien = [k[0] for k in db.query(Termin.kategorie).distinct().all() if k[0]]
    alle_jahre = sorted(set(t.datum[:4] for t in db.query(Termin).all() if t.datum and len(t.datum) >= 4), reverse=True)

    # Gremien gruppiert nach Kategorie
    ausschuesse = sorted(set(
        t.titel for t in db.query(Termin).filter(Termin.kategorie == "Ausschuss").all()
        if t.titel
    ))
    ortsbeiräte = sorted(set(
        t.titel for t in db.query(Termin).filter(Termin.kategorie == "Ortsbeirat").all()
        if t.titel
    ))

    return templates.TemplateResponse("termine.html", {
        "request": request,
        "termine": termine,
        "alle_kategorien": sorted(alle_kategorien),
        "alle_jahre": alle_jahre,
        "ausschuesse": ausschuesse,
        "ortsbeiräte": ortsbeiräte,
        "filter_monat": monat or "",
        "filter_jahr": jahr or "",
        "filter_kategorie": kategorie or "",
        "filter_gremium": gremium or "",
        "filter_quelle": quelle or "",
        "filter_suche": suche or "",
        "is_admin": check_admin(request),
        "heute": date.today().isoformat(),
    })


@app.post("/termine/neu")
async def termin_neu(
    request: Request,
    titel: str = Form(...),
    datum: str = Form(...),
    uhrzeit: str = Form(None),
    ort: str = Form(None),
    beschreibung: str = Form(None),
    kategorie: str = Form(None),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    from app.email_scanner import errate_kategorie
    kat = kategorie or errate_kategorie(titel)
    termin = Termin(
        titel=titel, datum=datum, uhrzeit=uhrzeit,
        ort=ort, beschreibung=beschreibung,
        quelle="manuell", kategorie=kat, manuell=True
    )
    db.add(termin)
    db.commit()
    return RedirectResponse(url="/termine", status_code=302)


@app.post("/termine/{termin_id}/loeschen")
async def termin_loeschen(request: Request, termin_id: int, db: Session = Depends(get_db)):
    if not check_admin(request):
        raise HTTPException(status_code=403, detail="Nur Admins können Termine löschen")
    termin = db.query(Termin).filter(Termin.id == termin_id).first()
    if termin:
        db.delete(termin)
        db.commit()
    return RedirectResponse(url="/termine", status_code=302)


@app.post("/termine/{termin_id}/bearbeiten")
async def termin_bearbeiten(
    request: Request,
    termin_id: int,
    titel: str = Form(...),
    datum: str = Form(...),
    uhrzeit: str = Form(None),
    ort: str = Form(None),
    beschreibung: str = Form(None),
    kategorie: str = Form(None),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    termin = db.query(Termin).filter(Termin.id == termin_id).first()
    if not termin:
        raise HTTPException(status_code=404)
    from app.email_scanner import errate_kategorie
    termin.titel = titel
    termin.datum = datum
    termin.uhrzeit = uhrzeit or None
    termin.ort = ort or None
    termin.beschreibung = beschreibung or None
    termin.kategorie = kategorie or errate_kategorie(titel)
    db.commit()
    return RedirectResponse(url="/termine", status_code=302)


@app.post("/scan-jetzt")
async def scan_jetzt(request: Request):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    count = scan_emails()
    return JSONResponse({"neue_termine": count})


# --- Dokumente ---

@app.get("/dokumente", response_class=HTMLResponse)
async def dokumente_liste(request: Request, db: Session = Depends(get_db)):
    if not check_auth(request):
        return RedirectResponse(url="/login")
    dokumente = db.query(Dokument).order_by(Dokument.hochgeladen_am.desc()).all()
    kategorien = db.query(Dokument.kategorie).distinct().all()
    return templates.TemplateResponse("dokumente.html", {
        "request": request,
        "dokumente": dokumente,
        "kategorien": [k[0] for k in kategorien if k[0]]
    })


@app.post("/dokumente/hochladen")
async def dokument_hochladen(
    request: Request,
    datei: UploadFile = File(...),
    name: str = Form(None),
    kategorie: str = Form(None),
    beschreibung: str = Form(None),
    hochgeladen_von: str = Form(None),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)

    dateiname = datei.filename
    pfad = os.path.join(UPLOAD_DIR, dateiname)

    # Duplikate vermeiden
    base, ext = os.path.splitext(dateiname)
    counter = 1
    while os.path.exists(pfad):
        dateiname = f"{base}_{counter}{ext}"
        pfad = os.path.join(UPLOAD_DIR, dateiname)
        counter += 1

    with open(pfad, "wb") as f:
        shutil.copyfileobj(datei.file, f)

    dok = Dokument(
        name=name or datei.filename,
        kategorie=kategorie,
        dateipfad=pfad,
        hochgeladen_von=hochgeladen_von,
        beschreibung=beschreibung
    )
    db.add(dok)
    db.commit()
    return RedirectResponse(url="/dokumente", status_code=302)


@app.post("/dokumente/{dok_id}/loeschen")
async def dokument_loeschen(request: Request, dok_id: int, db: Session = Depends(get_db)):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    dok = db.query(Dokument).filter(Dokument.id == dok_id).first()
    if dok:
        if os.path.exists(dok.dateipfad):
            os.remove(dok.dateipfad)
        db.delete(dok)
        db.commit()
    return RedirectResponse(url="/dokumente", status_code=302)


# --- Aufgaben ---

@app.get("/aufgaben", response_class=HTMLResponse)
async def aufgaben_liste(request: Request, db: Session = Depends(get_db)):
    if not check_auth(request):
        return RedirectResponse(url="/login")
    aufgaben = db.query(Aufgabe).order_by(Aufgabe.faellig_am, Aufgabe.prioritaet).all()
    mitglieder = db.query(Mitglied).order_by(Mitglied.name).all()
    return templates.TemplateResponse("aufgaben.html", {
        "request": request,
        "aufgaben": aufgaben,
        "mitglieder": mitglieder,
        "heute": date.today().isoformat(),
    })


@app.post("/aufgaben/neu")
async def aufgabe_neu(
    request: Request,
    titel: str = Form(...),
    beschreibung: str = Form(None),
    zustaendig: str = Form(None),
    faellig_am: str = Form(None),
    prioritaet: str = Form("normal"),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    aufgabe = Aufgabe(
        titel=titel, beschreibung=beschreibung,
        zustaendig=zustaendig, faellig_am=faellig_am,
        prioritaet=prioritaet
    )
    db.add(aufgabe)
    db.commit()
    return RedirectResponse(url="/aufgaben", status_code=302)


@app.post("/aufgaben/{aufgabe_id}/status")
async def aufgabe_status(
    request: Request, aufgabe_id: int,
    status: str = Form(...),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    aufgabe = db.query(Aufgabe).filter(Aufgabe.id == aufgabe_id).first()
    if aufgabe:
        aufgabe.status = status
        db.commit()
    return RedirectResponse(url="/aufgaben", status_code=302)


@app.post("/aufgaben/{aufgabe_id}/loeschen")
async def aufgabe_loeschen(request: Request, aufgabe_id: int, db: Session = Depends(get_db)):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    aufgabe = db.query(Aufgabe).filter(Aufgabe.id == aufgabe_id).first()
    if aufgabe:
        db.delete(aufgabe)
        db.commit()
    return RedirectResponse(url="/aufgaben", status_code=302)


# --- Mitglieder ---

@app.get("/mitglieder", response_class=HTMLResponse)
async def mitglieder_liste(request: Request, db: Session = Depends(get_db)):
    if not check_auth(request):
        return RedirectResponse(url="/login")
    mitglieder = db.query(Mitglied).order_by(Mitglied.name).all()
    return templates.TemplateResponse("mitglieder.html", {"request": request, "mitglieder": mitglieder})


@app.post("/mitglieder/neu")
async def mitglied_neu(
    request: Request,
    name: str = Form(...),
    rolle: str = Form(None),
    telefon: str = Form(None),
    email: str = Form(None),
    ausschuss: str = Form(None),
    notizen: str = Form(None),
    db: Session = Depends(get_db)
):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    mitglied = Mitglied(
        name=name, rolle=rolle, telefon=telefon,
        email=email, ausschuss=ausschuss, notizen=notizen
    )
    db.add(mitglied)
    db.commit()
    return RedirectResponse(url="/mitglieder", status_code=302)


@app.post("/mitglieder/{mitglied_id}/loeschen")
async def mitglied_loeschen(request: Request, mitglied_id: int, db: Session = Depends(get_db)):
    if not check_auth(request):
        raise HTTPException(status_code=403)
    mitglied = db.query(Mitglied).filter(Mitglied.id == mitglied_id).first()
    if mitglied:
        db.delete(mitglied)
        db.commit()
    return RedirectResponse(url="/mitglieder", status_code=302)


# --- iCal Kalender ---

CALENDAR_UID = str(uuid.uuid5(uuid.NAMESPACE_DNS, "spd-fraktion-kaiserslautern.de"))

def _ical_escape(text: str) -> str:
    """Escapes special characters for iCal."""
    return text.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")

def _fold(line: str) -> str:
    """Folds long iCal lines at 75 octets."""
    result = []
    while len(line.encode("utf-8")) > 75:
        result.append(line[:75])
        line = " " + line[75:]
    result.append(line)
    return "\r\n".join(result)

@app.get("/kalender.ics")
async def kalender_ics(db: Session = Depends(get_db)):
    """Öffentlich abonnierbarer iCal-Kalender aller SPD-Fraktion-Termine."""
    termine = db.query(Termin).order_by(Termin.datum).all()
    now_stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SPD Fraktion Kaiserslautern//Terminkalender//DE",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        _fold(f"X-WR-CALNAME:SPD Fraktion Kaiserslautern"),
        _fold(f"X-WR-CALDESC:Termine der SPD-Fraktion im Stadtrat Kaiserslautern"),
        "X-WR-TIMEZONE:Europe/Berlin",
    ]

    for termin in termine:
        # Datum parsen
        try:
            d = datetime.strptime(str(termin.datum), "%Y-%m-%d")
        except ValueError:
            continue

        # UID pro Termin
        uid = f"{termin.id}-spd-fraktion-kl@kaiserslautern"

        if termin.uhrzeit:
            try:
                t = datetime.strptime(str(termin.uhrzeit), "%H:%M")
                dtstart = d.replace(hour=t.hour, minute=t.minute)
                # Ende = 1 Stunde später (Standarddauer)
                from datetime import timedelta
                dtend = dtstart + timedelta(hours=1)
                dtstart_str = dtstart.strftime("%Y%m%dT%H%M%S")
                dtend_str   = dtend.strftime("%Y%m%dT%H%M%S")
                lines += [
                    "BEGIN:VEVENT",
                    f"UID:{uid}",
                    f"DTSTAMP:{now_stamp}",
                    f"DTSTART;TZID=Europe/Berlin:{dtstart_str}",
                    f"DTEND;TZID=Europe/Berlin:{dtend_str}",
                ]
            except ValueError:
                dtstart_str = d.strftime("%Y%m%d")
                lines += [
                    "BEGIN:VEVENT",
                    f"UID:{uid}",
                    f"DTSTAMP:{now_stamp}",
                    f"DTSTART;VALUE=DATE:{dtstart_str}",
                ]
        else:
            dtstart_str = d.strftime("%Y%m%d")
            lines += [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{now_stamp}",
                f"DTSTART;VALUE=DATE:{dtstart_str}",
            ]

        lines.append(_fold(f"SUMMARY:{_ical_escape(termin.titel)}"))

        if termin.ort:
            lines.append(_fold(f"LOCATION:{_ical_escape(termin.ort)}"))

        desc_parts = []
        if termin.kategorie:
            desc_parts.append(f"Kategorie: {termin.kategorie}")
        if termin.beschreibung:
            desc_parts.append(termin.beschreibung)
        if termin.quelle == "email" and termin.email_subject:
            desc_parts.append(f"Quelle: E-Mail ({termin.email_subject})")
        elif termin.quelle == "ris":
            desc_parts.append("Quelle: Ratsinformationssystem Kaiserslautern")
        if desc_parts:
            lines.append(_fold(f"DESCRIPTION:{_ical_escape(chr(10).join(desc_parts))}"))

        lines.append("END:VEVENT")

    lines.append("END:VCALENDAR")

    ical_content = "\r\n".join(lines) + "\r\n"

    # KEIN Content-Disposition: attachment → Browser/Kalender-Apps abonnieren statt herunterladen
    return Response(
        content=ical_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-store",
            "X-WR-CALNAME": "SPD Fraktion Kaiserslautern",
        },
    )
