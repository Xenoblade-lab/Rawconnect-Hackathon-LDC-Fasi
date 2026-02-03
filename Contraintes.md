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

pour la creation des comptes comment gerer ca par exemple

parce que pour les banques travaiile avec l'etat de sorte a avoir les documents des informations personnels de la personne qui va s'sinscrire en presentiel avec des signatures dans le sens et aussi par exemple sur illicocash pas besoin de beaucoup d'information juste les cartes de lecteurs identites 
le probleme c'est la verification des informations en Ussd comment faire je sais pas  si tu me comprends par exemple avec le mobile money n'a pas besoin obligatoirement de presentiel et signature juste les infos et matricule qui seront verifies


Je te comprends **parfaitement** 👍
Et ta question est **EXCELLENTE**, parce que c’est exactement ce que **le jury va te demander**.
Donc ce que tu poses là, c’est **le cœur du réalisme bancaire**.

Je vais t’expliquer **clairement**, **sans jargon inutile**, et **adapté à un hackathon**.

---

# 🔑 LE PROBLÈME RÉEL

> Comment créer un compte bancaire **via USSD** sans présence physique, sans signature, tout en restant crédible et sécurisé ?

👉 Spoiler : **ça existe déjà** (Mobile Money, banques digitales).
👉 Il faut juste **expliquer le bon modèle**.

---

# 🧠 LE PRINCIPE CLÉ À COMPRENDRE (IMPORTANT)

Il existe **PLUSIEURS NIVEAUX DE COMPTE**.

💡 **On ne crée PAS un compte bancaire classique via USSD**
👉 On crée un **COMPTE ALLÉGÉ (Tier 0 / Tier 1)**

C’est exactement ce que font :

* IllicoCash
* M-Pesa
* Orange Money
* Airtel Money

---

# 1️⃣ CONCEPT À UTILISER : KYC PROGRESSIF

### 🔐 KYC = *Know Your Customer*

👉 Au lieu de demander **tout au début**, on fait :

### ✔ KYC LÉGER → KYC COMPLET (progressif)

---

## 🟢 NIVEAU 1 — COMPTE USSD SIMPLIFIÉ (RAWCONNECT)

### 🎯 Objectif

* Inclusion financière rapide
* Zéro présentiel
* Zéro signature

### 📋 Infos demandées via USSD

```
1. Nom ou pseudo
2. Numéro de téléphone (automatique)
3. Date de naissance
4. Numéro de carte d’identité (optionnel)
5. Type d’activité (marché, étudiant, agriculture)
```

👉 **Le numéro de téléphone est la clé principale**

---

### 🔍 Vérification (COMMENT FAIRE ?)

#### 🔹 1. Vérification SIM (automatique)

* Numéro déjà enregistré chez un opérateur
* SIM active
* Ancienneté du numéro

📌 C’est EXACTEMENT ce que fait le mobile money

---

#### 🔹 2. Vérification du matricule (SIMULÉE AU HACKATHON)

* Numéro de carte d’identité
* Vérifié via :

  * base de données État (en théorie)
  * ou opérateur mobile

💬 Phrase clé à dire au jury :

> « En production, RAWCONNECT s’interfacerait avec les bases nationales via des API sécurisées. »

---

#### 🔹 3. OTP USSD (validation simple)

* Code envoyé par SMS ou USSD
* L’utilisateur confirme

---

### 📌 Résultat

➡️ **Compte actif mais limité**

---

## 🔒 LIMITES DU COMPTE USSD

Pour rester crédible juridiquement :

* Plafond de solde
* Montant de transaction limité
* Microcrédit limité

💬 Exemple à dire :

> « Tant que le KYC complet n’est pas fait, l’utilisateur reste sur un compte à plafond contrôlé. »

---

# 2️⃣ PASSAGE AU NIVEAU SUPÉRIEUR (KYC ÉVOLUTIF)

### 🟡 NIVEAU 2 — KYC ÉTENDU

* Présentiel en agence
* ou agent mobile Rawbank
* ou partenariat (mobile money)

Ajout :

* Signature
* Pièce d’identité scannée
* Adresse complète

👉 Débloque :

* Plafonds élevés
* Microcrédit plus important

---

# 3️⃣ COMMENT L’IMPLÉMENTER DANS VOTRE PROJET (HACKATHON)

## 🛠 Côté USSD – Création de compte

### Flow USSD réaliste :

```
Créer compte
→ Entrer nom
→ Entrer date de naissance
→ Choisir activité
→ Confirmer
→ Code OTP
→ Compte créé
```

---

## 🧠 Côté Backend (logique simple)

* Stocker :

  * numéro
  * statut KYC = "LIGHT"
  * score initial bas
* Associer les transactions au numéro

---

## 🧾 Base de données (exemple)

```json
{
  "phone": "243812345678",
  "name": "Maman Aline",
  "kyc_level": "LIGHT",
  "score": 35,
  "limit": 100
}
```

---

# 4️⃣ CE QUE TU DIS AU JURY (TRÈS IMPORTANT)

👉 S’ils demandent :

> « Comment vérifiez-vous l’identité via USSD ? »

### Réponse parfaite :

> « RAWCONNECT utilise un modèle de KYC progressif. Le premier niveau repose sur la vérification du numéro de téléphone via l’opérateur, complétée par un OTP. Les comptes créés via USSD sont volontairement limités. Le KYC complet se fait ultérieurement en agence ou via des partenaires agréés. »

💯 **C’est une réponse bancaire PRO.**

---

# 5️⃣ POURQUOI RAWCONNECT RESTE CRÉDIBLE

✔ Déjà utilisé par le mobile money
✔ Conforme à la réalité RDC
✔ Inclusif
✔ Sécurisé
✔ Adapté USSD

---

# 6️⃣ RÉSUMÉ SIMPLE (À RETENIR)

* ❌ Pas de compte bancaire complet via USSD
* ✅ Compte allégé avec limites
* ✅ Vérification par SIM + OTP
* ✅ KYC progressif
* ✅ Microcrédit proportionnel au niveau KYC

---

🔥 Si tu veux, prochaine étape :

* je te fais **le flow USSD écran par écran**
* ou **les réponses aux questions difficiles du jury**
* ou **le pseudo-code backend pour la création de compte**

Dis-moi 👌
