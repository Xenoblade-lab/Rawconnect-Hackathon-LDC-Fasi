# RAWCONNECT — POST /api/register, GET /api/user/:phone

from flask import Blueprint, request, jsonify

from backend.services import user_service
from backend.utils.errors import api_error, api_success

users_bp = Blueprint("users", __name__)


@users_bp.route("/register", methods=["POST"])
def register():
    """POST /api/register — Créer un compte."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    name = (body.get("name") or "").strip()
    activity_type = (body.get("activity_type") or "").strip() or None
    pin = (body.get("pin") or "0000").strip()

    ok, data_or_code, msg = user_service.register(phone, name, activity_type, pin)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 400 if data_or_code == "validation_error" or data_or_code == "phone_exists" else 404

    user = data_or_code["user"]
    return jsonify(api_success(
        data={"user_id": user["id"], "phone": user["phone"], "initial_score": data_or_code["initial_score"]},
        message="Compte créé avec succès",
    )), 201


@users_bp.route("/user/<phone>", methods=["GET"])
def get_user(phone: str):
    """GET /api/user/:phone — Retourner l'utilisateur."""
    ok, data_or_code, msg = user_service.lookup(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data=data_or_code)), 200


@users_bp.route("/authenticate", methods=["POST"])
def authenticate():
    """POST /api/authenticate — Vérifier téléphone + PIN."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    pin = (body.get("pin") or "").strip()

    ok, data_or_code, msg = user_service.authenticate(phone, pin)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 401 if data_or_code == "wrong_pin" else 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data=data_or_code)), 200
