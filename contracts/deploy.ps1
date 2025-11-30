# Trade.apt Contract Deployment Script for Windows
# 
# Prerequisites:
# 1. Install Aptos CLI: https://aptos.dev/cli-tools/aptos-cli/install-cli/
# 2. Initialize account: aptos init
# 3. Fund account with testnet APT: https://aptoslabs.com/testnet-faucet

param(
    [string]$Network = "testnet",
    [string]$Profile = "default"
)

Write-Host "🚀 Trade.apt Contract Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Network: $Network" -ForegroundColor Yellow
Write-Host "Profile: $Profile" -ForegroundColor Yellow
Write-Host ""

# Navigate to contracts directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Compile contracts
Write-Host "📦 Compiling Move contracts..." -ForegroundColor Green
aptos move compile --named-addresses trade_apt=default
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed!" -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Green
aptos move test --named-addresses trade_apt=default
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed!" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host ""
Write-Host "🚀 Deploying to $Network..." -ForegroundColor Green
aptos move publish `
    --named-addresses trade_apt=default `
    --profile $Profile `
    --assume-yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

# Get deployed address
$AccountInfo = aptos account lookup-address --profile $Profile 2>&1
$AccountAddress = ($AccountInfo | Select-String -Pattern '0x[a-fA-F0-9]+').Matches[0].Value

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "Contract Address: $AccountAddress" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update CONTRACT_ADDRESS in frontend/.env.local:"
Write-Host "   NEXT_PUBLIC_CONTRACT_ADDRESS=$AccountAddress" -ForegroundColor White
Write-Host ""
Write-Host "2. Update CONTRACT_ADDRESS in backend/.env:"
Write-Host "   CONTRACT_ADDRESS=$AccountAddress" -ForegroundColor White
Write-Host ""
Write-Host "3. Initialize the protocol:" -ForegroundColor Yellow
Write-Host "   aptos move run --function-id ${AccountAddress}::trade_apt::initialize --profile $Profile" -ForegroundColor White
Write-Host ""
Write-Host "4. Initialize oracle:" -ForegroundColor Yellow
Write-Host "   aptos move run --function-id ${AccountAddress}::price_oracle::initialize --profile $Profile" -ForegroundColor White
