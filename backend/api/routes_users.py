# RAWCONNECT — POST /api/register, GET /api/user/:phone, OTP (KYC L1)

from flask import Blueprint, request, jsonify

from backend.services import user_service, otp_service
from backend.utils.errors import api_error, api_success

users_bp = Blueprint("users", __name__)


@users_bp.route("/register", methods=["POST"])
def register():
    """POST /api/register — Créer un compte (KYC L1)."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    name = (body.get("name") or "").strip()
    activity_type = (body.get("activity_type") or "").strip() or None
    date_of_birth = (body.get("date_of_birth") or "").strip() or None
    pin = (body.get("pin") or "0000").strip()

    ok, data_or_code, msg = user_service.register(phone, name, activity_type, pin, date_of_birth)
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


# --- OTP (KYC L1: vérification SIM + OTP) ---

@users_bp.route("/otp/send", methods=["POST"])
def otp_send():
    """POST /api/otp/send — Envoyer un code OTP au numéro (pour inscription KYC L1)."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()

    ok, err, code = otp_service.send_otp(phone)
    if not ok:
        return jsonify(api_error("validation_error", err or "Erreur")), 400

    # Retourne le code pour affichage en simulation (SMS simulé)
    return jsonify(api_success(
        data={"code": code},
        message="Code OTP envoyé (SMS simulé)"
    )), 200


@users_bp.route("/otp/verify", methods=["POST"])
def otp_verify():
    """POST /api/otp/verify — Vérifier le code OTP."""
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    code = (body.get("code") or "").strip()

    ok, err = otp_service.verify_otp(phone, code)
    if not ok:
        return jsonify(api_error("invalid_otp", err or "Code invalide")), 400

    return jsonify(api_success(message="Code OTP vérifié")), 200
