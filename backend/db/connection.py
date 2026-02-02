<<<<<<< HEAD
# RAWCONNECT — Connexion SQL (MySQL) + helpers
# Utiliser config pour DB_*.

from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator

import pymysql
from pymysql.cursors import DictCursor

# Import config depuis le package backend (chemin projet = racine)
import sys
_root = Path(__file__).resolve().parents[2]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from backend.config import Config
except ImportError:
    from config import Config  # fallback si lancé depuis backend/


def _kwargs() -> dict:
    kw = Config.db_kwargs().copy()
    kw["cursorclass"] = DictCursor
    return kw


@contextmanager
def get_conn() -> Generator[pymysql.Connection, None, None]:
    """Contexte manager pour une connexion MySQL. Fermeture auto."""
    conn = pymysql.connect(**_kwargs())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute(sql: str, args: tuple | dict | None = None, fetch: str = "none") -> list[dict] | dict | None:
    """
    Exécute une requête et retourne selon `fetch`:
    - "none": rien
    - "one": un seul enregistrement (dict ou None)
    - "all": liste de dict
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, args or ())
            if fetch == "none":
                return None
            if fetch == "one":
                return cur.fetchone()
            return cur.fetchall()


def _strip_leading_comments(text: str) -> str:
    """Retire les lignes de commentaire (-- ...) et lignes vides en tête."""
    lines = text.splitlines()
    while lines and (not lines[0].strip() or lines[0].strip().startswith("--")):
        lines.pop(0)
    return "\n".join(lines).strip()


def run_schema(schema_path: str | Path | None = None) -> None:
    """
    Exécute le fichier schema.sql (création des tables).
    Par défaut: backend/db/schema.sql
    """
    path = Path(schema_path) if schema_path else Path(__file__).resolve().parent / "schema.sql"
    sql = path.read_text(encoding="utf-8")
    raw = [s.strip() for s in sql.split(";") if s.strip()]
    stmts = []
    for s in raw:
        t = _strip_leading_comments(s)
        if not t:
            continue
        stmts.append(t)
    with get_conn() as conn:
        with conn.cursor() as cur:
            for stmt in stmts:
                if stmt.upper().startswith("SET "):
                    cur.execute(stmt)
                    continue
                cur.execute(stmt)
=======
# RAWCONNECT — Connexion SQL (MySQL) + helpers
# Utiliser config pour DB_*.

from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator

import pymysql
from pymysql.cursors import DictCursor

# Import config depuis le package backend (chemin projet = racine)
import sys
_root = Path(__file__).resolve().parents[2]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

try:
    from backend.config import Config
except ImportError:
    from config import Config  # fallback si lancé depuis backend/


def _kwargs() -> dict:
    kw = Config.db_kwargs().copy()
    kw["cursorclass"] = DictCursor
    return kw


@contextmanager
def get_conn() -> Generator[pymysql.Connection, None, None]:
    """Contexte manager pour une connexion MySQL. Fermeture auto."""
    conn = pymysql.connect(**_kwargs())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute(sql: str, args: tuple | dict | None = None, fetch: str = "none") -> list[dict] | dict | None:
    """
    Exécute une requête et retourne selon `fetch`:
    - "none": rien
    - "one": un seul enregistrement (dict ou None)
    - "all": liste de dict
    """
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, args or ())
            if fetch == "none":
                return None
            if fetch == "one":
                return cur.fetchone()
            return cur.fetchall()


def _strip_leading_comments(text: str) -> str:
    """Retire les lignes de commentaire (-- ...) et lignes vides en tête."""
    lines = text.splitlines()
    while lines and (not lines[0].strip() or lines[0].strip().startswith("--")):
        lines.pop(0)
    return "\n".join(lines).strip()


def run_schema(schema_path: str | Path | None = None) -> None:
    """
    Exécute le fichier schema.sql (création des tables).
    Par défaut: backend/db/schema.sql
    """
    path = Path(schema_path) if schema_path else Path(__file__).resolve().parent / "schema.sql"
    sql = path.read_text(encoding="utf-8")
    raw = [s.strip() for s in sql.split(";") if s.strip()]
    stmts = []
    for s in raw:
        t = _strip_leading_comments(s)
        if not t:
            continue
        stmts.append(t)
    with get_conn() as conn:
        with conn.cursor() as cur:
            for stmt in stmts:
                if stmt.upper().startswith("SET "):
                    cur.execute(stmt)
                    continue
                cur.execute(stmt)
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
