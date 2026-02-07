# RAWCONNECT — OTP service (KYC L1: vérification par OTP)

import random
import string
from datetime import datetime, timedelta

from backend.models import otp_model
from backend.utils.validators import validate_phone, normalize_phone


OTP_LENGTH = 6
OTP_VALIDITY_MINUTES = 5


def generate_code() -> str:
    """Génère un code OTP à 6 chiffres."""
    return "".join(random.choices(string.digits, k=OTP_LENGTH))


def send_otp(phone: str) -> tuple[bool, str | None, str | None]:
    """
    Génère et enregistre un OTP pour le téléphone.
    En démo: envoie aussi une notification simulée (SMS) avec le code.
    Returns: (success, error_message, code) — le code est retourné pour affichage en simulation.
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, err, None

    normalized = normalize_phone(phone)
    code = generate_code()
    expires_at = datetime.now() + timedelta(minutes=OTP_VALIDITY_MINUTES)

    row = otp_model.create(normalized, code, expires_at)
    if not row:
        return False, "Impossible de créer l'OTP", None

    # Pas de notification en DB : le frontend affiche le SMS via pushSMSFeedback
    # (évite doublons quand l'utilisateur consulte le solde avec ce numéro)
    return True, None, code


def verify_otp(phone: str, code: str) -> tuple[bool, str | None]:
    """
    Vérifie l'OTP pour le téléphone.
    Returns: (success, error_message)
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, err

    if not code or not code.strip():
        return False, "Le code OTP est requis"

    code_clean = code.strip()
    if len(code_clean) != OTP_LENGTH or not code_clean.isdigit():
        return False, f"Le code doit contenir {OTP_LENGTH} chiffres"

    normalized = normalize_phone(phone)
    otp_row = otp_model.get_valid(normalized, code_clean)
    if not otp_row:
        # Essayer avec le numéro non normalisé
        otp_row = otp_model.get_valid(phone, code_clean)
    if not otp_row:
        return False, "Code OTP invalide ou expiré"

    otp_model.mark_used(otp_row["id"])
    return True, None
