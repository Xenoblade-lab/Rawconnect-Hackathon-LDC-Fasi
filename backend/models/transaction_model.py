# RAWCONNECT — Transaction model + accès DB

from backend.db.connection import execute


def create(
    account_id: int,
    tx_type: str,
    amount: float,
    description: str | None = None,
    agent_id: int | None = None,
    commission: float = 0,
) -> dict | None:
    """
    Crée une transaction.
    tx_type: 'deposit', 'withdrawal', 'payment', 'loan'
    Retourne la transaction créée.
    """
    try:
        execute(
            """
            INSERT INTO transactions (account_id, type, amount, description, agent_id, commission)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (account_id, tx_type, amount, description, agent_id, commission),
            fetch="none"
        )
        row = execute(
            "SELECT id, account_id, type, amount, description, agent_id, commission, created_at FROM transactions WHERE account_id = %s ORDER BY id DESC LIMIT 1",
            (account_id,),
            fetch="one"
        )
        return row
    except Exception:
        return None


def get_by_id(transaction_id: int) -> dict | None:
    """Retourne une transaction par ID."""
    return execute(
        "SELECT id, account_id, type, amount, description, created_at FROM transactions WHERE id = %s",
        (transaction_id,),
        fetch="one"
    )


def list_by_account(account_id: int, limit: int = 20) -> list[dict]:
    """Retourne les dernières transactions d'un compte (ordre décroissant)."""
    rows = execute(
        """
        SELECT id, account_id, type, amount, description, agent_id, commission, created_at
        FROM transactions
        WHERE account_id = %s
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (account_id, limit),
        fetch="all"
    )
    return rows or []


def list_by_agent(agent_id: int, limit: int = 20) -> list[dict]:
    """Retourne les transactions effectuées via l'agent."""
    rows = execute(
        """
        SELECT t.id, t.account_id, t.type, t.amount, t.description, t.agent_id, t.commission, t.created_at
        FROM transactions t
        WHERE t.agent_id = %s
        ORDER BY t.created_at DESC
        LIMIT %s
        """,
        (agent_id, limit),
        fetch="all"
    )
    return rows or []
