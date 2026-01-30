rawconnect/
├── README.md
├── requirements.txt
├── .env.example
├── docs/
│   ├── pitch_outline.md
│   ├── ussd_flow.md
│   ├── api_contract.md
│   └── scoring_rules.md
├── backend/
│   ├── app.py                  # point d’entrée Flask (create_app, register blueprints)
│   ├── config.py               # config (DEV, DB_PATH, SECRET, etc.)
│   ├── extensions.py           # CORS, db, helpers partagés
│   ├── db/
│   │   ├── schema.sql          # création des tables
│   │   ├── seed.py             # données de démo (users, tx, loans)
│   │   └── connection.py       # connexion SQL + helpers
│   ├── models/                 # “modèles” (simples dict/dataclass) + accès DB
│   │   ├── user_model.py
│   │   ├── account_model.py
│   │   ├── transaction_model.py
│   │   ├── score_model.py
│   │   └── loan_model.py
│   ├── services/               # logique métier (orchestration)
│   │   ├── user_service.py     # register, lookup
│   │   ├── account_service.py  # balance, deposit, payment
│   │   ├── scoring_service.py  # calc + persist score
│   │   └── loan_service.py     # eligibility, propose, accept, repay
│   ├── scoring/
│   │   ├── engine.py           # compute_score(user_id) -> 0..100
│   │   ├── rules.py            # poids + normalisation + seuils
│   │   └── features.py         # métriques: régularité, épargne, ancienneté, etc.
│   ├── api/                    # routes HTTP (contrat API)
│   │   ├── routes_users.py     # POST /api/register, GET /api/user/:phone
│   │   ├── routes_accounts.py  # GET /api/balance/:phone, POST /api/deposit
│   │   ├── routes_scores.py    # GET /api/score/:phone
│   │   └── routes_loans.py     # POST /api/loan/request, /accept, /repay
│   ├── utils/
│   │   ├── validators.py       # validation phone, amount
│   │   ├── time.py             # helpers dates
│   │   └── errors.py           # format d’erreur JSON uniforme
│   └── tests_smoke/            # tests rapides “smoke” (optionnel)
│       └── demo_scenarios.md
├── frontend/
│   ├── index.html              # écran “téléphone” + zone d’affichage USSD
│   ├── assets/
│   │   └── logo.png
│   ├── css/
│   │   └── ussd.css            # style téléphone/écran
│   └── js/
│       ├── app.js              # bootstrap UI
│       ├── ussd_state.js       # machine à états (menus, inputs)
│       ├── api_client.js       # fetch() vers backend
│       ├── menus/
│       │   ├── menu_root.js
│       │   ├── menu_register.js
│       │   ├── menu_balance.js
│       │   ├── menu_savings.js
│       │   ├── menu_loan.js
│       │   └── menu_help_lang.js
│       └── i18n/
│           ├── fr.js
│           └── lingala.js      # optionnel (ou placeholder)
└── data/
    └── exports/                # exports CSV/JSON pour la démo (optionnel)
    # Base SQL : MySQL / PostgreSQL (config DB_* dans .env)