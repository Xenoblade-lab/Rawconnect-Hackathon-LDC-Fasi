# RAWCONNECT — Point d'entrée WSGI pour PythonAnywhere
# Ce fichier est chargé par PythonAnywhere pour lancer l'app Flask

import sys
import os

# Ajouter le répertoire du projet au path Python
# Sur PythonAnywhere : /home/VOTRE_USERNAME/rawconnect (ou le nom de votre dossier)
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# Charger les variables d'environnement depuis .env (optionnel, vous pouvez aussi les définir dans le dashboard PA)
from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_DIR, ".env"))

# Importer l'app Flask
from backend.app import app

application = app
