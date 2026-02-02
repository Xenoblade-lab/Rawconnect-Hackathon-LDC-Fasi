# Contrat API RAWCONNECT

Base URL : `http://localhost:5000` (ou configuré).

Réponses JSON : `{ "success": true, "data": {...} }` ou  
`{ "success": false, "error": { "code": "...", "message": "..." } }`.

---

## Utilisateurs

### POST /api/register

Créer un compte.

**Body :**
```json
{
  "phone": "0812345678",
  "name": "Marie K.",
  "activity_type": "marché",
  "pin": "1234"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "data": { "user_id": 1, "phone": "0812345678", "initial_score": 20 },
  "message": "Compte créé avec succès"
}
```

### GET /api/user/:phone

Retourner l’utilisateur par téléphone.

### POST /api/authenticate

Vérifier téléphone + PIN.

**Body :** `{ "phone": "0812345678", "pin": "1234" }`  
**Réponse :** `{ "success": true, "data": { "user": {...}, "account": {...} } }`

---

## Comptes

### GET /api/balance/:phone

Consulter le solde.

**Réponse :**
```json
{
  "success": true,
  "data": { "balance": 50000, "currency": "FC", "user": {...} }
}
```

### POST /api/deposit

Dépôt / épargne.

**Body :** `{ "phone": "0812345678", "amount": 10000 }`  
**Réponse :** `{ "success": true, "data": { "new_balance": 60000, "new_score": 45, "transaction": {...} }, "message": "Dépôt effectué" }`

### POST /api/withdraw

Retrait / paiement.

**Body :** `{ "phone": "0812345678", "amount": 5000 }`

---

## Score

### GET /api/score/:phone

Calculer et persister le score, puis le retourner.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "score": 65.5,
    "breakdown": {
      "regularity": 19.8,
      "savings": 12.5,
      "account_age": 13.3,
      "payment": 12,
      "activity_stability": 7
    },
    "user_id": 1
  }
}
```

---

## Microcrédit

### POST /api/loan/request

Éligibilité / proposition.

**Body :** `{ "phone": "0812345678" }`  
**Réponse :**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "score": 65.5,
    "max_amount": 50000,
    "interest_rate": 0.07,
    "duration_days": 60,
    "breakdown": {...}
  }
}
```

### POST /api/loan/accept

Accepter un microcrédit.

**Body :** `{ "phone": "0812345678", "amount": 25000 }`  
**Réponse (201) :** `{ "success": true, "data": { "loan": {...}, "new_balance": ..., "total_repayment": ..., "due_date": "...", "duration_days": 30 }, "message": "Crédit accordé" }`

### POST /api/loan/repay

Rembourser (partiel ou total).

**Body :** `{ "phone": "0812345678", "amount": 5000 }`  
**Réponse :** `{ "success": true, "data": { "remaining": 22500, "completed": false, "new_balance": ..., "new_score": null } }`  
Si crédit soldé : `completed: true`, `new_score` renseigné.
