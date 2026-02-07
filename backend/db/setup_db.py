# RAWCONNECT — Création de la base + tables + données de démo
# Usage: python -m backend.db.setup_db
# Prérequis: MySQL (Laragon) démarré, .env ou défauts (root, sans mdp).

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

import pymysql

try:
    from backend.config import Config
except ImportError:
    from config import Config

from backend.db.connection import run_schema, get_conn
from backend.db import seed


def create_database_if_not_exists() -> None:
    """Crée la base rawconnect si elle n'existe pas (MySQL local uniquement)."""
    host = Config.DB_HOST
    if host not in ("localhost", "127.0.0.1"):
        print("⏭️ Base managée détectée (host != localhost), skip CREATE DATABASE.")
        return
    kw = Config.db_kwargs().copy()
    db_name = kw.pop("database", "rawconnect")
    conn = pymysql.connect(**kw)
    try:
        with conn.cursor() as cur:
            cur.execute(
                "CREATE DATABASE IF NOT EXISTS `{0}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci".format(db_name)
            )
        conn.commit()
        print(f"✅ Base '{db_name}' prête.")
    finally:
        conn.close()


def main() -> None:
    print("🔧 Setup base RAWCONNECT (MySQL)...")
    create_database_if_not_exists()
    print("📋 Exécution du schéma (tables)...")
    run_schema()
    print("🌱 Insertion des données de démo...")
    seed.seed_demo_data()
    print("✅ Setup terminé.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
