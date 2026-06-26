from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sys

# Base directory for data
if getattr(sys, 'frozen', False):
    # Packaged executable: use directory of the executable
    BASE_DIR = os.path.dirname(sys.executable)
else:
    # Standard run: use backend/ directory
    BASE_DIR = os.path.dirname(__file__)

DATA_DIR = os.path.join(BASE_DIR, "data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

DB_PATH = os.path.join(DATA_DIR, "sabay_bbq.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# For Windows 7+ compatibility and SQLite security, we can use SQLCipher if needed,
# but standard SQLite with file-level permissions is more portable for a standalone .exe.
# Here we implement a "Strict Mode" for SQLite.

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
