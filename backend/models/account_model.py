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
        "SELECT id, user_id, balance, agent_float, agent_commission_balance, created_at FROM accounts WHERE id = %s",
        (account_id,),
        fetch="one"
    )


def get_by_user_id(user_id: int) -> dict | None:
    """Retourne le compte d'un utilisateur."""
    return execute(
        "SELECT id, user_id, balance, agent_float, agent_commission_balance, created_at FROM accounts WHERE user_id = %s",
        (user_id,),
        fetch="one"
    )


def add_agent_float(account_id: int, amount: float | Decimal) -> float | None:
    """Ajoute au float agent. Retourne le nouveau float ou None."""
    acc = get_by_id(account_id)
    if not acc:
        return None
    current = float(acc.get("agent_float", 0) or 0)
    new_float = current + float(amount)
    return _update_agent_float(account_id, new_float)


def subtract_agent_float(account_id: int, amount: float | Decimal) -> float | None:
    """Retire du float agent. Retourne le nouveau float ou None si insuffisant."""
    acc = get_by_id(account_id)
    if not acc:
        return None
    current = float(acc.get("agent_float", 0) or 0)
    if current < float(amount):
        return None
    new_float = current - float(amount)
    return _update_agent_float(account_id, new_float)


def add_agent_commission(account_id: int, amount: float | Decimal) -> float | None:
    """Ajoute aux commissions agent. Retourne le nouveau solde commissions ou None."""
    acc = get_by_id(account_id)
    if not acc:
        return None
    current = float(acc.get("agent_commission_balance", 0) or 0)
    new_balance = current + float(amount)
    return _update_agent_commission(account_id, new_balance)


def _update_agent_float(account_id: int, new_float: float) -> float | None:
    try:
        execute(
            "UPDATE accounts SET agent_float = %s WHERE id = %s",
            (float(new_float), account_id),
            fetch="none"
        )
        return new_float
    except Exception:
        return None


def _update_agent_commission(account_id: int, new_balance: float) -> float | None:
    try:
        execute(
            "UPDATE accounts SET agent_commission_balance = %s WHERE id = %s",
            (float(new_balance), account_id),
            fetch="none"
        )
        return new_balance
    except Exception:
        return None


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
