"""
SatyaDrishti Database Connection & Session Management
Connects to PostgreSQL (or SQLite fallback) via SQLAlchemy ORM.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load .env file if present
load_dotenv()

# Database URL from environment or default to local PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/satyadrishti"
)

# Detect if PostgreSQL or SQLite
is_sqlite = DATABASE_URL.startswith("sqlite")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args={"check_same_thread": False} if is_sqlite else {}
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    # If postgres connection fails, fallback gracefully to SQLite local file
    print(f"[Database] Warning: PostgreSQL not reachable at {DATABASE_URL}. Initializing local SQLite fallback satyadrishti.db. Error: {e}")
    SQLITE_PATH = Path(__file__).resolve().parent / "satyadrishti.db"
    DATABASE_URL = f"sqlite:///{SQLITE_PATH}"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
