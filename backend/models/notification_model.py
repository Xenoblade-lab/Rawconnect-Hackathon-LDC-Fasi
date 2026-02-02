# RAWCONNECT — Notification model (SMS simulés)

from backend.db.connection import execute


def create(phone: str, recipient: str, message: str) -> dict | None:
    """
    Crée une notification SMS simulée.
    recipient: 'agent' ou 'client'
    Retourne la notification créée.
    """
    try:
        execute(
            "INSERT INTO notifications (phone, recipient, message) VALUES (%s, %s, %s)",
            (phone, recipient, message),
            fetch="none"
        )
        row = execute(
            "SELECT id, phone, recipient, message, created_at FROM notifications ORDER BY id DESC LIMIT 1",
            None,
            fetch="one"
        )
        return row
    except Exception:
        return None


def list_by_phone_since(phone: str, since_id: int = 0, limit: int = 20) -> list[dict]:
    """
    Retourne les notifications pour un téléphone avec id > since_id.
    Utilisé pour le polling : le frontend passe le dernier id vu.
    """
    rows = execute(
        """
        SELECT id, phone, recipient, message, created_at
        FROM notifications
        WHERE phone = %s AND id > %s
        ORDER BY id ASC
        LIMIT %s
        """,
        (phone, since_id, limit),
        fetch="all"
    )
    return rows or []
