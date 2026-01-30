# RAWCONNECT — Scoring service (calc + persist score)

from backend.models import score_model, user_model
from backend.scoring.engine import compute_score


def get_or_compute(phone: str) -> tuple[bool, dict | str, str | None]:
    """
    Récupère ou calcule le score pour un téléphone, puis le persiste.

    Returns:
        (True, {score, breakdown, user_id}, None) ou (False, code, message).
    """
    user = user_model.get_by_phone(phone)
    if not user:
        return False, "not_found", "Utilisateur introuvable"

    score, breakdown = compute_score(user["id"])
    score_model.update(user["id"], score)
    return True, {"score": score, "breakdown": breakdown, "user_id": user["id"]}, None


def recompute_and_persist(user_id: int) -> tuple[float, dict]:
    """
    Recalcule le score, met à jour la table scores, retourne (score, breakdown).
    Utilisé après dépôt, remboursement, etc.
    """
    score, breakdown = compute_score(user_id)
    score_model.update(user_id, score)
    return score, breakdown
