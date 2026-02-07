# Déploiement RAWCONNECT sur PythonAnywhere

Guide étape par étape pour héberger gratuitement votre backend Flask + MySQL.

---

## Étape 1 : Créer un compte et préparer le projet

### 1.1 Créer un compte gratuit

1. Allez sur [www.pythonanywhere.com](https://www.pythonanywhere.com)
2. Cliquez sur **"Pricing & signup"** → **"Create a Beginner account"** (gratuit)
3. Remplissez le formulaire et validez

### 1.2 Fichiers déjà préparés dans le projet

Le projet contient déjà :
- **`wsgi.py`** à la racine : point d'entrée WSGI requis par PythonAnywhere
- **`requirements.txt`** : dépendances Python
- **`.env.example`** : modèle pour les variables d'environnement

---

## Étape 2 : Cloner le projet sur PythonAnywhere

### 2.1 Ouvrir un bash

1. Connectez-vous à PythonAnywhere
2. Allez dans l'onglet **"Consoles"**
3. Cliquez **"$ Bash"** pour ouvrir un terminal

### 2.2 Cloner depuis GitHub

```bash
cd ~
git clone https://github.com/Xenoblade-lab/Rawconnect-Hackathon-LDC-Fasi.git rawconnect
cd rawconnect
```

https://github.com/Xenoblade-lab/Rawconnect-Hackathon-LDC-Fasi.git

> Si le projet n'est pas sur GitHub, utilisez l'onglet **"Files"** pour uploader les fichiers (zip puis extraction).

---

## Étape 3 : Créer l'environnement virtuel et installer les dépendances

```bash
cd ~/rawconnect
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Étape 4 : Créer et configurer la base MySQL

### 4.1 Créer la base MySQL

1. Allez dans l'onglet **"Databases"**
2. Choisissez un mot de passe MySQL (gardez-le précieusement)
3. Cliquez **"Create database"** → nommez-la `rawconnect` (ou le nom que vous voulez)

### 4.2 Configurer les variables d'environnement

1. Allez dans **"Web"** → votre site
2. Section **"Code"** → cliquez **"Edit"** à côté de **"WSGI configuration file"**
3. PythonAnywhere crée un fichier type `/var/www/VOTRE_USERNAME_pythonanywhere_com_wsgi.py`
4. **Remplacez tout** par le contenu de votre `wsgi.py`, ou ajoutez les variables d'environnement au début :

```python
import os
os.environ["DB_HOST"] = "VOTRE_USERNAME.mysql.pythonanywhere-services.com"
os.environ["DB_NAME"] = "VOTRE_USERNAME$rawconnect"
os.environ["DB_USER"] = "VOTRE_USERNAME"
os.environ["DB_PASSWORD"] = "VOTRE_MOT_DE_PASSE_MYSQL"
os.environ["FLASK_ENV"] = "production"
```

5. Ou créez un fichier `.env` dans le dossier du projet avec ces valeurs.

### 4.3 Lancer le setup de la base

Dans le bash (avec `venv` activé) :

```bash
cd ~/rawconnect
source venv/bin/activate
python -m backend.db.setup_db
```

> **Important** : Sur PythonAnywhere, le host MySQL est `VOTRE_USERNAME.mysql.pythonanywhere-services.com` et le nom de la base est `VOTRE_USERNAME$rawconnect`. Adaptez votre `.env` ou les variables d'environnement.

---

## Étape 5 : Créer la Web App Flask

### 5.1 Créer l'application Web

1. Allez dans **"Web"**
2. Cliquez **"Add a new web app"**
3. Choisissez **"Manual configuration"** (pas le wizard Flask)
4. Sélectionnez **Python 3.10** (ou la version proposée)

### 5.2 Configurer le chemin du code

1. Section **"Code"** :
   - **Source code** : `/home/VOTRE_USERNAME/rawconnect`
   - **Working directory** : `/home/VOTRE_USERNAME/rawconnect`

### 5.3 Configurer le virtualenv

1. **Virtualenv** : cliquez sur le chemin et entrez :
   ```
   /home/VOTRE_USERNAME/rawconnect/venv
   ```
2. Cliquez sur le crayon pour enregistrer

### 5.4 Configurer le fichier WSGI

1. Cliquez sur **"WSGI configuration file"** (lien bleu)
2. **Supprimez tout** le contenu par défaut
3. Remplacez par :

```python
import sys
import os

# Chemin du projet
path = "/home/VOTRE_USERNAME/rawconnect"
if path not in sys.path:
    sys.path.insert(0, path)

# Variables d'environnement (adapter avec vos valeurs MySQL)
os.environ["DB_HOST"] = "VOTRE_USERNAME.mysql.pythonanywhere-services.com"
os.environ["DB_NAME"] = "VOTRE_USERNAME$rawconnect"
os.environ["DB_USER"] = "VOTRE_USERNAME"
os.environ["DB_PASSWORD"] = "VOTRE_MOT_DE_PASSE_MYSQL"
os.environ["FLASK_ENV"] = "production"

# Charger .env si présent
from dotenv import load_dotenv
load_dotenv(os.path.join(path, ".env"))

from backend.app import app
application = app
```

4. **Remplacez** `VOTRE_USERNAME` et `VOTRE_MOT_DE_PASSE_MYSQL` par vos vraies valeurs.
5. Sauvegardez (Ctrl+S)

### 5.5 Définir les URL statiques (pour le frontend)

1. Section **"Static files"** :
   - **URL** : `/static/`
   - **Directory** : `/home/VOTRE_USERNAME/rawconnect/frontend/` (si vous servez le frontend depuis le backend)
   - Ou laissez vide si vous hébergez le frontend ailleurs (Netlify, Vercel, etc.)

2. Cliquez **"Reload"** pour recharger l'application

---

## Étape 6 : Tester l'API

1. Votre API sera disponible à : `https://VOTRE_USERNAME.pythonanywhere.com`
2. Testez : `https://VOTRE_USERNAME.pythonanywhere.com/` → doit renvoyer `{"service": "RAWCONNECT API", ...}`
3. Testez : `https://VOTRE_USERNAME.pythonanywhere.com/api`

---

## Héberger le frontend (optionnel)

Le frontend (HTML/JS/CSS) peut être hébergé :

1. **Sur PythonAnywhere** : ajoutez une route Flask pour servir `frontend/index.html`, ou configurez Static files
2. **Sur Netlify/Vercel** : uploadez le dossier `frontend/` et modifiez `api_client.js` pour pointer vers l'URL de votre API PythonAnywhere

---

## Résumé des URLs à adapter

| Où | Quoi |
|----|------|
| `api_client.js` | `API_BASE_URL` = `https://VOTRE_USERNAME.pythonanywhere.com` |
| WSGI / .env | `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (valeurs MySQL PA) |

---

**En cas d'erreur** : consultez les logs dans **"Web"** → **"Error log"** et **"Server log"**.
