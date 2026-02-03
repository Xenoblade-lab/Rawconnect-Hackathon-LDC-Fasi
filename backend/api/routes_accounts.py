# RAWCONNECT — GET /api/balance/:phone, POST /api/deposit

from flask import Blueprint, request, jsonify

from backend.services import account_service
from backend.utils.errors import api_error, api_success

accounts_bp = Blueprint("accounts", __name__)


@accounts_bp.route("/balance/<phone>", methods=["GET"])
def balance(phone: str):
    """GET /api/balance/:phone — Consulter le solde."""
    ok, data_or_code, msg = account_service.balance(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data={
        "balance": data_or_code["balance"],
        "currency": "FC",
        "user": data_or_code.get("user"),
    })), 200


@accounts_bp.route("/transactions/<phone>", methods=["GET"])
def transactions(phone: str):
    """GET /api/transactions/:phone — Historique des transactions du compte."""
    ok, data_or_code, msg = account_service.list_transactions(phone, limit=20)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data={"transactions": data_or_code})), 200


@accounts_bp.route("/deposit", methods=["POST"])
def deposit():
    """POST /api/deposit — Effectuer un dépôt / épargne."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = account_service.deposit(phone, amount)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(
        data={"new_balance": data_or_code["new_balance"], "new_score": data_or_code.get("new_score"), "transaction": data_or_code.get("transaction")},
        message="Dépôt effectué",
    )), 200


@accounts_bp.route("/withdraw", methods=["POST"])
def withdraw():
    """POST /api/withdraw — Retrait / paiement."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = account_service.withdraw(phone, amount)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(
        data={"new_balance": data_or_code["new_balance"], "transaction": data_or_code.get("transaction")},
        message="Retrait effectué",
    )), 200
