# RAWCONNECT — Routes agents (dépôt/retrait via agent)

from flask import Blueprint, request, jsonify

from backend.services import agent_service
from backend.utils.errors import api_error, api_success

agents_bp = Blueprint("agents", __name__)


@agents_bp.route("/agents", methods=["GET"])
def list_agents():
    """GET /api/agents — Liste des agents."""
    ok, data_or_code, msg = agent_service.list_agents()
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 400
    return jsonify(api_success(data={"agents": data_or_code})), 200


@agents_bp.route("/agent/authenticate", methods=["POST"])
def agent_authenticate():
    """POST /api/agent/authenticate — Vérifier téléphone + PIN agent."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    pin = (body.get("pin") or "").strip()

    ok, data_or_code, msg = agent_service.agent_balance(phone, pin)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 401 if data_or_code == "wrong_pin" else 404
    return jsonify(api_success(data=data_or_code)), 200


@agents_bp.route("/agent/balance", methods=["POST"])
def agent_balance():
    """POST /api/agent/balance — Float et commissions agent."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    pin = (body.get("pin") or "").strip()

    ok, data_or_code, msg = agent_service.agent_balance(phone, pin)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 401 if data_or_code == "wrong_pin" else 404
    return jsonify(api_success(data=data_or_code)), 200


@agents_bp.route("/agent/deposit", methods=["POST"])
def agent_deposit():
    """POST /api/agent/deposit — Dépôt client via agent."""
    body = request.get_json(silent=True) or {}
    agent_phone = (body.get("agent_phone") or body.get("phone") or "").strip()
    agent_pin = (body.get("agent_pin") or body.get("pin") or "").strip()
    client_phone = (body.get("client_phone") or "").strip()
    amount = float(body.get("amount", 0) or 0)

    ok, data_or_code, msg = agent_service.agent_deposit(
        agent_phone, agent_pin, client_phone, amount
    )
    if not ok:
        code = 400
        if data_or_code == "wrong_pin":
            code = 401
        elif data_or_code in ("not_found", "agent_not_found"):
            code = 404
        elif data_or_code == "insufficient_float":
            code = 400
        return jsonify(api_error(data_or_code, msg)), code
    return jsonify(api_success(data=data_or_code, message="Dépôt effectué")), 200


@agents_bp.route("/agent/withdraw", methods=["POST"])
def agent_withdraw():
    """POST /api/agent/withdraw — Retrait client via agent."""
    body = request.get_json(silent=True) or {}
    agent_phone = (body.get("agent_phone") or body.get("phone") or "").strip()
    agent_pin = (body.get("agent_pin") or body.get("pin") or "").strip()
    client_phone = (body.get("client_phone") or "").strip()
    amount = float(body.get("amount", 0) or 0)

    ok, data_or_code, msg = agent_service.agent_withdraw(
        agent_phone, agent_pin, client_phone, amount
    )
    if not ok:
        code = 400
        if data_or_code == "wrong_pin":
            code = 401
        elif data_or_code in ("not_found", "agent_not_found"):
            code = 404
        elif data_or_code == "insufficient_funds":
            code = 400
        return jsonify(api_error(data_or_code, msg)), code
    return jsonify(api_success(data=data_or_code, message="Retrait effectué")), 200


@agents_bp.route("/agent/reload", methods=["POST"])
def agent_reload():
    """POST /api/agent/reload — Recharger le float agent."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    pin = (body.get("pin") or "").strip()
    amount = float(body.get("amount", 0) or 0)

    ok, data_or_code, msg = agent_service.agent_reload_float(phone, pin, amount)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 401 if data_or_code == "wrong_pin" else 404
    return jsonify(api_success(data=data_or_code, message="Float rechargé")), 200


@agents_bp.route("/agent/transactions", methods=["POST"])
def agent_transactions():
    """POST /api/agent/transactions — Historique transactions agent."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    pin = (body.get("pin") or "").strip()
    limit = int(body.get("limit", 20) or 20)

    ok, data_or_code, msg = agent_service.agent_transactions(phone, pin, limit=limit)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 401 if data_or_code == "wrong_pin" else 404
    return jsonify(api_success(data={"transactions": data_or_code})), 200
