# RAWCONNECT — Config (DEV, DB, etc.)
# Base SQL MySQL — voir .env.example

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    _env = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(_env)
except ImportError:
    pass


class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-rawconnect")

    # SQL (MySQL)
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "rawconnect")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    # DB_SSL=1 pour MySQL cloud (Aiven, PlanetScale, etc.)
    DB_SSL = os.getenv("DB_SSL", "").lower() in ("1", "true", "yes")

    @classmethod
    def db_kwargs(cls) -> dict:
        kw = {
            "host": cls.DB_HOST,
            "port": cls.DB_PORT,
            "user": cls.DB_USER,
            "password": cls.DB_PASSWORD,
            "database": cls.DB_NAME,
            "charset": "utf8mb4",
        }
        if cls.DB_SSL:
            kw["ssl"] = True  # Connexion SSL pour MySQL cloud (Aiven, etc.)
        return kw
