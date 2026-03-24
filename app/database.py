from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Date, Time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./fraktion.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Termin(Base):
    __tablename__ = "termine"
    id = Column(Integer, primary_key=True, index=True)
    titel = Column(String(255), nullable=False)
    datum = Column(String(20), nullable=False)   # YYYY-MM-DD
    uhrzeit = Column(String(10), nullable=True)  # HH:MM
    ort = Column(String(255), nullable=True)
    beschreibung = Column(Text, nullable=True)
    quelle = Column(String(50), default="manuell")  # "email", "manuell", "ris"
    kategorie = Column(String(100), nullable=True)  # "Stadtrat", "Ausschuss", "Ortsbeirat" …
    email_subject = Column(String(255), nullable=True)
    erstellt_am = Column(DateTime, default=datetime.now)
    manuell = Column(Boolean, default=False)


class Dokument(Base):
    __tablename__ = "dokumente"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    kategorie = Column(String(100), nullable=True)
    dateipfad = Column(String(500), nullable=False)
    hochgeladen_am = Column(DateTime, default=datetime.now)
    hochgeladen_von = Column(String(100), nullable=True)
    beschreibung = Column(Text, nullable=True)


class Aufgabe(Base):
    __tablename__ = "aufgaben"
    id = Column(Integer, primary_key=True, index=True)
    titel = Column(String(255), nullable=False)
    beschreibung = Column(Text, nullable=True)
    zustaendig = Column(Text, nullable=True)  # kommagetrennte Namen
    faellig_am = Column(String(20), nullable=True)
    status = Column(String(50), default="offen")  # offen, in_bearbeitung, erledigt
    prioritaet = Column(String(20), default="normal")  # niedrig, normal, hoch
    erstellt_am = Column(DateTime, default=datetime.now)


class Mitglied(Base):
    __tablename__ = "mitglieder"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    rolle = Column(String(100), nullable=True)
    telefon = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    ausschuss = Column(String(255), nullable=True)
    foto = Column(String(500), nullable=True)
    notizen = Column(Text, nullable=True)


class EmailLog(Base):
    __tablename__ = "email_log"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(255), unique=True)
    subject = Column(String(500), nullable=True)
    von = Column(String(255), nullable=True)
    datum = Column(String(50), nullable=True)
    verarbeitet_am = Column(DateTime, default=datetime.now)
    termine_gefunden = Column(Integer, default=0)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    # Migrationen: neue Spalten hinzufügen falls nicht vorhanden
    with engine.connect() as conn:
        from sqlalchemy import text, inspect
        inspector = inspect(engine)

        mitglieder_cols = [c["name"] for c in inspector.get_columns("mitglieder")]
        if "foto" not in mitglieder_cols:
            conn.execute(text("ALTER TABLE mitglieder ADD COLUMN foto VARCHAR(500)"))

        termin_cols = [c["name"] for c in inspector.get_columns("termine")]
        if "kategorie" not in termin_cols:
            conn.execute(text("ALTER TABLE termine ADD COLUMN kategorie VARCHAR(100)"))

        conn.commit()
