# Connecter RAWCONNECT à GitHub

Ce guide permet de lier ce dossier au dépôt GitHub pour utiliser `git pull` et `git push` directement, sans copier les fichiers.

---

## Étape 0 : Nettoyer l'état actuel (si rebase/conflits)

Si `git status` affiche "rebase in progress" ou des conflits :

```powershell
cd "c:\laragon\www\Hackathon projet Rawconnect"

# 1. Essayer d'annuler le rebase
git rebase --abort
```

**Si vous voyez** `warning: could not read '.git/rebase-merge/head-name'` — l'état est corrompu. Supprimez manuellement le dossier :

```powershell
# Fermez Cursor/VS Code d'abord (pour libérer les fichiers)
Remove-Item -Recurse -Force ".git\rebase-merge"
```

Puis relancez `git status`. Si l'accès est refusé, exécutez PowerShell **en tant qu'administrateur** (clic droit → Exécuter en tant qu'administrateur).

### Fichier index.lock bloque tout

Si `git add`, `git checkout` ou `git commit` affichent : *"Unable to create '.git/index.lock': File exists"* :

```powershell
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
```

Ou exécutez `.\scripts\fix_rebase.ps1` qui supprime aussi ce fichier.

---

## Étape 1 : Ajouter le remote GitHub

Remplacez `VOTRE_UTILISATEUR` et `VOTRE_REPO` par les vôtres (ex. `Rawbank/Rawconnect-Hackathon`).

```powershell
# Ajouter l'origine (URL HTTPS)
git remote add origin https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git

# Vérifier
git remote -v
```

**Alternative SSH** (si vous avez une clé configurée) :
```powershell
git remote add origin git@github.com:VOTRE_UTILISATEUR/VOTRE_REPO.git
```

---

## Étape 2 : Récupérer et lier à la branche distante

```powershell
# Récupérer les branches du dépôt distant
git fetch origin

# Si votre branche s'appelle "main" sur GitHub :
git branch -M main
git branch --set-upstream-to=origin/main main

# Ou si c'est "master" :
git branch -M master
git branch --set-upstream-to=origin/master master
```

---

## Étape 3 : Utilisation quotidienne

| Action | Commande |
|--------|----------|
| Récupérer les changements | `git pull` |
| Envoyer vos commits | `git push` |
| Voir l'état | `git status` |

---

## Dépôt GitHub inexistant ?

1. Allez sur [github.com](https://github.com) → **New repository**
2. Nommez-le (ex. `Rawconnect-Hackathon`)
3. **Ne cochez pas** "Initialize with README" si ce dossier a déjà du code
4. Copiez l’URL (ex. `https://github.com/VotreUser/Rawconnect-Hackathon.git`)
5. Exécutez :

```powershell
git remote add origin https://github.com/VotreUser/Rawconnect-Hackathon.git
git push -u origin main
```

---

## Dépôt déjà existant avec du code ?

Si le dépôt GitHub contient déjà des fichiers (README, etc.) :

```powershell
git fetch origin
git merge origin/main --allow-unrelated-histories
# Résolvez les conflits si nécessaire, puis :
git push -u origin main
```

---

## Script rapide

Exécutez `.\scripts\connect_github.ps1` après avoir édité l’URL du dépôt dans le script.
