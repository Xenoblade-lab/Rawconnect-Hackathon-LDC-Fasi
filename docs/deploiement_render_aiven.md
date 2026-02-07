# Déploiement RAWCONNECT : Render + Aiven (MySQL gratuit)

Guide pour héberger ton backend Flask sur **Render** avec une base MySQL gratuite sur **Aiven**.

> **Note** : PlanetScale n'a plus de plan gratuit depuis avril 2024. **Aiven** offre un MySQL gratuit (1 Go, VM dédiée).

---

## Vue d'ensemble

| Service | Rôle |
|---------|------|
| **Aiven** | Base MySQL gratuite (host, user, password, database) |
| **Render** | Hébergement gratuit du backend Flask |
| **GitHub** | Dépôt du code (Render déploie automatiquement depuis GitHub) |

---

## Étape 1 : Créer la base MySQL sur Aiven (gratuit)

### 1.1 Inscription

1. Va sur [aiven.io](https://aiven.io) → **Start free**
2. Crée un compte (email + mot de passe)
3. Vérifie ton email si demandé

### 1.2 Créer un service MySQL

1. Dashboard Aiven → **Create service**
2. Choisis **MySQL**
3. **Cloud provider** : AWS (ou autre, peu importe)
4. **Region** : Choisis la plus proche de toi (ex. eu-west-1)
5. **Plan** : **Free** (si disponible) ou le plan le moins cher
6. **Service name** : `rawconnect-db` (ou autre)
7. Clique **Create service**
8. Attends 2-5 minutes que le service soit prêt

### 1.3 Récupérer les identifiants

1. Clique sur ton service MySQL
2. Onglet **Overview** ou **Connection information**
3. Note :
   - **Host** (ex. `rawconnect-db-xxx.aivencloud.com`)
   - **Port** (3306 par défaut)
   - **Database name** (ex. `defaultdb` ou celui que tu as créé)
   - **User** (ex. `avnadmin`)
   - **Password** (clique sur "Show" pour afficher)

> Aiven utilise **SSL par défaut**. Le projet a déjà le support SSL activé via `DB_SSL=1`.

---

## Étape 2 : Préparer le projet pour Render

### 2.1 Fichiers déjà préparés

Le projet contient déjà :
- **gunicorn** dans `requirements.txt` (serveur WSGI pour production)
- **SSL** activable via `DB_SSL=1` dans la config
- **setup_db** adapté : ne tente pas de créer la base si host ≠ localhost

### 2.2 Créer `render.yaml` (optionnel)

Tu peux créer un fichier `render.yaml` à la racine pour automatiser le déploiement :

```yaml
services:
  - type: web
    name: rawconnect-api
    runtime: python
    plan: free

    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn backend.app:app --bind 0.0.0.0:$PORT

    envVars:
      - key: PYTHON_VERSION
        value: "3.13.0"
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: "3306"
      - key: DB_NAME
        sync: false
      - key: DB_USER
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_SSL
        value: "1"
      - key: FLASK_ENV
        value: "production"
      - key: SECRET_KEY
        generateValue: true
```

---

## Étape 3 : Déployer sur Render

### 3.1 Inscription Render

1. Va sur [render.com](https://render.com) → **Get started for free**
2. Connecte-toi avec **GitHub**

### 3.2 Créer un Web Service

1. Dashboard → **New** → **Web Service**
2. Connecte le dépôt **Xenoblade-lab/Rawconnect-Hackathon-LDC-Fasi**
3. Paramètres :
   - **Name** : `rawconnect-api`
   - **Region** : Choisis le plus proche (ex. Frankfurt)
   - **Branch** : `main`
   - **Runtime** : **Python 3**
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn backend.app:app --bind 0.0.0.0:$PORT`
   - **Instance Type** : **Free**

### 3.3 Variables d'environnement

Dans la section **Environment** du service, ajoute :

| Key | Value |
|-----|-------|
| `DB_HOST` | Ton host Aiven (ex. `rawconnect-db-xxx.aivencloud.com`) |
| `DB_PORT` | `3306` |
| `DB_NAME` | Nom de la base Aiven (ex. `defaultdb`) |
| `DB_USER` | Utilisateur Aiven (ex. `avnadmin`) |
| `DB_PASSWORD` | Mot de passe Aiven (secret) |
| `DB_SSL` | `1` (obligatoire pour Aiven) |
| `FLASK_ENV` | `production` |
| `SECRET_KEY` | Une chaîne aléatoire (ex. `mon-secret-change-moi`) |

### 3.4 Déployer

1. Clique **Create Web Service**
2. Render va builder et déployer (2-5 min)
3. L'API sera accessible à : `https://rawconnect-api.onrender.com` (ou un nom similaire)

---

## Étape 4 : Initialiser la base (tables + données de démo)

Render ne permet pas d'exécuter `setup_db` facilement sur le serveur. Deux options :

### Option A : Lancer setup_db en local avec les identifiants Aiven

1. Sur ta machine, crée un fichier `.env` avec les identifiants Aiven :
   ```
   DB_HOST=ton-host.aivencloud.com
   DB_PORT=3306
   DB_NAME=defaultdb
   DB_USER=avnadmin
   DB_PASSWORD=ton-mot-de-passe-aiven
   DB_SSL=1
   ```
2. Lance :
   ```bash
   python -m backend.db.setup_db
   ```
3. Les tables et données de démo seront créées sur Aiven.

### Option B : Endpoint d'init (à éviter en prod)

Tu peux ajouter une route `/api/init-db` protégée par un secret pour lancer le setup. Déconseillé en production.

---

## Étape 5 : Tester l'API

1. Ouvre `https://ton-service.onrender.com/` → doit renvoyer `{"service": "RAWCONNECT API", ...}`
2. Ouvre `https://ton-service.onrender.com/api` → liste des endpoints

---

## Étape 6 : Frontend

Pour que le simulateur USSD appelle l'API en ligne :

1. Ouvre `frontend/index.html`
2. Avant le chargement des scripts, ajoute : `<script>window.RAWCONNECT_API_BASE = 'https://ton-service.onrender.com/api';</script>`
3. Ou modifie la ligne 6 de `frontend/js/api_client.js` : remplace `'http://localhost:5000/api'` par l'URL de ton API Render

Tu peux héberger le frontend sur **Netlify**, **Vercel** ou **GitHub Pages** (gratuit) et y configurer l’URL de l’API.

---

## Résumé des variables d'environnement (Render)

```
DB_HOST=<host Aiven>
DB_PORT=3306
DB_NAME=<database Aiven>
DB_USER=<user Aiven>
DB_PASSWORD=<password Aiven>
DB_SSL=1
FLASK_ENV=production
SECRET_KEY=<chaîne aléatoire>
```

---

## En cas d'erreur

- **Erreur SSL** : Vérifie que `DB_SSL=1` est bien défini.
- **Connection refused** : Vérifie host, port, user, password. Aiven peut mettre quelques minutes pour activer l’accès.
- **Render : Application failed to respond** : Vérifie que le Start Command est correct (`gunicorn backend.app:app --bind 0.0.0.0:$PORT`).

---

**Bon déploiement !**
