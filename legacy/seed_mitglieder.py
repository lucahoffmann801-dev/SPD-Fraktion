"""
Einmalig ausführen: python seed_mitglieder.py
Legt alle Fraktionsmitglieder in der Datenbank an.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Mitglied, init_db

init_db()
db = SessionLocal()

# Vorhandene löschen um Duplikate zu vermeiden
db.query(Mitglied).delete()
db.commit()

mitglieder = [
    # Vorstand
    {"name": "Patrick Schäfer",        "rolle": "Fraktionsvorsitzender",           "foto": "/static/mitglieder/patrick-schaefer.jpg"},
    {"name": "Janina Eispert",          "rolle": "Stellvertretende Vorsitzende",    "foto": "/static/mitglieder/janina-eispert.jpg"},
    {"name": "Harald Brandstädter",    "rolle": "Stellvertretender Vorsitzender",  "foto": "/static/mitglieder/harald-brandstaedter.jpg"},
    # Mitglieder
    {"name": "Andreas Rahm",           "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/andreas-rahm.jpg"},
    {"name": "Raymond Germany",        "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/raymond-germany.jpg"},
    {"name": "Michael Krauß",          "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/michael-krauss.jpg"},
    {"name": "Anna Raab",              "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/anna-raab.jpg"},
    {"name": "Heike Spies",            "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/heike-spies.jpg"},
    {"name": "Petra Janson-Peermann",  "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/petra-janson-peermann.jpg"},
    {"name": "Moritz Behncke",         "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/moritz-behncke.jpg"},
    {"name": "Jörg Harz",              "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/joerg-harz.jpg"},
    {"name": "Marcel Schulz",          "rolle": "Fraktionsmitglied",               "foto": "/static/mitglieder/marcel-schulz.jpg"},
]

for m in mitglieder:
    db.add(Mitglied(**m))

db.commit()
db.close()
print(f"OK: {len(mitglieder)} Mitglieder erfolgreich eingetragen.")
