# Scénarios de démo RAWCONNECT

À exécuter manuellement (simulateur USSD + backend).

---

## Prérequis

1. Backend Flask : `python -m backend.app` (port 5000).
2. Base SQL créée : ex. `mysql rawconnect < backend/db/schema.sql`.
3. Données de démo : `python -m backend.db.seed`.
4. Frontend : ouvrir `frontend/index.html` (ou servir le dossier), lancer le simulateur.

---

## Compte démo (seed)

- **Téléphone** : `0812345678`
- **PIN** : `1234`
- **Utilisateur** : Maman Marie (marché), solde 15 000 FC, score 72, 1 crédit actif (reste 8 000 FC).

---

## Scénario 1 : Nouvel utilisateur (*444# → 1)

1. Composer **\*444#** → Menu principal.
2. Choisir **1** (Créer un compte).
3. Saisir **nom** (ex. Jean K.).
4. Saisir **téléphone** (ex. 0991234567) — pas encore utilisé.
5. Saisir **PIN** (ex. 1234).
6. Confirmer **PIN** (1234).
7. Vérifier le message de succès et le retour au menu principal.

---

## Scénario 2 : Consulter solde (*444# → 2)

1. Composer **\*444#**.
2. Choisir **2** (Consulter solde).
3. Saisir **0812345678**.
4. Saisir **PIN** 1234.
5. Vérifier affichage **solde** (15 000 FC) et **score** (72).

---

## Scénario 3 : Épargner (*444# → 3)

1. Composer **\*444#**.
2. Choisir **3** (Épargner).
3. Saisir **0812345678** puis **PIN** 1234.
4. Menu Épargne : **1** (Déposer).
5. Saisir **montant** (ex. 5000).
6. Vérifier message de succès et nouveau solde.

---

## Scénario 4 : Microcrédit (*444# → 4)

1. Composer **\*444#**.
2. Choisir **4** (Demander crédit).
3. Saisir **0812345678** puis **PIN** 1234.
4. **1** (Voir éligibilité) → score + montant max.
5. **2** (Demander un prêt) → saisir un montant ≤ max (ex. 20000).
6. Vérifier succès, montant à rembourser, nouveau solde.
7. **3** (Rembourser) → saisir montant (ex. 5000) → vérifier "Reste à payer" ou "Crédit soldé".

---

## Scénario 5 : Aide / Langue (*444# → 5)

1. Composer **\*444#**.
2. Choisir **5** (Aide / Langue).
3. Naviguer (Comment ça marche, Support, Langue) et revenir avec **0**.

---

## Annulation

- Saisir **0** pour revenir au menu précédent.
- Saisir **#** ou **Annuler** pour quitter la session USSD (écran d’accueil).

---

## Vérifications API (optionnel)

- `GET /api/balance/0812345678` → solde.
- `GET /api/score/0812345678` → score + breakdown.
- `POST /api/deposit` `{ "phone": "0812345678", "amount": 1000 }` → nouveau solde + score.
- `POST /api/loan/request` `{ "phone": "0812345678" }` → eligible, max_amount, etc.
