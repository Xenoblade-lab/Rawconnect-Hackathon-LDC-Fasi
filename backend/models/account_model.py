# RAWCONNECT — Account model + accès DB

from decimal import Decimal

from backend.db.connection import execute


def create(user_id: int, balance: float | Decimal = 0) -> dict | None:
    """
    Crée un compte pour un utilisateur.
    Retourne le compte créé ou None si l'utilisateur a déjà un compte.
    """
    try:
        execute(
            "INSERT INTO accounts (user_id, balance) VALUES (%s, %s)",
            (user_id, float(balance)),
            fetch="none"
        )
        return get_by_user_id(user_id)
    except Exception:
        return None


def get_by_id(account_id: int) -> dict | None:
    """Retourne un compte par ID."""
    return execute(
        "SELECT id, user_id, balance, created_at FROM accounts WHERE id = %s",
        (account_id,),
        fetch="one"
    )


def get_by_user_id(user_id: int) -> dict | None:
    """Retourne le compte d'un utilisateur."""
    return execute(
        "SELECT id, user_id, balance, created_at FROM accounts WHERE user_id = %s",
        (user_id,),
        fetch="one"
    )


def update_balance(account_id: int, new_balance: float | Decimal) -> bool:
    """Met à jour le solde d'un compte."""
    try:
        execute(
            "UPDATE accounts SET balance = %s WHERE id = %s",
            (float(new_balance), account_id),
            fetch="none"
        )
        return True
    except Exception:
        return False


def add_balance(account_id: int, amount: float | Decimal) -> float | None:
    """
    Ajoute un montant au solde.
    Retourne le nouveau solde ou None en cas d'erreur.
    """
    acc = get_by_id(account_id)
    if not acc:
        return None
    new_balance = float(acc["balance"]) + float(amount)
    if update_balance(account_id, new_balance):
        return new_balance
    return None


def subtract_balance(account_id: int, amount: float | Decimal) -> float | None:
    """
    Retire un montant du solde.
    Retourne le nouveau solde ou None si fonds insuffisants / erreur.
    """
    acc = get_by_id(account_id)
    if not acc:
        return None
    current = float(acc["balance"])
    if current < float(amount):
        return None
    new_balance = current - float(amount)
    if update_balance(account_id, new_balance):
        return new_balance
    return None
