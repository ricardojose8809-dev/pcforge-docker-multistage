# Compatible con PowerShell 5.1. Crea secretos locales criptograficamente aleatorios.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$target = Join-Path $root '.env'
if (Test-Path -LiteralPath $target) {
    Write-Host 'INFO: .env ya existe. No se sobrescribe.' -ForegroundColor Yellow
    exit 0
}
function New-RandomBytes([int]$Length) {
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    return ,$bytes
}
function New-RandomHex([int]$Length) {
    $bytes = New-RandomBytes $Length
    return [System.BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
}
$appKey = [Convert]::ToBase64String((New-RandomBytes 32))
$jwt = New-RandomHex 48
$mysql = New-RandomHex 24
$rootPassword = New-RandomHex 24
$data = @"
APP_KEY=base64:$appKey
JWT_SECRET=$jwt
MYSQL_ROOT_PASSWORD=$rootPassword
MYSQL_DATABASE=pcforge
MYSQL_USER=pcforge
MYSQL_PASSWORD=$mysql
FRONTEND_PORT=3000
API_PORT=8000
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
"@
[System.IO.File]::WriteAllText($target, $data + "`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Host 'PASS: .env generado. No compartas su contenido ni lo subas a GitHub.' -ForegroundColor Green
