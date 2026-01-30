# RAWCONNECT — Étapes d’implémentation

Ordre recommandé pour avancer **étape par étape**, selon la structure du projet.

---

## Phase 1 — Base (config, SQL, utils)

| Étape | Fichiers / zone | Pourquoi en premier ? |
|-------|------------------|------------------------|
| **1** | `config.py`, `.env.example`, `extensions.py` | Tout le reste en dépend (DB, CORS). |
| **2** | `db/schema.sql` → `db/connection.py` | Définir les tables puis la connexion SQL. |
| **3** | `db/seed.py` | Données de démo pour tester sans le frontend. |
| **4** | `utils/validators.py`, `utils/errors.py`, `utils/time.py` | Utilisés partout (API, services, scoring). |

---

## Phase 2 — Couche données (models)

| Étape | Fichiers | Pourquoi cet ordre ? |
|-------|----------|----------------------|
| **5** | `models/user_model.py` | Users en premier (comptes liés aux users). |
| **6** | `models/account_model.py` | Comptes liés aux users. |
| **7** | `models/transaction_model.py` | Transactions liées aux comptes. |
| **8** | `models/score_model.py` | Scores liés aux users. |
| **9** | `models/loan_model.py` | Crédits liés aux users (+ remboursements si table dédiée). |

---

## Phase 3 — Scoring

| Étape | Fichiers | Pourquoi ? |
|-------|----------|------------|
| **10** | `scoring/rules.py` | Poids, seuils, normalisation. |
| **11** | `scoring/features.py` | Métriques (régularité, épargne, ancienneté, etc.). |
| **12** | `scoring/engine.py` | `compute_score(user_id)` qui utilise rules + features. |

---

## Phase 4 — Logique métier (services)

| Étape | Fichiers | Pourquoi ? |
|-------|----------|------------|
| **13** | `services/user_service.py` | Inscription, lookup → s’appuie sur `user_model`. |
| **14** | `services/account_service.py` | Solde, dépôt, paiement → `account` + `transaction`. |
| **15** | `services/scoring_service.py` | Calcul + persistance du score → `scoring` + `score_model`. |
| **16** | `services/loan_service.py` | Éligibilité, proposition, acceptation, remboursement → `loan_model` + `scoring_service`. |

---

## Phase 5 — API

| Étape | Fichiers | Pourquoi ? |
|-------|----------|------------|
| **17** | `api/routes_users.py` | POST /register, GET /user/:phone → `user_service`. |
| **18** | `api/routes_accounts.py` | GET /balance/:phone, POST /deposit → `account_service`. |
| **19** | `api/routes_scores.py` | GET /score/:phone → `scoring_service`. |
| **20** | `api/routes_loans.py` | POST /loan/request, /accept, /repay → `loan_service`. |
| **21** | `app.py` | `create_app`, enregistrement des blueprints, config, CORS. |

---

## Phase 6 — Intégration et fin

| Étape | Fichiers / zone | Pourquoi ? |
|-------|------------------|------------|
| **22** | Frontend `api_client.js` | Remplacer le mode démo par les vrais appels API. |
| **23** | `tests_smoke/demo_scenarios.md` + tests manuels | Vérifier les scénarios (*444# → 1, 2, 3, 4…). |
| **24** | `docs/api_contract.md`, `docs/scoring_rules.md` | Documenter ce qui est en place. |

---

## Synthèse

- **Commencer par :** config, SQL (schema + connection + seed), utils.
- **Enchaîner avec :** models (user → account → transaction → score → loan), puis scoring (rules → features → engine), puis services (user → account → scoring → loan), puis API (routes + `app.py`).
- **Finir par :** branchement du frontend, smoke tests, docs.
