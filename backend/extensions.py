# RAWCONNECT — Extensions partagées (CORS, etc.)
# À connecter à l’app Flask dans app.py

from flask_cors import CORS


def init_app(app):
    CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization"])
