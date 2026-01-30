# RAWCONNECT — Métriques : régularité, épargne, ancienneté, etc.

from __future__ import annotations

import math
from datetime import datetime
from typing import Sequence

from backend.scoring.rules import (
    DEFAULT_NO_LOAN_SCORE,
    REFERENCE_ACCOUNT_DAYS,
    REFERENCE_SAVINGS_FC,
    REFERENCE_TRANS_PER_DAY,
)
from backend.utils.time import parse_date


def regularity(transaction_count: int, period_days: int) -> float:
    """
    Régularité des transactions (0–100).
    Nombre de transactions / période, normalisé selon REFERENCE_TRANS_PER_DAY.
    """
    if period_days <= 0:
        return 0.0
    rate = transaction_count / period_days
    raw = (rate / REFERENCE_TRANS_PER_DAY) * 100.0
    return min(100.0, max(0.0, raw))


def savings(total_saved: float, reference: float | None = None) -> float:
    """
    Épargne (0–100).
    Montant total épargné / seuil de référence.
    """
    ref = reference or REFERENCE_SAVINGS_FC
    if ref <= 0:
        return 0.0
    raw = (total_saved / ref) * 100.0
    return min(100.0, max(0.0, raw))


def account_age(days_since_created: int, reference_days: int | None = None) -> float:
    """
    Ancienneté du compte (0–100).
    Jours depuis création / seuil de référence.
    """
    ref = reference_days or REFERENCE_ACCOUNT_DAYS
    if ref <= 0:
        return 0.0
    raw = (days_since_created / ref) * 100.0
    return min(100.0, max(0.0, raw))


def payment(loans_paid: int, loans_total: int, no_loan_score: float | None = None) -> float:
    """
    Paiement régulier (0–100).
    Part des crédits intégralement remboursés.
    Si aucun crédit : score neutre (50 par défaut).
    """
    default = no_loan_score if no_loan_score is not None else DEFAULT_NO_LOAN_SCORE
    if loans_total == 0:
        return default
    raw = (loans_paid / loans_total) * 100.0
    return min(100.0, max(0.0, raw))


def activity_stability(amounts: Sequence[float]) -> float:
    """
    Activité stable (0–100).
    Variation faible des montants (coefficient de variation inverse).
    Moins de variance => score plus élevé.
    """
    amounts = [float(a) for a in amounts if a is not None]
    if len(amounts) < 2:
        return 50.0
    n = len(amounts)
    mean = sum(amounts) / n
    if mean == 0:
        return 50.0
    variance = sum((x - mean) ** 2 for x in amounts) / n
    std = math.sqrt(variance)
    cv = std / abs(mean)
    # 100 / (1 + cv) : cv=0 => 100, cv élevé => proche de 0
    raw = 100.0 / (1.0 + cv)
    return min(100.0, max(0.0, raw))


def parse_created_at(created_at) -> datetime | None:
    """Parse created_at (str ou datetime) en datetime."""
    if created_at is None:
        return None
    if isinstance(created_at, datetime):
        return created_at
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        dt = parse_date(str(created_at), fmt)
        if dt:
            return dt
    return None
