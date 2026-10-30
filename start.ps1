# RAWCONNECT — Lance tout (base + API + frontend)
# Usage: .\start.ps1
# Options: .\start.ps1 -SkipDb    (ne pas re-créer la base)
#          .\start.ps1 -NoBrowser (ne pas ouvrir le navigateur)

param(
    [switch]$SkipDb,
    [switch]$NoBrowser,
    [int]$ApiPort = 5000,
    [int]$FrontPort = 8080
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RAWCONNECT — Demarrage complet" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Dependances Python
Write-Host "[1/4] Verification des dependances..." -ForegroundColor Yellow
$req = Join-Path $Root "requirements.txt"
if (Test-Path $req) {
    python -m pip install -q -r $req
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur: pip install a echoue." -ForegroundColor Red
        exit 1
    }
}
Write-Host "      OK" -ForegroundColor Green

# 2. Base de donnees
if (-not $SkipDb) {
    Write-Host "[2/4] Setup base MySQL (tables + demo)..." -ForegroundColor Yellow
    Write-Host "      (MySQL doit etre demarre dans Laragon)" -ForegroundColor DarkGray
    python -m backend.db.setup_db
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Echec setup DB. Verifie que MySQL tourne (Laragon) et .env." -ForegroundColor Red
        Write-Host "Tu peux relancer avec: .\start.ps1 -SkipDb" -ForegroundColor DarkYellow
        exit 1
    }
    Write-Host "      OK" -ForegroundColor Green
} else {
    Write-Host "[2/4] Setup DB ignore (-SkipDb)" -ForegroundColor DarkGray
}

# 3. Backend Flask
Write-Host "[3/4] Demarrage API Flask (port $ApiPort)..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    param($root, $port)
    Set-Location $root
    $env:FLASK_ENV = "development"
    python -m backend.app
} -ArgumentList $Root, $ApiPort

# Attendre que l'API reponde
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$ApiPort/" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
}
if ($ready) {
    Write-Host "      API OK -> http://localhost:$ApiPort" -ForegroundColor Green
} else {
    Write-Host "      API demarree (attente reponse) -> http://localhost:$ApiPort" -ForegroundColor DarkYellow
    Receive-Job $apiJob -ErrorAction SilentlyContinue | Out-Host
}

# 4. Frontend (serveur HTTP)
Write-Host "[4/4] Demarrage frontend (port $FrontPort)..." -ForegroundColor Yellow
$frontDir = Join-Path $Root "frontend"
$frontJob = Start-Job -ScriptBlock {
    param($dir, $port)
    Set-Location $dir
    python -m http.server $port
} -ArgumentList $frontDir, $FrontPort

Start-Sleep -Seconds 1
Write-Host "      Frontend OK -> http://localhost:$FrontPort" -ForegroundColor Green

# Ouvrir le navigateur
if (-not $NoBrowser) {
    Start-Process "http://localhost:$FrontPort"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pret !" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:$FrontPort" -ForegroundColor White
Write-Host "  API      : http://localhost:$ApiPort" -ForegroundColor White
Write-Host "  Compte demo : 0812345678 / PIN 1234" -ForegroundColor White
Write-Host "  USSD        : *444#" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ctrl+C pour arreter tout." -ForegroundColor DarkGray
Write-Host ""

# Garder le script vivant et afficher les logs
try {
    while ($true) {
        Receive-Job $apiJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[API] $_" }
        Receive-Job $frontJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[FRONT] $_" }
        if ($apiJob.State -eq "Failed" -or $apiJob.State -eq "Completed") {
            Write-Host "L'API s'est arretee." -ForegroundColor Red
            Receive-Job $apiJob -ErrorAction SilentlyContinue | Out-Host
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "Arret en cours..." -ForegroundColor Yellow
    Stop-Job $apiJob, $frontJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob, $frontJob -Force -ErrorAction SilentlyContinue
    Write-Host "Arrete." -ForegroundColor Green
}
