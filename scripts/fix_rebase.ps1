# RAWCONNECT — Corriger l'etat Git (rebase, index.lock)
# Usage : .\scripts\fix_rebase.ps1
# Quand : "rebase in progress" ou "index.lock: File exists"

$projectPath = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $projectPath

Write-Host "Correction de l'etat Git..." -ForegroundColor Cyan

# 0. Supprimer les fichiers lock (bloquent git)
@(".git\index.lock", ".git\packed-refs.lock") | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "Suppression de $_..." -ForegroundColor Yellow
        Remove-Item $_ -Force -ErrorAction SilentlyContinue
        Write-Host "  OK" -ForegroundColor Green
    }
}

$fixed = $false

if (Test-Path ".git\rebase-merge") {
    Write-Host "Suppression de .git\rebase-merge..." -ForegroundColor Yellow
    try {
        Remove-Item -Path ".git\rebase-merge" -Recurse -Force
        Write-Host "  OK" -ForegroundColor Green
        $fixed = $true
    } catch {
        Write-Host "  ACCES REFUSE." -ForegroundColor Red
        Write-Host "  Fermez Cursor/VS Code, puis relancez ce script." -ForegroundColor Yellow
        Write-Host "  Ou : PowerShell en tant qu'administrateur (clic droit -> Executer en tant qu'admin)" -ForegroundColor Yellow
        exit 1
    }
}

if (Test-Path ".git\rebase-apply") {
    Write-Host "Suppression de .git\rebase-apply..." -ForegroundColor Yellow
    Remove-Item -Path ".git\rebase-apply" -Recurse -Force -ErrorAction SilentlyContinue
    $fixed = $true
}

if ($fixed) {
    Write-Host ""
    Write-Host "Etat rebase nettoye. Verifiez avec : git status" -ForegroundColor Green
} else {
    Write-Host "Aucun dossier rebase trouve. Etat peut-etre deja OK." -ForegroundColor Gray
}
