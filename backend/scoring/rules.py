<<<<<<< HEAD
# RAWCONNECT — Poids, normalisation, seuils de scoring

# Poids des critères (somme = 1.0)
WEIGHTS = {
    "regularity": 0.30,      # Régularité des transactions
    "savings": 0.25,         # Épargne
    "account_age": 0.20,     # Ancienneté du compte
    "payment": 0.15,         # Paiement régulier (remboursements)
    "activity_stability": 0.10,  # Activité stable
}

# Seuils de référence
REFERENCE_TRANS_PER_DAY = 1.0   # 1 transaction/jour = 100 pts régularité
REFERENCE_SAVINGS_FC = 100_000  # 100 000 FC épargnés = 100 pts épargne
REFERENCE_ACCOUNT_DAYS = 90     # 90 jours = 100 pts ancienneté
DEFAULT_NO_LOAN_SCORE = 50.0    # Score neutre paiement si aucun crédit

# Période d'analyse (jours) pour régularité / métriques
ANALYSIS_PERIOD_DAYS = 90


def normalize(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamp value entre min_val et max_val."""
    return max(min_val, min(max_val, value))
=======
# RAWCONNECT — Poids, normalisation, seuils de scoring

# Poids des critères (somme = 1.0)
WEIGHTS = {
    "regularity": 0.30,      # Régularité des transactions
    "savings": 0.25,         # Épargne
    "account_age": 0.20,     # Ancienneté du compte
    "payment": 0.15,         # Paiement régulier (remboursements)
    "activity_stability": 0.10,  # Activité stable
}

# Seuils de référence
REFERENCE_TRANS_PER_DAY = 1.0   # 1 transaction/jour = 100 pts régularité
REFERENCE_SAVINGS_FC = 100_000  # 100 000 FC épargnés = 100 pts épargne
REFERENCE_ACCOUNT_DAYS = 90     # 90 jours = 100 pts ancienneté
DEFAULT_NO_LOAN_SCORE = 50.0    # Score neutre paiement si aucun crédit

# Période d'analyse (jours) pour régularité / métriques
ANALYSIS_PERIOD_DAYS = 90


def normalize(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamp value entre min_val et max_val."""
    return max(min_val, min(max_val, value))
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
