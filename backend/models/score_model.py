# RAWCONNECT — Score model + accès DB

from backend.db.connection import execute


def create(user_id: int, score: float) -> dict | None:
    """Crée ou remplace le score d'un utilisateur."""
    try:
        existing = get_by_user_id(user_id)
        if existing:
            execute(
                "UPDATE scores SET score = %s WHERE user_id = %s",
                (score, user_id),
                fetch="none"
            )
        else:
            execute(
                "INSERT INTO scores (user_id, score) VALUES (%s, %s)",
                (user_id, score),
                fetch="none"
            )
        return get_by_user_id(user_id)
    except Exception:
        return None


def get_by_user_id(user_id: int) -> dict | None:
    """Retourne le score d'un utilisateur."""
    return execute(
        "SELECT id, user_id, score, last_updated FROM scores WHERE user_id = %s",
        (user_id,),
        fetch="one"
    )


def update(user_id: int, score: float) -> dict | None:
    """Met à jour le score d'un utilisateur."""
    try:
        execute(
            "UPDATE scores SET score = %s WHERE user_id = %s",
            (score, user_id),
            fetch="none"
        )
        return get_by_user_id(user_id)
    except Exception:
        return None
