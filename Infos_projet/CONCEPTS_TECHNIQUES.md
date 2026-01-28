# 🔧 CONCEPTS TECHNIQUES - RAWCONNECT

## 📐 ARCHITECTURE DÉTAILLÉE

### Flux de données global

```
┌─────────────────┐
│  Interface USSD │  (Simulation Web)
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Flask API      │  (Backend)
│  - Routes       │
│  - Validation   │
│  - Logique      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ SQLite  │ │ Scoring      │
│ Database│ │ Engine       │
└─────────┘ └──────────────┘
```

---

## 🗄️ MODÈLE DE DONNÉES

### Schéma de base de données

```sql
-- Table: users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    activity_type TEXT,  -- 'marché', 'étudiant', 'agriculture', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: accounts
CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    balance REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: transactions
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL,  -- 'deposit', 'withdrawal', 'payment', 'loan'
    amount REAL NOT NULL,
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Table: scores
CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score REAL NOT NULL,  -- 0-100
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: loans
CREATE TABLE loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    interest_rate REAL DEFAULT 0.05,  -- 5%
    status TEXT DEFAULT 'pending',  -- 'pending', 'active', 'paid', 'defaulted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: loan_repayments
CREATE TABLE loan_repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);
```

---

## 🧮 ALGORITHME DE SCORING DÉTAILLÉ

### Formule de calcul du score

```
Score Total = Σ (Critère × Poids)

Où:
- Score Total ∈ [0, 100]
- Chaque critère est normalisé sur [0, 100]
- Les poids somment à 100%
```

### Détail des critères

#### 1. Régularité des transactions (30%)

**Calcul :**
```
Régularité = (Nombre de transactions / Période) × Coefficient

Exemple:
- 10 transactions sur 30 jours = 0.33 trans/jour
- Normalisé sur 100: min(100, (0.33 / 0.5) × 100) = 66 points
- Poids: 66 × 0.30 = 19.8 points
```

**Logique :**
- Plus de transactions = meilleur score
- Seuil optimal : 1 transaction/jour = 100 points

#### 2. Épargne (25%)

**Calcul :**
```
Épargne = (Montant total épargné / Seuil de référence) × 100

Exemple:
- 50,000 FC épargnés
- Seuil de référence: 100,000 FC
- Score: min(100, (50,000 / 100,000) × 100) = 50 points
- Poids: 50 × 0.25 = 12.5 points
```

**Logique :**
- Plus d'épargne = meilleur score
- Seuil de référence ajustable selon contexte

#### 3. Ancienneté du compte (20%)

**Calcul :**
```
Ancienneté = (Jours depuis création / Seuil de référence) × 100

Exemple:
- Compte créé il y a 60 jours
- Seuil de référence: 90 jours
- Score: min(100, (60 / 90) × 100) = 66.7 points
- Poids: 66.7 × 0.20 = 13.3 points
```

**Logique :**
- Plus ancien = plus fiable
- Seuil optimal : 90 jours = 100 points

#### 4. Paiement régulier (15%)

**Calcul :**
```
Paiement = (Remboursements à temps / Total remboursements) × 100

Exemple:
- 8 remboursements à temps sur 10
- Score: (8 / 10) × 100 = 80 points
- Poids: 80 × 0.15 = 12 points
```

**Logique :**
- Historique de crédit positif = meilleur score
- Si pas de crédit précédent: score neutre (50 points)

#### 5. Activité stable (10%)

**Calcul :**
```
Stabilité = (Variation faible des montants) × 100

Exemple:
- Écart-type des montants faible = activité régulière
- Score: 70 points (activité stable)
- Poids: 70 × 0.10 = 7 points
```

**Logique :**
- Montants réguliers = activité stable = meilleur score

---

## 💰 LOGIQUE DE MICROCRÉDIT

### Montant proposé selon le score

```
Score 0-30   → Pas de crédit proposé
Score 31-50  → Crédit jusqu'à 10,000 FC
Score 51-70  → Crédit jusqu'à 50,000 FC
Score 71-85  → Crédit jusqu'à 100,000 FC
Score 86-100 → Crédit jusqu'à 200,000 FC
```

### Taux d'intérêt (optionnel)

```
Score 86-100 → 3% par mois
Score 71-85  → 5% par mois
Score 51-70  → 7% par mois
Score 31-50  → 10% par mois
```

### Durée de remboursement

```
Montant < 50,000 FC  → 30 jours
Montant 50,000-100,000 → 60 jours
Montant > 100,000 FC → 90 jours
```

---

## 🔄 FLUX UTILISATEUR COMPLET

### Scénario 1 : Nouvel utilisateur

```
1. Utilisateur compose *444#
   ↓
2. Menu principal s'affiche
   ↓
3. Sélectionne "1. Créer un compte"
   ↓
4. Saisit son numéro de téléphone
   ↓
5. Saisit son nom/pseudo
   ↓
6. Sélectionne son type d'activité
   ↓
7. Confirmation → Compte créé
   ↓
8. Score initial = 20 (nouveau compte)
```

### Scénario 2 : Épargne régulière

```
1. Utilisateur compose *444#
   ↓
2. Menu principal
   ↓
3. Sélectionne "3. Épargner"
   ↓
4. Saisit le montant
   ↓
5. Confirmation
   ↓
6. Transaction enregistrée
   ↓
7. Score recalculé automatiquement
   (Épargne +25%, Régularité +30%)
```

### Scénario 3 : Demande de microcrédit

```
1. Utilisateur compose *444#
   ↓
2. Menu principal
   ↓
3. Sélectionne "4. Demander microcrédit"
   ↓
4. Système calcule le score actuel
   ↓
5. Si score ≥ 31:
   - Affiche le montant proposé
   - Affiche les conditions
   ↓
6. Utilisateur accepte ou refuse
   ↓
7. Si accepté:
   - Crédit accordé
   - Montant ajouté au compte
   - Date de remboursement fixée
```

---

## 🎨 INTERFACE USSD - STRUCTURE

### Menu principal (*444#)

```
┌─────────────────────────────┐
│     RAWCONNECT              │
│   *444# - Menu Principal    │
├─────────────────────────────┤
│                             │
│  1. Créer un compte         │
│  2. Consulter solde         │
│  3. Épargner                │
│  4. Demander microcrédit    │
│  5. Aide / Langue           │
│                             │
│  Tapez le numéro            │
└─────────────────────────────┘
```

### Sous-menus

**Menu 1 - Créer un compte:**
```
→ Saisie numéro téléphone
→ Saisie nom
→ Sélection type activité
→ Confirmation
```

**Menu 2 - Consulter solde:**
```
→ Affichage solde actuel
→ Retour menu principal
```

**Menu 3 - Épargner:**
```
→ Saisie montant
→ Confirmation
→ Message de succès
```

**Menu 4 - Microcrédit:**
```
→ Calcul score (si nécessaire)
→ Affichage proposition
→ Acceptation/Refus
→ Si accepté: confirmation
```

---

## 🔌 API ENDPOINTS - SPÉCIFICATION

### POST /api/register
**Créer un nouveau compte**

Request:
```json
{
  "phone": "243900000000",
  "name": "Marie K.",
  "activity_type": "marché"
}
```

Response:
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "user_id": 1,
  "initial_score": 20
}
```

### GET /api/balance/:phone
**Consulter le solde**

Response:
```json
{
  "success": true,
  "balance": 50000.0,
  "currency": "FC"
}
```

### POST /api/deposit
**Effectuer un dépôt/épargne**

Request:
```json
{
  "phone": "243900000000",
  "amount": 10000.0
}
```

Response:
```json
{
  "success": true,
  "message": "Dépôt effectué",
  "new_balance": 60000.0,
  "new_score": 45.5
}
```

### GET /api/score/:phone
**Obtenir le score actuel**

Response:
```json
{
  "success": true,
  "score": 65.5,
  "breakdown": {
    "regularity": 19.8,
    "savings": 12.5,
    "account_age": 13.3,
    "payment_history": 12.0,
    "activity_stability": 7.0
  }
}
```

### POST /api/loan/request
**Demander un microcrédit**

Request:
```json
{
  "phone": "243900000000"
}
```

Response:
```json
{
  "success": true,
  "eligible": true,
  "proposed_amount": 50000.0,
  "interest_rate": 0.05,
  "duration_days": 60,
  "score": 65.5
}
```

### POST /api/loan/accept
**Accepter un microcrédit**

Request:
```json
{
  "phone": "243900000000",
  "loan_id": 1
}
```

### POST /api/loan/repay
**Rembourser un crédit**

Request:
```json
{
  "phone": "243900000000",
  "loan_id": 1,
  "amount": 25000.0
}
```

---

## 📊 DONNÉES DE TEST RECOMMANDÉES

### Utilisateurs de démonstration

```
1. Marie K. (Vendeuse marché)
   - Phone: 243900000001
   - Activité: marché
   - Compte: 60 jours
   - Solde: 50,000 FC
   - Score: 65

2. Jean M. (Étudiant)
   - Phone: 243900000002
   - Activité: étudiant
   - Compte: 30 jours
   - Solde: 20,000 FC
   - Score: 45

3. Paul A. (Agriculteur)
   - Phone: 243900000003
   - Activité: agriculture
   - Compte: 90 jours
   - Solde: 150,000 FC
   - Score: 85
```

### Transactions simulées

Pour chaque utilisateur, créer:
- 10-15 transactions de dépôt
- 5-8 transactions de paiement
- 1-2 crédits (si score suffisant)
- Remboursements variés

---

## ⚙️ CONFIGURATION RECOMMANDÉE

### Fichier requirements.txt
```
Flask==2.3.0
pandas==2.0.0
numpy==1.24.0
```

### Structure Flask de base

```python
# app.py structure
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Pour permettre les appels depuis le frontend

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    # Logique d'enregistrement
    pass

@app.route('/api/balance/<phone>', methods=['GET'])
def get_balance(phone):
    # Logique de consultation
    pass

# ... autres routes

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## 🎯 POINTS D'ATTENTION TECHNIQUES

### 1. Validation des données
- Vérifier le format des numéros de téléphone
- Valider les montants (positifs, limites)
- Gérer les erreurs gracieusement

### 2. Calcul du score
- Recalculer après chaque transaction importante
- Mettre en cache le score (éviter recalculs inutiles)
- Logger les calculs pour debug

### 3. Gestion des erreurs
- Messages d'erreur clairs en français
- Codes HTTP appropriés (200, 400, 404, 500)
- Logs pour debugging

### 4. Performance
- Indexer les colonnes fréquemment utilisées (phone, user_id)
- Limiter les requêtes à la base de données
- Optimiser les calculs de score

---

## 🔐 SÉCURITÉ (Basique pour prototype)

### Points à considérer
- Validation côté serveur (jamais faire confiance au frontend)
- Sanitisation des inputs
- Protection contre injection SQL (utiliser ORM ou requêtes préparées)
- Limitation des montants (max/min)

### Pour production (après hackathon)
- Authentification (tokens, OTP)
- Chiffrement des données sensibles
- Audit logs
- Rate limiting

---

## 📈 MÉTRIQUES À TRACKER (Optionnel)

Pour la démo, vous pouvez afficher:
- Nombre d'utilisateurs inscrits
- Montant total épargné
- Nombre de crédits accordés
- Score moyen des utilisateurs
- Taux de remboursement

---

**Ces concepts techniques vous donneront une base solide pour l'implémentation !**
