# RAWCONNECT — compute_score(user_id) -> 0..100

from __future__ import annotations

from datetime import datetime

from backend.models import account_model, loan_model, score_model, transaction_model, user_model
from backend.scoring import features, rules
from backend.utils.time import days_between


def compute_score(user_id: int) -> tuple[float, dict[str, float]]:
    """
    Calcule le score de confiance (0–100) pour un utilisateur.

    Returns:
        (score_total, breakdown) où breakdown donne le détail par critère (0–100).
    """
    user = user_model.get_by_id(user_id)
    if not user:
        return 0.0, {}

    account = account_model.get_by_user_id(user_id)
    if not account:
        return 0.0, {}

    txs = transaction_model.list_by_account(account["id"], limit=500)
    loans = loan_model.list_by_user(user_id)
    now = datetime.now()
    period_days = max(1, rules.ANALYSIS_PERIOD_DAYS)

    # 1. Régularité
    count = len(txs)
    reg = features.regularity(count, period_days)

    # 2. Épargne (dépôts uniquement)
    total_saved = sum(float(t["amount"]) for t in txs if t["type"] == "deposit")
    sav = features.savings(total_saved)

    # 3. Ancienneté
    created = features.parse_created_at(account.get("created_at"))
    days_old = days_between(created, now) if created else 0
    age = features.account_age(max(0, days_old))

    # 4. Paiement (crédits remboursés / total)
    loans_total = len(loans)
    loans_paid = sum(1 for L in loans if L.get("status") == "paid")
    pay = features.payment(loans_paid, loans_total)

    # 5. Activité stable (montants des transactions)
    amounts = [float(t["amount"]) for t in txs]
    stab = features.activity_stability(amounts)

    breakdown = {
        "regularity": round(reg, 2),
        "savings": round(sav, 2),
        "account_age": round(age, 2),
        "payment": round(pay, 2),
        "activity_stability": round(stab, 2),
    }

    total = (
        reg * rules.WEIGHTS["regularity"]
        + sav * rules.WEIGHTS["savings"]
        + age * rules.WEIGHTS["account_age"]
        + pay * rules.WEIGHTS["payment"]
        + stab * rules.WEIGHTS["activity_stability"]
    )
    total = round(rules.normalize(total, 0.0, 100.0), 2)

    return total, breakdown
