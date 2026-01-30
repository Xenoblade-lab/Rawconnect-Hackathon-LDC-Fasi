# Script pour reparer ou initialiser Git - RAWCONNECT
# Executer dans PowerShell : .\fix_git.ps1
# Si "acces refuse" : Clic droit sur PowerShell -> Executer en tant qu'administrateur

$projectPath = $PSScriptRoot
Set-Location $projectPath

# 1. Supprimer le .git existant (s'il est corrompu ou verrouille)
if (Test-Path ".git") {
    Write-Host "Suppression du dossier .git existant..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path ".git") {
        Write-Host "ERREUR: Impossible de supprimer .git (acces refuse)." -ForegroundColor Red
        Write-Host "Fermez Cursor/VS Code, tout programme utilisant ce dossier, puis relancez ce script." -ForegroundColor Red
        Write-Host "Ou ouvrez PowerShell en tant qu'administrateur et relancez." -ForegroundColor Red
        exit 1
    }
    Write-Host "  OK - .git supprime." -ForegroundColor Green
}

# 2. Initialiser un nouveau depot
Write-Host "Initialisation de Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: git init a echoue." -ForegroundColor Red
    exit 1
}
Write-Host "  OK - Depot Git initialise." -ForegroundColor Green

# 3. Premier commit (optionnel)
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .
git status
Write-Host ""
Write-Host "Pour enregistrer le premier commit, tapez:" -ForegroundColor Cyan
Write-Host "  git commit -m `"Initial commit RAWCONNECT`"" -ForegroundColor White
Write-Host ""
Write-Host "Termine." -ForegroundColor Green
