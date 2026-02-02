<<<<<<< HEAD
# RAWCONNECT — GET /api/score/:phone

from flask import Blueprint, jsonify

from backend.services import scoring_service
from backend.utils.errors import api_error, api_success

scores_bp = Blueprint("scores", __name__)


@scores_bp.route("/score/<phone>", methods=["GET"])
def get_score(phone: str):
    """GET /api/score/:phone — Obtenir le score (calcul + persistance)."""
    ok, data_or_code, msg = scoring_service.get_or_compute(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data={
        "score": data_or_code["score"],
        "breakdown": data_or_code.get("breakdown"),
        "user_id": data_or_code.get("user_id"),
    })), 200
=======
# RAWCONNECT — GET /api/score/:phone

from flask import Blueprint, jsonify

from backend.services import scoring_service
from backend.utils.errors import api_error, api_success

scores_bp = Blueprint("scores", __name__)


@scores_bp.route("/score/<phone>", methods=["GET"])
def get_score(phone: str):
    """GET /api/score/:phone — Obtenir le score (calcul + persistance)."""
    ok, data_or_code, msg = scoring_service.get_or_compute(phone)
    if not ok:
        return jsonify(api_error(data_or_code, msg)), 404 if data_or_code == "not_found" else 400

    return jsonify(api_success(data={
        "score": data_or_code["score"],
        "breakdown": data_or_code.get("breakdown"),
        "user_id": data_or_code.get("user_id"),
    })), 200
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
