# 📋 GUIDE MÉTHODOLOGIQUE - RAWCONNECT
## Hackathon UPC-FASI | 30-31 Janvier 2026

---

## 🎯 VISION GLOBALE

**Objectif** : Créer un prototype fonctionnel de plateforme bancaire inclusive utilisant USSD et un système de scoring alternatif pour le microcrédit.

**Contrainte** : 48 heures pour un prototype démo-ready

---

## 📅 PLANNING DÉTAILLÉ (48H)

### 🔵 JOUR 1 - CONCEPTION & ARCHITECTURE (24H)

#### **Matin (0-6h) : Setup & Architecture**

**1. Setup de l'environnement (1h)**
- [ ] Créer la structure de projet
- [ ] Installer les dépendances (Python, Flask, SQL)
- [ ] Configurer Git (si nécessaire)
- [ ] Créer les dossiers : `backend/`, `frontend/`, `database/`, `scoring/`

**Structure recommandée :**
```
rawconnect/
├── backend/
│   ├── app.py (Flask API)
│   ├── models.py (Modèles de données)
│   ├── routes.py (Endpoints API)
│   └── config.py
├── frontend/
│   ├── index.html (Simulation USSD)
│   ├── css/
│   ├── js/
│   └── assets/
├── scoring/
│   ├── scoring_engine.py (Moteur de scoring)
│   └── rules.py (Règles de calcul)
├── database/
│   └── init_db.py (Initialisation SQLite)
└── requirements.txt
```

**2. Conception de la base de données (1h)**
- [ ] Modéliser les tables :
  - `users` (id, phone, name, activity_type, created_at)
  - `accounts` (id, user_id, balance, created_at)
  - `transactions` (id, account_id, type, amount, date)
  - `scores` (id, user_id, score, last_updated)
  - `loans` (id, user_id, amount, status, due_date)
  - `loan_repayments` (id, loan_id, amount, date)

**3. Design des menus USSD (2h)**
- [ ] Créer le flow complet des menus
- [ ] Documenter chaque navigation
- [ ] Prévoir les cas d'erreur

**Exemple de flow :**
```
*444# → Menu principal
  1 → Créer compte → Saisie nom → Saisie activité → Confirmation
  2 → Consulter solde → Affichage solde
  3 → Épargner → Saisie montant → Confirmation
  4 → Microcrédit → Vérification score → Proposition → Acceptation/Refus
  5 → Aide/Langue → Options
```

**4. Conception du système de scoring (2h)**
- [ ] Définir les formules exactes pour chaque critère
- [ ] Créer des fonctions de calcul pour :
  - Régularité des transactions (30%)
  - Épargne (25%)
  - Ancienneté (20%)
  - Paiement régulier (15%)
  - Activité stable (10%)
- [ ] Prévoir des données de test/simulation

---

#### **Après-midi (6-12h) : Développement Backend**

**5. Backend Flask - Base (3h)**
- [ ] Créer `app.py` avec Flask
- [ ] Configurer les routes de base
- [ ] Implémenter la connexion SQLite
- [ ] Créer les modèles de données

**Endpoints essentiels :**
```
POST /api/register          # Créer un compte
GET  /api/balance/:phone    # Consulter solde
POST /api/deposit           # Épargner
POST /api/loan/request      # Demander crédit
GET  /api/score/:phone      # Obtenir le score
POST /api/loan/repay        # Rembourser
```

**6. Système de scoring (3h)**
- [ ] Implémenter `scoring_engine.py`
- [ ] Créer les fonctions de calcul pour chaque critère
- [ ] Tester avec des données simulées
- [ ] Ajuster les poids si nécessaire

**Exemple de logique :**
```python
def calculate_score(user_id):
    # Régularité (30%)
    regularity = check_transaction_frequency(user_id) * 0.30
    
    # Épargne (25%)
    savings = check_savings_amount(user_id) * 0.25
    
    # Ancienneté (20%)
    account_age = check_account_age(user_id) * 0.20
    
    # Paiement (15%)
    payment_history = check_payment_history(user_id) * 0.15
    
    # Activité (10%)
    activity_stability = check_activity_stability(user_id) * 0.10
    
    total_score = regularity + savings + account_age + payment_history + activity_stability
    return min(100, max(0, total_score))
```

---

#### **Soir (12-18h) : Frontend USSD**

**7. Interface USSD Web (4h)**
- [ ] Créer `index.html` avec Bootstrap
- [ ] Simuler l'interface USSD (menus numériques)
- [ ] Implémenter la navigation entre menus
- [ ] Ajouter les formulaires (création compte, épargne, etc.)

**Design recommandé :**
- Interface simple, type téléphone basique
- Menus numérotés clairs
- Navigation par touches numériques
- Messages d'erreur/succès visibles

**8. Intégration Frontend-Backend (2h)**
- [ ] Connecter le frontend aux API Flask
- [ ] Gérer les appels AJAX/Fetch
- [ ] Tester les flux complets

---

### 🟢 JOUR 2 - FINALISATION & DÉMO (24H)

#### **Matin (18-24h) : Fonctionnalités avancées**

**9. Microcrédit intelligent (3h)**
- [ ] Logique de proposition automatique
- [ ] Calcul du montant selon le score
- [ ] Système d'acceptation/refus
- [ ] Conditions de remboursement

**10. Historique et rapports (2h)**
- [ ] Historique des transactions
- [ ] Historique des crédits
- [ ] Affichage du score actuel

**11. Données de démonstration (1h)**
- [ ] Créer des utilisateurs de test
- [ ] Simuler des transactions
- [ ] Générer des scores variés
- [ ] Préparer un scénario de démo

---

#### **Après-midi (24-30h) : Tests & Optimisation**

**12. Tests complets (2h)**
- [ ] Tester tous les flux utilisateur
- [ ] Vérifier le calcul des scores
- [ ] Tester les cas limites
- [ ] Corriger les bugs

**13. Amélioration UX (2h)**
- [ ] Messages d'erreur clairs
- [ ] Feedback visuel
- [ ] Optimisation mobile
- [ ] Ajout de confirmations

**14. Documentation technique (1h)**
- [ ] Commenter le code
- [ ] Documenter l'API
- [ ] Créer un README

---

#### **Soir (30-36h) : Préparation Pitch**

**15. Slides de présentation (3h)**
- [ ] Problématique
- [ ] Solution RAWCONNECT
- [ ] Démonstration
- [ ] Impact social
- [ ] Roadmap future

**16. Démo préparée (2h)**
- [ ] Scénario de démo clair
- [ ] Données de test prêtes
- [ ] Navigation fluide
- [ ] Points clés à montrer

**17. Répétition (1h)**
- [ ] Répéter le pitch
- [ ] Chronométrer la présentation
- [ ] Préparer les réponses aux questions

---

## 👥 RÉPARTITION DES TÂCHES DÉTAILLÉE

### **Chef d'équipe**
- ✅ Coordination globale
- ✅ Gestion du temps
- ✅ Préparation du pitch
- ✅ Support aux autres membres

### **Backend Developer**
- ✅ API Flask complète
- ✅ Modèles de données
- ✅ Logique métier
- ✅ Intégration base de données

### **Data/Scoring Developer**
- ✅ Moteur de scoring
- ✅ Algorithmes de calcul
- ✅ Données de test
- ✅ Validation des scores

### **Frontend Developer**
- ✅ Interface USSD simulée
- ✅ Design responsive
- ✅ Intégration API
- ✅ UX/UI

### **Business/UX**
- ✅ Slides de présentation
- ✅ Scénarios utilisateur
- ✅ Impact social
- ✅ Documentation projet

---

## 🔧 STACK TECHNIQUE RECOMMANDÉE

### Backend
```python
Flask==2.3.0
SQLite3 (intégré Python)
pandas==2.0.0
numpy==1.24.0
```

### Frontend
```html
Bootstrap 5
Vanilla JavaScript
HTML5/CSS3
```

### Base de données
```
SQLite (simple, pas de serveur requis)
```

---

## 📊 PRIORISATION DES FONCTIONNALITÉS

### **MVP (Minimum Viable Product) - Priorité 1**
1. ✅ Création de compte
2. ✅ Consultation solde
3. ✅ Épargne/dépôt
4. ✅ Calcul de score basique
5. ✅ Demande de microcrédit

### **Fonctionnalités importantes - Priorité 2**
6. ✅ Historique transactions
7. ✅ Remboursement crédit
8. ✅ Mise à jour dynamique du score
9. ✅ Interface USSD complète

### **Nice to have - Priorité 3**
10. ⚠️ Multi-langue
11. ⚠️ Notifications
12. ⚠️ Graphiques de score
13. ⚠️ Export de données

---

## 🎯 POINTS CLÉS POUR LE JURY

### **1. Simplicité**
- Interface intuitive même pour non-bancarisés
- Pas besoin de smartphone
- Navigation simple

### **2. Innovation**
- Scoring alternatif basé sur comportement réel
- Pas de garanties classiques
- Adaptation au contexte congolais

### **3. Impact social**
- Inclusion financière réelle
- Autonomie économique
- Réduction de l'exclusion

### **4. Faisabilité technique**
- Technologies accessibles
- Architecture scalable
- Prototype fonctionnel

---

## ⚠️ RISQUES & MITIGATION

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Temps insuffisant | Élevé | Prioriser MVP, fonctionnalités essentielles |
| Bugs critiques | Moyen | Tests continus, code simple |
| Scoring imprécis | Moyen | Utiliser données simulées, ajuster poids |
| Démo qui plante | Élevé | Données de test préparées, backup |

---

## 📝 CHECKLIST FINALE (avant pitch)

### Technique
- [ ] Application fonctionne sans erreur
- [ ] Tous les menus USSD accessibles
- [ ] Scoring calculé correctement
- [ ] Base de données avec données de test
- [ ] Code commenté et propre

### Présentation
- [ ] Slides prêtes
- [ ] Démo préparée et testée
- [ ] Scénario utilisateur clair
- [ ] Impact social bien expliqué
- [ ] Pitch chronométré (5-10 min)

### Équipe
- [ ] Chacun connaît sa partie
- [ ] Questions/réponses préparées
- [ ] Support technique disponible
- [ ] Confiance et cohésion

---

## 🚀 CONSEILS POUR LE HACKATHON

1. **Dormez !** 48h sans sommeil = mauvaise performance
2. **Priorisez** : MVP d'abord, perfection après
3. **Testez tôt** : Ne pas attendre la fin pour tester
4. **Communiquez** : Stand-ups réguliers dans l'équipe
5. **Documentez** : Prenez des notes, commentez le code
6. **Restez simple** : Complexité = bugs = perte de temps
7. **Préparez la démo** : Un bug en démo = catastrophe

---

## 💡 INNOVATION À METTRE EN AVANT

1. **Scoring comportemental** : Pas de papier, pas de garantie physique
2. **Accessibilité USSD** : Fonctionne sur tous les téléphones
3. **Adaptation locale** : Conçu pour le contexte congolais
4. **Inclusion réelle** : Vraie solution pour non-bancarisés
5. **Scalabilité** : Architecture qui peut grandir

---

## 📞 STRUCTURE DU PITCH (5-7 minutes)

1. **Hook** (30s) : Problématique choc
2. **Solution** (1min) : RAWCONNECT en 3 points
3. **Démo** (2-3min) : Scénario utilisateur complet
4. **Impact** (1min) : Social + Business
5. **Roadmap** (30s) : Évolution future
6. **Q&A** (2-3min) : Réponses préparées

---

**BONNE CHANCE POUR LE HACKATHON ! 🚀**

*RAWCONNECT : La banque qui s'adapte enfin à la réalité du Congolais.*
