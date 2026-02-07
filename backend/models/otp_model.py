# RAWCONNECT — OTP model (KYC L1)

from backend.db.connection import execute


def create(phone: str, code: str, expires_at) -> dict | None:
    """Crée un enregistrement OTP pour un téléphone."""
    try:
        execute(
            "INSERT INTO otp_verifications (phone, code, expires_at) VALUES (%s, %s, %s)",
            (phone, code, expires_at),
            fetch="none"
        )
        return execute(
            "SELECT id, phone, code, expires_at, created_at FROM otp_verifications ORDER BY id DESC LIMIT 1",
            None,
            fetch="one"
        )
    except Exception:
        return None


def get_valid(phone: str, code: str):
    """
    Retourne l'OTP si valide (non expiré, non utilisé).
    Retourne None sinon.
    """
    return execute(
        """
        SELECT id, phone, code, expires_at
        FROM otp_verifications
        WHERE phone = %s AND code = %s AND used_at IS NULL AND expires_at > NOW()
        ORDER BY id DESC
        LIMIT 1
        """,
        (phone, code),
        fetch="one"
    )


def mark_used(otp_id: int) -> None:
    """Marque l'OTP comme utilisé."""
    execute(
        "UPDATE otp_verifications SET used_at = NOW() WHERE id = %s",
        (otp_id,),
        fetch="none"
    )
