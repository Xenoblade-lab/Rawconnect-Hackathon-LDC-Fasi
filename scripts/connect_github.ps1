# RAWCONNECT — Connecter ce dossier au dépôt GitHub
# Usage : .\scripts\connect_github.ps1
# Modifiez $repoUrl ci-dessous avec votre URL GitHub

$ErrorActionPreference = "Stop"
$projectPath = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $projectPath

# ========== MODIFIEZ ICI ==========
$repoUrl = "https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git"
# Exemple : "https://github.com/Rawbank/Rawconnect-Hackathon.git"
# =================================

Write-Host "RAWCONNECT — Connexion GitHub" -ForegroundColor Cyan
Write-Host ""

# 1. Nettoyer rebase si bloqué
$rebaseHead = Join-Path $projectPath ".git\rebase-merge" -ErrorAction SilentlyContinue
if (Test-Path $rebaseHead) {
    Write-Host "Rebase en cours detecte. Annulation..." -ForegroundColor Yellow
    git rebase --abort 2>$null
    Write-Host "  OK" -ForegroundColor Green
}

# 2. Supprimer l'ancien remote "origin" s'il existe
$remotes = git remote 2>$null
if ($remotes -match "origin") {
    Write-Host "Suppression de l'ancien remote origin..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    Write-Host "  OK" -ForegroundColor Green
}

# 3. Ajouter le nouveau remote
Write-Host "Ajout du remote origin: $repoUrl" -ForegroundColor Yellow
git remote add origin $repoUrl
Write-Host "  OK" -ForegroundColor Green

# 4. Fetch
Write-Host "Recuperation des branches distantes (git fetch)..." -ForegroundColor Yellow
git fetch origin 2>$null
Write-Host "  OK" -ForegroundColor Green

# 5. Configurer le suivi (main ou master)
$branch = git branch --show-current 2>$null
if (-not $branch) { $branch = "main" }
Write-Host "Branche actuelle: $branch" -ForegroundColor Gray
$remoteBranch = "origin/$branch"
$check = git branch -r 2>$null
if ($check -notmatch "origin/$branch") {
    $remoteBranch = "origin/main"
    if ($check -match "origin/master") { $remoteBranch = "origin/master" }
}
git branch --set-upstream-to=$remoteBranch $branch 2>$null
Write-Host "Suivi configure: $branch -> $remoteBranch" -ForegroundColor Green

Write-Host ""
Write-Host "Termine. Vous pouvez maintenant utiliser:" -ForegroundColor Cyan
Write-Host "  git pull   # recuperer les changements" -ForegroundColor White
Write-Host "  git push   # envoyer vos commits" -ForegroundColor White
Write-Host ""
Write-Host "N'oubliez pas de modifier `$repoUrl dans ce script avec votre vraie URL GitHub." -ForegroundColor Yellow
