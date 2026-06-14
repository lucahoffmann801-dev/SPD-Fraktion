"""
Einmalig ausführen: python seed_ris_termine.py
Importiert alle Stadtratssitzungen 2026 aus dem RIS Kaiserslautern.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Termin, init_db

init_db()
db = SessionLocal()

# Alle bestehenden RIS-Termine entfernen (sauberer Neuimport)
db.query(Termin).filter(Termin.quelle == "ris").delete()
db.commit()

RATHAUS_GROSS = "Großer Ratssaal (1. OG), Rathaus, Willy-Brandt-Platz 1, Kaiserslautern"
RATHAUS_KLEIN = "Kleiner Ratssaal (1. OG), Rathaus, Willy-Brandt-Platz 1, Kaiserslautern"

def t(datum, uhrzeit, titel, ort, kategorie):
    return dict(datum=datum, uhrzeit=uhrzeit, titel=titel, ort=ort, kategorie=kategorie)

termine = [
    # März 2026
    t("2026-03-02","15:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-02","15:24","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-02","16:30","Digitalisierungsausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-03","16:30","Hospitalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-03","18:30","Ortsbeirat Siegelbach","Bernhard-Schwehm-Saal, Finkenstraße 14, Kaiserslautern","Ortsbeirat"),
    t("2026-03-09","16:00","Arbeitskreis Haushalt",RATHAUS_GROSS,"Sonstiges"),
    t("2026-03-11","15:00","Jugendhilfeausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-12","14:30","Werkausschuss Stadtbildpflege","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-03-12","15:30","Verwaltungsrat Stadtentwässerung","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-03-16","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    t("2026-03-23","15:00","Umweltausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-03-24","17:00","Beirat für Migration und Integration",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-03-24","19:00","Ortsbeirat Mölschbach","Evangelisches Gemeindehaus, Eulentalstraße 10, Kaiserslautern","Ortsbeirat"),
    t("2026-03-26","14:00","Seniorenbeirat",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-03-26","16:00","Jugendparlament",RATHAUS_GROSS,"Sonstiges"),
    # April 2026
    t("2026-04-13","15:30","Bauausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-14","16:00","Rechnungsprüfungsausschuss",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-04-15","16:00","Sportausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-15","18:30","Ortsbeirat Erzhütten/Wiesenthalerhof","1. Pavillon der Grundschule, Erzhütter Straße 101, Kaiserslautern","Ortsbeirat"),
    t("2026-04-16","19:00","Ortsbeirat Hohenecken","Gasthof Burgschänke, Schloßstraße 1, Kaiserslautern","Ortsbeirat"),
    t("2026-04-20","15:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-20","16:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-20","16:30","Digitalisierungsausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-22","19:00","Ortsbeirat Erfenbach","Sitzungssaal der Ortsverwaltung Erfenbach, Siegelbacher Straße 95","Ortsbeirat"),
    t("2026-04-23","17:00","Inklusionsbeirat",RATHAUS_GROSS,"Ausschuss"),
    t("2026-04-28","16:00","Rechnungsprüfungsausschuss",RATHAUS_KLEIN,"Ausschuss"),
    # Mai 2026
    t("2026-05-05","17:00","Beirat für Migration und Integration",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-05-11","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    t("2026-05-13","15:00","Schulträgerausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-05-19","19:00","Ortsbeirat Dansenberg","Kath. Pfarrheim Dansenberg, Hautzenbergstr. 4, Kaiserslautern","Ortsbeirat"),
    t("2026-05-21","15:00","Sozialausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-05-27","15:00","Jugendhilfeausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-05-28","16:00","Kulturausschuss",RATHAUS_GROSS,"Ausschuss"),
    # Juni 2026
    t("2026-06-01","16:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-06-01","17:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-06-03","15:00","Bauausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-06-10","18:30","Ortsbeirat Siegelbach","Bernhard-Schwehm-Saal, Finkenstraße 14, Kaiserslautern","Ortsbeirat"),
    t("2026-06-11","14:30","Werkausschuss Stadtbildpflege","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-06-11","15:30","Verwaltungsrat Stadtentwässerung","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-06-15","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    t("2026-06-16","16:30","Hospitalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-06-25","16:00","Marktausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-06-25","17:00","Inklusionsbeirat",RATHAUS_KLEIN,"Ausschuss"),
    # Juli 2026
    t("2026-07-21","17:00","Beirat für Migration und Integration",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-07-27","15:00","Ferienkommission",RATHAUS_GROSS,"Ausschuss"),
    # August 2026
    t("2026-08-17","16:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-08-17","17:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-08-27","17:00","Inklusionsbeirat",RATHAUS_GROSS,"Ausschuss"),
    t("2026-08-31","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    # September 2026
    t("2026-09-01","17:00","Beirat für Migration und Integration",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-09-02","15:00","Jugendhilfeausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-08","09:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-08","10:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-14","15:00","Umweltausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-16","16:00","Sportausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-21","15:00","Bauausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-09-24","14:30","Werkausschuss Stadtbildpflege","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-09-24","15:30","Verwaltungsrat Stadtentwässerung","Stadtentwässerung AöR, Blechhammerweg 50, Kaiserslautern","Ausschuss"),
    t("2026-09-28","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    # Oktober 2026
    t("2026-10-19","16:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-10-19","17:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-10-20","16:30","Hospitalausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-10-21","16:00","Kulturausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-10-28","15:00","Schulträgerausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-10-29","17:00","Inklusionsbeirat",RATHAUS_GROSS,"Ausschuss"),
    # November 2026
    t("2026-11-02","15:00","Bauausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-11-05","15:00","Sozialausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-11-09","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    t("2026-11-10","17:00","Beirat für Migration und Integration",RATHAUS_KLEIN,"Ausschuss"),
    t("2026-11-12","14:30","Werkausschuss Stadtbildpflege","Aufenthaltsraum Eigenbetrieb Stadtbildpflege, Daennerstraße 11, Kaiserslautern","Ausschuss"),
    t("2026-11-18","15:00","Jugendhilfeausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-11-23","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
    t("2026-11-25","16:00","Sportausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-11-26","14:30","Verwaltungsrat Stadtentwässerung","Sitzungszimmer (E18, 2. OG), Stadtentwässerung AöR, Blechhammerweg 50","Ausschuss"),
    t("2026-11-30","16:00","Haupt- und Finanzausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-11-30","17:00","Personalausschuss",RATHAUS_GROSS,"Ausschuss"),
    # Dezember 2026
    t("2026-12-01","16:00","Marktausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-12-07","15:00","Umweltausschuss",RATHAUS_GROSS,"Ausschuss"),
    t("2026-12-10","17:00","Inklusionsbeirat",RATHAUS_GROSS,"Ausschuss"),
    t("2026-12-14","15:00","Stadtrat",RATHAUS_GROSS,"Stadtrat"),
]

count = 0
for td in termine:
    db.add(Termin(
        titel=td["titel"],
        datum=td["datum"],
        uhrzeit=td["uhrzeit"],
        ort=td["ort"],
        kategorie=td["kategorie"],
        quelle="ris",
        manuell=False,
        beschreibung="Quelle: Ratsinformationssystem Kaiserslautern (ris.kaiserslautern.de)"
    ))
    count += 1

db.commit()
db.close()
print(f"OK: {count} RIS-Termine importiert.")
