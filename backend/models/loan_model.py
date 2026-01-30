# RAWCONNECT — Loan model + accès DB

from backend.db.connection import execute


def create(user_id: int, amount: float, interest_rate: float = 0.05, status: str = "pending", due_date: str | None = None) -> dict | None:
    """
    Crée un crédit.
    status: 'pending', 'active', 'paid', 'defaulted'
    Retourne le crédit créé.
    """
    try:
        execute(
            """
            INSERT INTO loans (user_id, amount, interest_rate, status, due_date)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, amount, interest_rate, status, due_date),
            fetch="none"
        )
        row = execute(
            "SELECT id, user_id, amount, interest_rate, status, created_at, due_date FROM loans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
            (user_id,),
            fetch="one"
        )
        return row
    except Exception:
        return None


def get_by_id(loan_id: int) -> dict | None:
    """Retourne un crédit par ID."""
    return execute(
        "SELECT id, user_id, amount, interest_rate, status, created_at, due_date FROM loans WHERE id = %s",
        (loan_id,),
        fetch="one"
    )


def list_by_user(user_id: int) -> list[dict]:
    """Retourne tous les crédits d'un utilisateur (ordre décroissant)."""
    rows = execute(
        """
        SELECT id, user_id, amount, interest_rate, status, created_at, due_date
        FROM loans
        WHERE user_id = %s
        ORDER BY created_at DESC
        """,
        (user_id,),
        fetch="all"
    )
    return rows or []


def get_active_by_user(user_id: int) -> list[dict]:
    """Retourne les crédits actifs d'un utilisateur."""
    rows = execute(
        """
        SELECT id, user_id, amount, interest_rate, status, created_at, due_date
        FROM loans
        WHERE user_id = %s AND status = 'active'
        ORDER BY created_at DESC
        """,
        (user_id,),
        fetch="all"
    )
    return rows or []


def update_status(loan_id: int, status: str) -> bool:
    """Met à jour le statut d'un crédit."""
    try:
        execute(
            "UPDATE loans SET status = %s WHERE id = %s",
            (status, loan_id),
            fetch="none"
        )
        return True
    except Exception:
        return False


# --- Loan repayments ---

def create_repayment(loan_id: int, amount: float) -> dict | None:
    """Enregistre un remboursement."""
    try:
        execute(
            "INSERT INTO loan_repayments (loan_id, amount) VALUES (%s, %s)",
            (loan_id, amount),
            fetch="none"
        )
        row = execute(
            "SELECT id, loan_id, amount, created_at FROM loan_repayments WHERE loan_id = %s ORDER BY id DESC LIMIT 1",
            (loan_id,),
            fetch="one"
        )
        return row
    except Exception:
        return None


def total_repaid(loan_id: int) -> float:
    """Retourne le montant total déjà remboursé pour un crédit."""
    row = execute(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM loan_repayments WHERE loan_id = %s",
        (loan_id,),
        fetch="one"
    )
    return float(row["total"]) if row else 0.0


def list_repayments_by_loan(loan_id: int) -> list[dict]:
    """Retourne les remboursements d'un crédit."""
    rows = execute(
        "SELECT id, loan_id, amount, created_at FROM loan_repayments WHERE loan_id = %s ORDER BY created_at ASC",
        (loan_id,),
        fetch="all"
    )
    return rows or []
