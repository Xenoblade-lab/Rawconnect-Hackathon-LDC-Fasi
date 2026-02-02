<<<<<<< HEAD
# RAWCONNECT — Extensions partagées (CORS, etc.)
# À connecter à l’app Flask dans app.py

from flask_cors import CORS


def init_app(app):
    CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization"])
=======
# RAWCONNECT — Extensions partagées (CORS, etc.)
# À connecter à l’app Flask dans app.py

from flask_cors import CORS


def init_app(app):
    CORS(app, origins=["*"], allow_headers=["Content-Type", "Authorization"])
>>>>>>> 463e3abd36884f251c14dea4f64c592739b8804e
