# Règles de scoring RAWCONNECT

Score global **0–100**, somme pondérée de 5 critères.

---

## Poids

| Critère | Poids |
|--------|-------|
| Régularité des transactions | 30 % |
| Épargne | 25 % |
| Ancienneté du compte | 20 % |
| Paiement régulier (remboursements) | 15 % |
| Activité stable | 10 % |

Chaque critère est normalisé sur **0–100** avant pondération.

---

## Détail des critères

### 1. Régularité (30 %)

- **Métrique** : nombre de transactions / période (ex. 90 jours).
- **Référence** : 1 transaction / jour → 100 points.
- Plus il y a de transactions, plus le score augmente.

### 2. Épargne (25 %)

- **Métrique** : montant total épargné (dépôts) / seuil de référence.
- **Référence** : 100 000 FC → 100 points.
- `min(100, (total_épargné / 100_000) × 100)`.

### 3. Ancienneté (20 %)

- **Métrique** : jours depuis création du compte / 90 jours.
- **Référence** : 90 jours → 100 points.
- `min(100, (jours / 90) × 100)`.

### 4. Paiement régulier (15 %)

- **Métrique** : part des crédits intégralement remboursés.
- Si aucun crédit : score neutre **50**.
- Sinon : `(crédits soldés / total crédits) × 100`.

### 5. Activité stable (10 %)

- **Métrique** : inverse du coefficient de variation des montants des transactions.
- Variation faible des montants → score élevé.
- `100 / (1 + CV)` avec CV = écart-type / moyenne.

---

## Seuils microcrédit (montant max proposé)

| Score | Montant max (FC) | Taux mensuel |
|-------|------------------|--------------|
| 0–30 | 0 | — |
| 31–50 | 10 000 | 10 % |
| 51–70 | 50 000 | 7 % |
| 71–85 | 100 000 | 5 % |
| 86–100 | 200 000 | 3 % |

---

## Durée de remboursement

- Montant &lt; 50 000 FC → **30 jours**
- 50 000–100 000 FC → **60 jours**
- &gt; 100 000 FC → **90 jours**

---

## Implémentation

- **`backend/scoring/rules.py`** : poids, seuils, `normalize()`.
- **`backend/scoring/features.py`** : calcul de chaque critère (0–100).
- **`backend/scoring/engine.py`** : `compute_score(user_id)` → `(score, breakdown)`.
- **`backend/services/scoring_service.py`** : `get_or_compute(phone)`, `recompute_and_persist(user_id)`.
