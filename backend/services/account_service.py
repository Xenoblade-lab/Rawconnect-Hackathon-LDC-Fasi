# RAWCONNECT — Account service (balance, deposit, payment)

from backend.models import account_model, transaction_model, user_model
from backend.services import scoring_service
from backend.utils.validators import validate_amount, validate_phone, normalize_phone


def balance(phone: str) -> tuple[bool, dict | str, str | None]:
    """
    Retourne le solde du compte associé au téléphone.

    Returns:
        (True, {balance, user, account}, None) ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err

    normalized = normalize_phone(phone)
    user = user_model.get_by_phone(normalized) or user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    acc = account_model.get_by_user_id(user["id"])
    if not acc:
        return False, "not_found", "Compte introuvable"

    return True, {"balance": float(acc["balance"]), "user": user, "account": acc}, None


def list_transactions(phone: str, limit: int = 20) -> tuple[bool, list | str, str | None]:
    """
    Retourne la liste des transactions du compte associé au téléphone.

    Returns:
        (True, [transactions], None) ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err

    normalized = normalize_phone(phone)
    user = user_model.get_by_phone(normalized) or user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    acc = account_model.get_by_user_id(user["id"])
    if not acc:
        return False, "not_found", "Compte introuvable"

    rows = transaction_model.list_by_account(acc["id"], limit=limit)
    return True, rows, None


def deposit(phone: str, amount: float) -> tuple[bool, dict | str, str | None]:
    """
    Effectue un dépôt / épargne. Recalcule et persiste le score.

    Returns:
        (True, {new_balance, new_score, transaction}, None) ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=0.01, max_value=10_000_000)
    if not ok:
        return False, "validation_error", err

    user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    acc = account_model.get_by_user_id(user["id"])
    if not acc:
        return False, "not_found", "Compte introuvable"

    new_balance = account_model.add_balance(acc["id"], amount)
    if new_balance is None:
        return False, "internal_error", "Impossible de créditer le compte"

    transaction_model.create(acc["id"], "deposit", amount, "Dépôt épargne")
    score, _ = scoring_service.recompute_and_persist(user["id"])

    return True, {
        "new_balance": new_balance,
        "new_score": score,
        "transaction": {"type": "deposit", "amount": amount},
    }, None


def withdraw(phone: str, amount: float) -> tuple[bool, dict | str, str | None]:
    """
    Retrait / paiement. Décrédite le compte et enregistre la transaction.

    Returns:
        (True, {new_balance, transaction}, None) ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=0.01, max_value=10_000_000)
    if not ok:
        return False, "validation_error", err

    normalized = normalize_phone(phone)
    user = user_model.get_by_phone(normalized) or user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    acc = account_model.get_by_user_id(user["id"])
    if not acc:
        return False, "not_found", "Compte introuvable"

    new_balance = account_model.subtract_balance(acc["id"], amount)
    if new_balance is None:
        return False, "insufficient_funds", "Solde insuffisant"

    transaction_model.create(acc["id"], "withdrawal", amount, "Retrait")
    return True, {"new_balance": new_balance, "transaction": {"type": "withdrawal", "amount": amount}}, None
