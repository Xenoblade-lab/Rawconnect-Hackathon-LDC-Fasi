# RAWCONNECT — User service (register, lookup)

from backend.models import account_model, score_model, user_model
from backend.utils.validators import (
    validate_activity_type,
    validate_phone,
    validate_pin,
    validate_date_of_birth,
    parse_date_of_birth,
    normalize_phone,
)


INITIAL_SCORE = 20.0
KYC_LEVEL_LIGHT = "LIGHT"  # KYC L1: Nom, téléphone, DOB, activité, SIM+OTP


def register(
    phone: str,
    name: str,
    activity_type: str | None,
    pin: str,
    date_of_birth: str | None = None,
) -> tuple[bool, dict | str, str | None]:
    """
    Inscrit un nouvel utilisateur (user + compte + score initial).
    KYC L1: nom, téléphone, date de naissance, type d'activité. Vérification SIM+OTP faite avant l'appel.

    Returns:
        (True, data, None) avec data = {user, account, initial_score}
        (False, error_code, error_message) en cas d'erreur.
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err

    ok, err = validate_pin(pin)
    if not ok:
        return False, "validation_error", err

    if not (name or "").strip():
        return False, "validation_error", "Le nom est requis"

    if activity_type is not None:
        ok, err = validate_activity_type(activity_type)
        if not ok:
            return False, "validation_error", err

    dob_parsed = None
    if date_of_birth:
        ok, err = validate_date_of_birth(date_of_birth)
        if not ok:
            return False, "validation_error", err
        dob_parsed = parse_date_of_birth(date_of_birth)

    normalized = normalize_phone(phone)
    if user_model.exists_phone(normalized):
        return False, "phone_exists", "Ce numéro est déjà enregistré"

    user = user_model.create(
        normalized,
        name.strip(),
        activity_type,
        date_of_birth=dob_parsed,
        kyc_level=KYC_LEVEL_LIGHT,
        pin=pin,
    )
    if not user:
        return False, "internal_error", "Impossible de créer l'utilisateur"

    acc = account_model.create(user["id"], 0)
    if not acc:
        return False, "internal_error", "Impossible de créer le compte"

    score_model.create(user["id"], INITIAL_SCORE)

    # Pas de notification en DB : le frontend affiche le SMS via pushSMSFeedback
    # (évite doublons quand l'utilisateur consulte le solde avec ce numéro)
    data = {"user": user, "account": acc, "initial_score": INITIAL_SCORE}
    return True, data, None


def lookup(phone: str) -> tuple[bool, dict | str, str | None]:
    """
    Retourne l'utilisateur par téléphone (sans données sensibles).

    Returns:
        (True, {user}, None) ou (False, "not_found", message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err

    normalized = normalize_phone(phone)
    user = user_model.get_by_phone(normalized)
    if not user:
        user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    return True, {"user": user}, None


def authenticate(phone: str, pin: str) -> tuple[bool, dict | str, str | None]:
    """
    Vérifie téléphone + PIN, retourne l'utilisateur si OK.

    Returns:
        (True, {user, account}, None) ou (False, "wrong_pin"|"not_found", message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_pin(pin)
    if not ok:
        return False, "validation_error", err

    normalized = normalize_phone(phone)
    user = user_model.get_by_phone(normalized)
    if not user:
        user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    if user.get("pin") != pin:
        return False, "wrong_pin", "PIN incorrect"

    account = account_model.get_by_user_id(user["id"])
    return True, {"user": user, "account": account}, None
