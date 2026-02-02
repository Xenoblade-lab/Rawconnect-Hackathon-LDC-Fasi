# RAWCONNECT — Données de démo (users, tx, loans, agent)
# À exécuter après création des tables SQL (run schema.sql d'abord).

from backend.db.connection import execute, get_conn


def seed_demo_data():
    """Insère les données de démo pour tester."""
    print("🌱 Insertion des données de démo...")

    # 1. User: Maman Marie (client)
    user_sql = """
        INSERT INTO users (phone, name, activity_type, pin, role, created_at)
        VALUES (%s, %s, %s, %s, 'client', %s)
    """
    execute(
        user_sql,
        ("0812345678", "Maman Marie", "marché", "1234", "2025-01-10 08:00:00"),
        fetch="none"
    )
    print("  ✓ User créé: Maman Marie (0812345678)")

    # Récupérer l'ID du user
    user = execute(
        "SELECT id FROM users WHERE phone = %s",
        ("0812345678",),
        fetch="one"
    )
    user_id = user["id"]

    # 2. Account Maman Marie
    account_sql = """
        INSERT INTO accounts (user_id, balance, agent_float, agent_commission_balance, created_at)
        VALUES (%s, %s, 0, 0, %s)
    """
    execute(
        account_sql,
        (user_id, 15000.00, "2025-01-10 08:00:00"),
        fetch="none"
    )
    print("  ✓ Compte créé: balance 15,000 FC")

    account = execute(
        "SELECT id FROM accounts WHERE user_id = %s",
        (user_id,),
        fetch="one"
    )
    account_id = account["id"]

    # 3. Transactions (dans l'ordre chronologique inverse pour correspondre au frontend)
    transactions = [
        ("deposit", 5000.00, "Dépôt épargne", "2025-01-20 14:30:00"),
        ("deposit", 3000.00, "Dépôt épargne", "2025-01-18 10:15:00"),
        ("withdrawal", 2000.00, "Retrait", "2025-01-16 16:45:00"),
    ]
    tx_sql = """
        INSERT INTO transactions (account_id, type, amount, description, created_at)
        VALUES (%s, %s, %s, %s, %s)
    """
    for tx_type, amount, desc, dt in transactions:
        execute(tx_sql, (account_id, tx_type, amount, desc, dt), fetch="none")
    print(f"  ✓ {len(transactions)} transactions créées")

    # 4. Score
    score_sql = """
        INSERT INTO scores (user_id, score, last_updated)
        VALUES (%s, %s, %s)
    """
    execute(
        score_sql,
        (user_id, 72.00, "2025-01-20 14:30:00"),
        fetch="none"
    )
    print("  ✓ Score créé: 72/100")

    # 5. Loan
    loan_sql = """
        INSERT INTO loans (user_id, amount, interest_rate, status, created_at, due_date)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    # Montant: 25,000 FC, taux 10%, total remboursement: 27,500 FC
    # Remboursé: 19,500 FC, reste: 8,000 FC
    execute(
        loan_sql,
        (
            user_id,
            25000.00,
            0.10,
            "active",
            "2025-01-15 09:00:00",
            "2025-03-16 23:59:59"  # 60 jours après création
        ),
        fetch="none"
    )
    print("  ✓ Crédit créé: 25,000 FC (actif, reste 8,000 FC)")

    loan = execute(
        "SELECT id FROM loans WHERE user_id = %s ORDER BY id DESC LIMIT 1",
        (user_id,),
        fetch="one"
    )
    loan_id = loan["id"]

    # 6. Loan repayment
    repayment_sql = """
        INSERT INTO loan_repayments (loan_id, amount, created_at)
        VALUES (%s, %s, %s)
    """
    execute(
        repayment_sql,
        (loan_id, 19500.00, "2025-01-20 15:00:00"),
        fetch="none"
    )
    print("  ✓ Remboursement créé: 19,500 FC")

    # 7. Agent: Agent Victoire
    agent_sql = """
        INSERT INTO users (phone, name, activity_type, pin, role, agent_zone, created_at)
        VALUES (%s, %s, %s, %s, 'agent', %s, %s)
    """
    execute(
        agent_sql,
        ("0899999999", "Agent Victoire", "boutique", "5678", "Kinshasa - Lingwala", "2025-01-05 09:00:00"),
        fetch="none"
    )
    print("  ✓ Agent créé: Agent Victoire (0899999999, PIN 5678)")

    agent_user = execute(
        "SELECT id FROM users WHERE phone = %s",
        ("0899999999",),
        fetch="one"
    )
    agent_id = agent_user["id"]

    agent_account_sql = """
        INSERT INTO accounts (user_id, balance, agent_float, agent_commission_balance, created_at)
        VALUES (%s, 0, 50000, 0, %s)
    """
    execute(
        agent_account_sql,
        (agent_id, "2025-01-05 09:00:00"),
        fetch="none"
    )
    print("  ✓ Compte agent créé: float 50,000 FC")

    print("✅ Données de démo insérées avec succès!")


if __name__ == "__main__":
    try:
        seed_demo_data()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
