# RAWCONNECT — User model + accès DB

from backend.db.connection import execute


def create(phone: str, name: str, activity_type: str | None = None, pin: str = "0000") -> dict | None:
    """
    Crée un utilisateur.
    Retourne le user créé ou None si le téléphone existe déjà.
    """
    try:
        execute(
            """
            INSERT INTO users (phone, name, activity_type, pin)
            VALUES (%s, %s, %s, %s)
            """,
            (phone, name, activity_type, pin),
            fetch="none"
        )
        return get_by_phone(phone)
    except Exception:
        return None


def get_by_id(user_id: int) -> dict | None:
    """Retourne un user par ID."""
    return execute(
        "SELECT id, phone, name, activity_type, pin, created_at FROM users WHERE id = %s",
        (user_id,),
        fetch="one"
    )


def get_by_phone(phone: str) -> dict | None:
    """Retourne un user par numéro de téléphone."""
    return execute(
        "SELECT id, phone, name, activity_type, pin, created_at FROM users WHERE phone = %s",
        (phone,),
        fetch="one"
    )


def exists_phone(phone: str) -> bool:
    """Vérifie si un téléphone est déjà enregistré."""
    row = execute(
        "SELECT 1 FROM users WHERE phone = %s",
        (phone,),
        fetch="one"
    )
    return row is not None
