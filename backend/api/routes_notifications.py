# RAWCONNECT — GET /api/notifications/:phone (polling SMS simulés)

from flask import Blueprint, request, jsonify

from backend.models import notification_model
from backend.utils.errors import api_error, api_success

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications/<phone>", methods=["GET"])
def get_notifications(phone: str):
    """
    GET /api/notifications/:phone?since=id
    Retourne les notifications SMS pour ce téléphone avec id > since.
    Utilisé par le frontend pour le polling (agent + client).
    """
    since = request.args.get("since", "0", type=str).strip()
    try:
        since_id = int(since) if since else 0
    except ValueError:
        since_id = 0

    rows = notification_model.list_by_phone_since(phone, since_id=since_id, limit=50)
    return jsonify(api_success(data={
        "notifications": [
            {"id": r["id"], "recipient": r["recipient"], "message": r["message"], "created_at": str(r.get("created_at", ""))}
            for r in rows
        ],
    })), 200
