<<<<<<< HEAD
# RAWCONNECT — POST /api/loan/request, /accept, /repay

from flask import Blueprint, request, jsonify

from backend.services import loan_service
from backend.utils.errors import api_error, api_success

loans_bp = Blueprint("loans", __name__)


@loans_bp.route("/loan/request", methods=["POST"])
def loan_request():
    """POST /api/loan/request — Éligibilité / proposition de microcrédit."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()

    ok, data_or_code, msg = loan_service.propose(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data=data_or_code)), 200


@loans_bp.route("/loan/accept", methods=["POST"])
def loan_accept():
    """POST /api/loan/accept — Accepter un microcrédit."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = loan_service.accept(phone, amount)
    if not ok:
        status = 400
        if data_or_code == "not_found":
            status = 404
        elif data_or_code in ("not_eligible", "amount_exceeded"):
            status = 400
        return jsonify(api_error(data_or_code, msg)), status

    return jsonify(api_success(
        data={
            "loan": data_or_code["loan"],
            "new_balance": data_or_code["new_balance"],
            "total_repayment": data_or_code["total_repayment"],
            "due_date": data_or_code["due_date"],
            "duration_days": data_or_code.get("duration_days"),
        },
        message="Crédit accordé",
    )), 201


@loans_bp.route("/loan/repay", methods=["POST"])
def loan_repay():
    """POST /api/loan/repay — Rembourser un crédit (partiel ou total)."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = loan_service.repay(phone, amount)
    if not ok:
        status = 400
        if data_or_code == "not_found":
            status = 404
        return jsonify(api_error(data_or_code, msg)), status

    return jsonify(api_success(
        data={
            "remaining": data_or_code["remaining"],
            "completed": data_or_code["completed"],
            "new_balance": data_or_code["new_balance"],
            "new_score": data_or_code.get("new_score"),
        },
        message="Remboursement enregistré" if not data_or_code["completed"] else "Crédit soldé",
    )), 200
=======
# RAWCONNECT — POST /api/loan/request, /accept, /repay

from flask import Blueprint, request, jsonify

from backend.services import loan_service
from backend.utils.errors import api_error, api_success

loans_bp = Blueprint("loans", __name__)


@loans_bp.route("/loan/request", methods=["POST"])
def loan_request():
    """POST /api/loan/request — Éligibilité / proposition de microcrédit."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()

    ok, data_or_code, msg = loan_service.propose(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data=data_or_code)), 200


@loans_bp.route("/loan/accept", methods=["POST"])
def loan_accept():
    """POST /api/loan/accept — Accepter un microcrédit."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = loan_service.accept(phone, amount)
    if not ok:
        status = 400
        if data_or_code == "not_found":
            status = 404
        elif data_or_code in ("not_eligible", "amount_exceeded"):
            status = 400
        return jsonify(api_error(data_or_code, msg)), status

    return jsonify(api_success(
        data={
            "loan": data_or_code["loan"],
            "new_balance": data_or_code["new_balance"],
            "total_repayment": data_or_code["total_repayment"],
            "due_date": data_or_code["due_date"],
            "duration_days": data_or_code.get("duration_days"),
        },
        message="Crédit accordé",
    )), 201


@loans_bp.route("/loan/repay", methods=["POST"])
def loan_repay():
    """POST /api/loan/repay — Rembourser un crédit (partiel ou total)."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    amount = body.get("amount")

    if amount is None:
        return jsonify(api_error("validation_error", "Le montant est requis")), 400
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return jsonify(api_error("validation_error", "Montant invalide")), 400

    ok, data_or_code, msg = loan_service.repay(phone, amount)
    if not ok:
        status = 400
        if data_or_code == "not_found":
            status = 404
        return jsonify(api_error(data_or_code, msg)), status

    return jsonify(api_success(
        data={
            "remaining": data_or_code["remaining"],
            "completed": data_or_code["completed"],
            "new_balance": data_or_code["new_balance"],
            "new_score": data_or_code.get("new_score"),
        },
        message="Remboursement enregistré" if not data_or_code["completed"] else "Crédit soldé",
    )), 200
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
