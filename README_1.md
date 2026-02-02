# RAWCONNECT

Plateforme bancaire inclusive (USSD + microcrédit intelligent) — Hackathon UPC-FASI 2026.

- **Backend** : Flask, moteur de scoring Python, base **SQL** (MySQL).
- **Frontend** : simulation USSD web.

Voir `Infos_projet/` et `docs/` pour la conception et l'API.

---

## Comment lancer le site

### 1. Prérequis

- **Python 3** (ex. 3.10+)
- **MySQL** (ex. via Laragon : démarrer MySQL dans Laragon)
- Un navigateur web

### 2. Créer la base de données (une seule fois)

À la racine du projet :

```bash
python -m backend.db.setup_db
```

Cela crée la base `rawconnect`, les tables et les données de démo (compte **0812345678** / PIN **1234**).

Si besoin, configurer la connexion MySQL dans un fichier **`.env`** (voir `.env.example`) :

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rawconnect
DB_USER=root
DB_PASSWORD=
```

### 3. Démarrer le backend (API Flask)

À la racine du projet :

```bash
python -m backend.app
```

Le serveur écoute sur **http://localhost:5000**. Garder ce terminal ouvert.

### 4. Ouvrir le frontend (simulateur USSD)

- **Option A** : Ouvrir le fichier **`frontend/index.html`** directement dans le navigateur (double-clic ou glisser dans Chrome/Firefox/Edge).
- **Option B** : Servir le dossier `frontend` avec un serveur local (ex. `python -m http.server 8080` dans `frontend`, puis aller sur **http://localhost:8080**).

### 5. Utiliser le site

1. Sur la page d'accueil, cliquer sur **« Tester le Simulateur »** (ou aller directement sur la page simulateur).
2. Dans le champ de saisie (ou avec le clavier à l'écran), taper **`*444#`** puis **Envoyer**.
3. Le menu principal s'affiche :
   - **1** – Créer un compte  
   - **2** – Consulter solde  
   - **3** – Épargner (dépôt / retrait / historique)  
   - **4** – Demander microcrédit (éligibilité, demande, remboursement)  
   - **5** – Aide / Langue  
4. Taper le numéro de l'option (1, 2, 3, 4 ou 5) puis Envoyer, et suivre les instructions à l'écran.
5. **Touche « Effacer »** (clavier) : vide le champ de saisie.
6. **0** = retour au menu précédent ; **#** ou **Annuler** = quitter la session USSD.

**Compte de démo (déjà en base)**  
- Téléphone : **0812345678**  
- PIN : **1234**  
- Vous pouvez ainsi tester **Consulter solde**, **Épargner**, **Microcrédit** sans créer de compte.

---

## Résumé des commandes

| Action              | Commande                          |
|---------------------|-----------------------------------|
| Créer la base + seed| `python -m backend.db.setup_db`   |
| Lancer l'API        | `python -m backend.app`           |
| Ouvrir le site      | Ouvrir `frontend/index.html`      |

Voir aussi `backend/tests_smoke/demo_scenarios.md` pour des scénarios de test détaillés et `docs/api_contract.md` pour l'API.
