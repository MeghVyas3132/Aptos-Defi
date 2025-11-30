#!/bin/bash
# Trade.apt - Aptos Contract Deployment Script
# 
# Prerequisites:
# 1. Install Aptos CLI: https://aptos.dev/cli-tools/aptos-cli/install-cli/
# 2. Initialize account: aptos init
# 3. Fund account with testnet APT: https://aptoslabs.com/testnet-faucet

set -e

echo "🚀 Trade.apt Contract Deployment"
echo "================================"

# Configuration
NETWORK=${1:-testnet}
PROFILE=${2:-default}

echo "Network: $NETWORK"
echo "Profile: $PROFILE"
echo ""

# Navigate to contracts directory
cd "$(dirname "$0")"

# Compile contracts
echo "📦 Compiling Move contracts..."
aptos move compile --named-addresses trade_apt=default

# Run tests
echo "🧪 Running tests..."
aptos move test --named-addresses trade_apt=default

# Deploy
echo "🚀 Deploying to $NETWORK..."
aptos move publish \
    --named-addresses trade_apt=default \
    --profile $PROFILE \
    --assume-yes

# Get deployed address
ACCOUNT_ADDRESS=$(aptos account lookup-address --profile $PROFILE | grep -oP '0x[a-fA-F0-9]+')

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo "Contract Address: $ACCOUNT_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Update CONTRACT_ADDRESS in frontend/.env:"
echo "   NEXT_PUBLIC_CONTRACT_ADDRESS=$ACCOUNT_ADDRESS"
echo ""
echo "2. Update CONTRACT_ADDRESS in backend/.env:"
echo "   CONTRACT_ADDRESS=$ACCOUNT_ADDRESS"
echo ""
echo "3. Initialize the protocol:"
echo "   aptos move run --function-id ${ACCOUNT_ADDRESS}::trade_apt::initialize --profile $PROFILE"
echo ""
echo "4. Initialize oracle:"
echo "   aptos move run --function-id ${ACCOUNT_ADDRESS}::price_oracle::initialize --profile $PROFILE"
