<<<<<<< HEAD
# RAWCONNECT — User service (register, lookup)

from backend.models import account_model, score_model, user_model
from backend.utils.validators import validate_activity_type, validate_phone, validate_pin, normalize_phone


INITIAL_SCORE = 20.0


def register(phone: str, name: str, activity_type: str | None, pin: str) -> tuple[bool, dict | str, str | None]:
    """
    Inscrit un nouvel utilisateur (user + compte + score initial).

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

    normalized = normalize_phone(phone)
    if user_model.exists_phone(normalized):
        return False, "phone_exists", "Ce numéro est déjà enregistré"

    user = user_model.create(normalized, name.strip(), activity_type, pin)
    if not user:
        return False, "internal_error", "Impossible de créer l'utilisateur"

    acc = account_model.create(user["id"], 0)
    if not acc:
        return False, "internal_error", "Impossible de créer le compte"

    score_model.create(user["id"], INITIAL_SCORE)
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
=======
# RAWCONNECT — User service (register, lookup)

from backend.models import account_model, score_model, user_model
from backend.utils.validators import validate_activity_type, validate_phone, validate_pin


INITIAL_SCORE = 20.0


def register(phone: str, name: str, activity_type: str | None, pin: str) -> tuple[bool, dict | str, str | None]:
    """
    Inscrit un nouvel utilisateur (user + compte + score initial).

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

    if user_model.exists_phone(phone):
        return False, "phone_exists", "Ce numéro est déjà enregistré"

    user = user_model.create(phone, name.strip(), activity_type, pin)
    if not user:
        return False, "internal_error", "Impossible de créer l'utilisateur"

    acc = account_model.create(user["id"], 0)
    if not acc:
        return False, "internal_error", "Impossible de créer le compte"

    score_model.create(user["id"], INITIAL_SCORE)
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

    user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    if user.get("pin") != pin:
        return False, "wrong_pin", "PIN incorrect"

    account = account_model.get_by_user_id(user["id"])
    return True, {"user": user, "account": account}, None
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
