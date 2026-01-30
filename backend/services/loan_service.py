# RAWCONNECT — Loan service (eligibility, propose, accept, repay)

from backend.models import account_model, loan_model, transaction_model, user_model
from backend.services import scoring_service
from backend.utils.validators import validate_amount, validate_phone
from backend.utils.time import days_from_now, format_datetime


# Seuils score -> max montant (FC) et taux mensuel
SCORE_TIERS = [
    (86, 200_000, 0.03),
    (71, 100_000, 0.05),
    (51, 50_000, 0.07),
    (31, 10_000, 0.10),
]
MIN_SCORE_CREDIT = 31


def _max_amount_and_rate(score: float) -> tuple[float, float]:
    """Retourne (montant max, taux mensuel) selon le score."""
    for seuil, max_amt, rate in SCORE_TIERS:
        if score >= seuil:
            return float(max_amt), float(rate)
    return 0.0, 0.10


def _duration_days(amount: float) -> int:
    if amount < 50_000:
        return 30
    if amount <= 100_000:
        return 60
    return 90


def eligibility(phone: str) -> tuple[bool, dict | str, str | None]:
    """
    Éligibilité au microcrédit : score, montant max, taux, durée.

    Returns:
        (True, {eligible, score, max_amount, interest_rate, duration_days}, None)
        ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err

    user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    success, data, msg = scoring_service.get_or_compute(phone)
    if not success:
        return False, data, msg  # data = code, msg = message

    score = data["score"]
    max_amount, rate = _max_amount_and_rate(score)
    eligible = score >= MIN_SCORE_CREDIT and max_amount > 0
    duration = _duration_days(max_amount) if eligible else 0

    return True, {
        "eligible": eligible,
        "score": score,
        "max_amount": max_amount,
        "interest_rate": rate,
        "duration_days": duration,
        "breakdown": data.get("breakdown"),
    }, None


def propose(phone: str) -> tuple[bool, dict | str, str | None]:
    """Alias pour eligibility (proposition = éligibilité)."""
    return eligibility(phone)


def accept(phone: str, amount: float) -> tuple[bool, dict | str, str | None]:
    """
    Accepte un microcrédit du montant demandé : crée le prêt, crédite le compte,
    enregistre la transaction.

    Returns:
        (True, {loan, new_balance, total_repayment, due_date}, None) ou (False, code, message).
    """
    ok, err = validate_phone(phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=1, max_value=200_000)
    if not ok:
        return False, "validation_error", err

    user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    success, data, msg = eligibility(phone)
    if not success:
        return False, data, msg
    if not data["eligible"]:
        return False, "not_eligible", "Score insuffisant pour un crédit"
    if amount > data["max_amount"]:
        return False, "amount_exceeded", f"Montant max autorisé : {data['max_amount']:.0f} FC"

    rate = data["interest_rate"]
    duration = _duration_days(amount)
    due = days_from_now(duration)
    due_date = format_datetime(due)
    total_repayment = amount * (1 + rate)

    loan = loan_model.create(user["id"], amount, rate, "active", due_date)
    if not loan:
        return False, "internal_error", "Impossible de créer le crédit"

    acc = account_model.get_by_user_id(user["id"])
    if not acc:
        return False, "internal_error", "Compte introuvable"

    new_balance = account_model.add_balance(acc["id"], amount)
    if new_balance is None:
        return False, "internal_error", "Impossible de créditer le compte"

    transaction_model.create(acc["id"], "loan", amount, f"Microcrédit #{loan['id']}")

    return True, {
        "loan": loan,
        "new_balance": new_balance,
        "total_repayment": round(total_repayment, 2),
        "due_date": due_date,
        "duration_days": duration,
    }, None


def repay(phone: str, amount: float) -> tuple[bool, dict | str, str | None]:
    """
    Rembourse (partiel ou total) le crédit actif. Met à jour le score si crédit soldé.

    Returns:
        (True, {remaining, completed, new_balance, new_score}, None) ou (False, code, message).
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

    active = loan_model.get_active_by_user(user["id"])
    if not active:
        return False, "no_active_loan", "Aucun crédit actif à rembourser"

    loan = active[0]
    total_to_repay = float(loan["amount"]) * (1 + float(loan["interest_rate"]))
    repaid = loan_model.total_repaid(loan["id"])
    remaining_before = max(0, total_to_repay - repaid)

    if remaining_before <= 0:
        return False, "no_active_loan", "Ce crédit est déjà soldé"

    pay = min(amount, remaining_before)
    new_balance = account_model.subtract_balance(acc["id"], pay)
    if new_balance is None:
        return False, "insufficient_funds", "Solde insuffisant"

    loan_model.create_repayment(loan["id"], pay)
    repaid_after = loan_model.total_repaid(loan["id"])
    remaining_after = max(0, total_to_repay - repaid_after)
    completed = remaining_after <= 0

    if completed:
        loan_model.update_status(loan["id"], "paid")
        score, _ = scoring_service.recompute_and_persist(user["id"])
    else:
        score = None

    return True, {
        "remaining": round(remaining_after, 2),
        "completed": completed,
        "new_balance": new_balance,
        "new_score": score,
    }, None
