# RAWCONNECT — Agent service (dépôt/retrait via agent)

from backend.models import account_model, notification_model, transaction_model, user_model
from backend.services import scoring_service
from backend.utils.validators import validate_amount, validate_phone, normalize_phone


def _commission_deposit(amount: float) -> float:
    """Commission pour dépôt via agent (FC)."""
    if amount <= 5000:
        return 50
    if amount <= 20000:
        return 100
    return min(200, amount * 0.01)


def _commission_withdrawal(amount: float) -> float:
    """Commission pour retrait via agent (FC)."""
    if amount <= 5000:
        return 100
    if amount <= 20000:
        return 150
    return min(250, amount * 0.015)


def list_agents() -> tuple[bool, list | str, str | None]:
    """
    Retourne la liste des agents avec leurs infos (phone, nom, zone, float).

    Returns:
        (True, [agents], None) ou (False, code, message).
    """
    agents_raw = user_model.list_agents()
    result = []
    for u in agents_raw:
        acc = account_model.get_by_user_id(u["id"])
        if acc:
            result.append({
                "id": u["id"],
                "phone": u["phone"],
                "name": u["name"],
                "zone": u.get("agent_zone") or "",
                "float": float(acc.get("agent_float", 0) or 0),
                "commission_balance": float(acc.get("agent_commission_balance", 0) or 0),
            })
    return True, result, None


def agent_deposit(
    agent_phone: str,
    agent_pin: str,
    client_phone: str,
    amount: float,
) -> tuple[bool, dict | str, str | None]:
    """
    Dépôt client via agent.
    L'agent reçoit le cash, crédite le compte client, son float diminue.

    Returns:
        (True, {new_balance, new_float, commission}, None) ou (False, code, message).
    """
    ok, err = validate_phone(agent_phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_phone(client_phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=100, max_value=500_000)
    if not ok:
        return False, "validation_error", err

    agent = user_model.get_by_phone(normalize_phone(agent_phone)) or user_model.get_by_phone(agent_phone)
    if not agent or (agent.get("role") or "client") != "agent":
        return False, "agent_not_found", "Agent introuvable"

    if agent.get("pin") != agent_pin:
        return False, "wrong_pin", "Code PIN agent incorrect"

    client = user_model.get_by_phone(normalize_phone(client_phone)) or user_model.get_by_phone(client_phone)
    if not client:
        return False, "not_found", "Client introuvable"

    agent_acc = account_model.get_by_user_id(agent["id"])
    client_acc = account_model.get_by_user_id(client["id"])
    if not agent_acc or not client_acc:
        return False, "not_found", "Compte introuvable"

    commission = _commission_deposit(amount)

    new_float = account_model.subtract_agent_float(agent_acc["id"], amount)
    if new_float is None:
        return False, "insufficient_float", "Float agent insuffisant"

    new_client_balance = account_model.add_balance(client_acc["id"], amount)
    if new_client_balance is None:
        account_model.add_agent_float(agent_acc["id"], amount)
        return False, "internal_error", "Impossible de créditer le client"

    account_model.add_agent_commission(agent_acc["id"], commission)

    transaction_model.create(
        client_acc["id"],
        "deposit",
        amount,
        f"Dépôt via agent {agent.get('name', '')}",
        agent_id=agent["id"],
        commission=commission,
    )
    score, _ = scoring_service.recompute_and_persist(client["id"])

    agent_msg = f"Dépôt de {amount:,.0f} FC pour {client.get('name', 'client')} effectué. Commission: {commission:,.0f} FC. Nouveau float: {new_float:,.0f} FC."
    client_msg = f"Vous avez reçu {amount:,.0f} FC via Agent {agent.get('name', '')}. Nouveau solde: {new_client_balance:,.0f} FC."
    notification_model.create(agent["phone"], "agent", agent_msg)
    notification_model.create(client["phone"], "client", client_msg)

    return True, {
        "new_balance": new_client_balance,
        "new_float": new_float,
        "commission": commission,
        "client_name": client.get("name"),
        "agent_name": agent.get("name"),
    }, None


def agent_withdraw(
    agent_phone: str,
    agent_pin: str,
    client_phone: str,
    amount: float,
) -> tuple[bool, dict | str, str | None]:
    """
    Retrait client via agent.
    Le compte client est débité, l'agent paie le cash, son float augmente.

    Returns:
        (True, {new_balance, new_float, commission}, None) ou (False, code, message).
    """
    ok, err = validate_phone(agent_phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_phone(client_phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=100, max_value=500_000)
    if not ok:
        return False, "validation_error", err

    agent = user_model.get_by_phone(normalize_phone(agent_phone)) or user_model.get_by_phone(agent_phone)
    if not agent or (agent.get("role") or "client") != "agent":
        return False, "agent_not_found", "Agent introuvable"

    if agent.get("pin") != agent_pin:
        return False, "wrong_pin", "Code PIN agent incorrect"

    client = user_model.get_by_phone(normalize_phone(client_phone)) or user_model.get_by_phone(client_phone)
    if not client:
        return False, "not_found", "Client introuvable"

    agent_acc = account_model.get_by_user_id(agent["id"])
    client_acc = account_model.get_by_user_id(client["id"])
    if not agent_acc or not client_acc:
        return False, "not_found", "Compte introuvable"

    commission = _commission_withdrawal(amount)
    net_to_client = amount - commission  # le client reçoit moins la commission

    new_client_balance = account_model.subtract_balance(client_acc["id"], amount)
    if new_client_balance is None:
        return False, "insufficient_funds", "Solde client insuffisant"

    new_float = account_model.add_agent_float(agent_acc["id"], net_to_client)
    if new_float is None:
        account_model.add_balance(client_acc["id"], amount)
        return False, "internal_error", "Impossible de mettre à jour le float agent"

    account_model.add_agent_commission(agent_acc["id"], commission)

    transaction_model.create(
        client_acc["id"],
        "withdrawal",
        amount,
        f"Retrait via agent {agent.get('name', '')}",
        agent_id=agent["id"],
        commission=commission,
    )

    agent_msg = f"Retrait de {amount:,.0f} FC pour {client.get('name', 'client')} effectué. Client reçoit: {net_to_client:,.0f} FC. Commission: {commission:,.0f} FC. Nouveau float: {new_float:,.0f} FC."
    client_msg = f"Retrait de {amount:,.0f} FC effectué via Agent {agent.get('name', '')}. Montant reçu: {net_to_client:,.0f} FC. Nouveau solde: {new_client_balance:,.0f} FC."
    notification_model.create(agent["phone"], "agent", agent_msg)
    notification_model.create(client["phone"], "client", client_msg)

    return True, {
        "new_balance": new_client_balance,
        "new_float": new_float,
        "commission": commission,
        "amount_to_client": net_to_client,
        "client_name": client.get("name"),
        "agent_name": agent.get("name"),
    }, None


def agent_balance(agent_phone: str, agent_pin: str) -> tuple[bool, dict | str, str | None]:
    """
    Retourne le float et les commissions de l'agent.

    Returns:
        (True, {float, commission_balance, name}, None) ou (False, code, message).
    """
    ok, err = validate_phone(agent_phone)
    if not ok:
        return False, "validation_error", err

    agent = user_model.get_by_phone(normalize_phone(agent_phone)) or user_model.get_by_phone(agent_phone)
    if not agent or (agent.get("role") or "client") != "agent":
        return False, "agent_not_found", "Agent introuvable"

    if agent.get("pin") != agent_pin:
        return False, "wrong_pin", "Code PIN agent incorrect"

    acc = account_model.get_by_user_id(agent["id"])
    if not acc:
        return False, "not_found", "Compte agent introuvable"

    return True, {
        "float": float(acc.get("agent_float", 0) or 0),
        "commission_balance": float(acc.get("agent_commission_balance", 0) or 0),
        "name": agent.get("name"),
    }, None


def agent_reload_float(agent_phone: str, agent_pin: str, amount: float) -> tuple[bool, dict | str, str | None]:
    """
    Recharge le float agent (simulation : ajoute au float).

    Returns:
        (True, {new_float}, None) ou (False, code, message).
    """
    ok, err = validate_phone(agent_phone)
    if not ok:
        return False, "validation_error", err
    ok, err = validate_amount(amount, min_value=1000, max_value=10_000_000)
    if not ok:
        return False, "validation_error", err

    agent = user_model.get_by_phone(normalize_phone(agent_phone)) or user_model.get_by_phone(agent_phone)
    if not agent or (agent.get("role") or "client") != "agent":
        return False, "agent_not_found", "Agent introuvable"

    if agent.get("pin") != agent_pin:
        return False, "wrong_pin", "Code PIN agent incorrect"

    acc = account_model.get_by_user_id(agent["id"])
    if not acc:
        return False, "not_found", "Compte agent introuvable"

    new_float = account_model.add_agent_float(acc["id"], amount)
    if new_float is None:
        return False, "internal_error", "Impossible de recharger le float"

    return True, {"new_float": new_float}, None


def agent_transactions(agent_phone: str, agent_pin: str, limit: int = 20) -> tuple[bool, list | str, str | None]:
    """
    Historique des transactions effectuées par l'agent.

    Returns:
        (True, [transactions], None) ou (False, code, message).
    """
    ok, err = validate_phone(agent_phone)
    if not ok:
        return False, "validation_error", err

    agent = user_model.get_by_phone(normalize_phone(agent_phone)) or user_model.get_by_phone(agent_phone)
    if not agent or (agent.get("role") or "client") != "agent":
        return False, "agent_not_found", "Agent introuvable"

    if agent.get("pin") != agent_pin:
        return False, "wrong_pin", "Code PIN agent incorrect"

    txs = transaction_model.list_by_agent(agent["id"], limit=limit)
    return True, txs, None
