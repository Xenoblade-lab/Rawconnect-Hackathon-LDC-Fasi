<<<<<<< HEAD
# RAWCONNECT — Helpers dates

from datetime import datetime, timedelta
from typing import Optional


def now_iso() -> str:
    """Retourne la date/heure actuelle au format ISO (YYYY-MM-DD HH:MM:SS)."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def now_date() -> str:
    """Retourne la date actuelle au format YYYY-MM-DD."""
    return datetime.now().strftime("%Y-%m-%d")


def parse_date(date_str: str, fmt: str = "%Y-%m-%d") -> Optional[datetime]:
    """
    Parse une chaîne de date.
    
    Args:
        date_str: Chaîne de date
        fmt: Format attendu (par défaut: YYYY-MM-DD)
    
    Returns:
        datetime ou None si parsing échoue
    """
    try:
        return datetime.strptime(date_str, fmt)
    except (ValueError, TypeError):
        return None


def days_ago(days: int) -> datetime:
    """Retourne la date/heure il y a N jours."""
    return datetime.now() - timedelta(days=days)


def days_from_now(days: int) -> datetime:
    """Retourne la date/heure dans N jours."""
    return datetime.now() + timedelta(days=days)


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Formate une datetime selon le format donné."""
    return dt.strftime(fmt)


def days_between(start: datetime, end: datetime) -> int:
    """Retourne le nombre de jours entre deux dates."""
    return (end - start).days
=======
# RAWCONNECT — Helpers dates

from datetime import datetime, timedelta
from typing import Optional


def now_iso() -> str:
    """Retourne la date/heure actuelle au format ISO (YYYY-MM-DD HH:MM:SS)."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def now_date() -> str:
    """Retourne la date actuelle au format YYYY-MM-DD."""
    return datetime.now().strftime("%Y-%m-%d")


def parse_date(date_str: str, fmt: str = "%Y-%m-%d") -> Optional[datetime]:
    """
    Parse une chaîne de date.
    
    Args:
        date_str: Chaîne de date
        fmt: Format attendu (par défaut: YYYY-MM-DD)
    
    Returns:
        datetime ou None si parsing échoue
    """
    try:
        return datetime.strptime(date_str, fmt)
    except (ValueError, TypeError):
        return None


def days_ago(days: int) -> datetime:
    """Retourne la date/heure il y a N jours."""
    return datetime.now() - timedelta(days=days)


def days_from_now(days: int) -> datetime:
    """Retourne la date/heure dans N jours."""
    return datetime.now() + timedelta(days=days)


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Formate une datetime selon le format donné."""
    return dt.strftime(fmt)


def days_between(start: datetime, end: datetime) -> int:
    """Retourne le nombre de jours entre deux dates."""
    return (end - start).days
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
