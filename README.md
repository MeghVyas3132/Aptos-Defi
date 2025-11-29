# Trade.apt - AI Trading & Portfolio Platform

A full-stack DeFi-style trading assistant with AI-powered natural language processing. This is a **simulation/demo** system - no actual blockchain transactions occur.

## Features

- 🤖 **AI-Powered Parsing**: Convert natural language trading instructions to structured JSON using OpenAI GPT-4o-mini
- 💰 **Real-Time Prices**: Fetch live crypto prices from CoinGecko API
- 📊 **Trade Simulation**: Simulate buy/sell/swap trades with conditional execution
- 🔔 **Price Alerts**: Set alerts that trigger when tokens reach target prices
- ⏰ **Background Worker**: Continuously monitors prices for alerts and pending trades
- 🎨 **Modern UI**: Next.js frontend with dark theme and real-time charts

## Project Structure

```
trade.apt/
├── backend/                    # Python FastAPI Backend
│   ├── src/
│   │   ├── ai/
│   │   │   └── parser.py       # AI parsing with OpenAI
│   │   ├── api/
│   │   │   └── price.py        # CoinGecko price fetching
│   │   ├── engine/
│   │   │   ├── trade_engine.py # Trade simulation logic
│   │   │   └── alert_engine.py # Alert system & background worker
│   │   └── server.py           # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Main application page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css     # Global styles
│   │   └── components/
│   │       ├── Sidebar.tsx     # Navigation sidebar
│   │       ├── Header.tsx      # Page header
│   │       ├── Ticker.tsx      # Market ticker
│   │       ├── Chatbot.tsx     # AI chatbot panel
│   │       └── views/
│   │           ├── HomeView.tsx      # Dashboard with charts
│   │           ├── AuditLogsView.tsx # Audit logs table
│   │           └── PlaceholderView.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── tailwind.config.js
│
├── docker-compose.yml          # Full stack orchestration
└── README.md
```

## Quick Start with Docker (Recommended)

```bash
# Build and run both frontend and backend
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Manual Setup

### Backend (Python FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run server
uvicorn src.server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js UI |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative docs |

## API Endpoints

### Health Check

```bash
GET /
GET /health
```

### AI Parsing

```bash
POST /ai/parse
Content-Type: application/json

{
    "text": "buy $20 APT if price drops to $7"
}
```

**Response:**
```json
{
    "success": true,
    "parsed": {
        "action": "buy",
        "tokenFrom": "USDC",
        "tokenTo": "APT",
        "amountUsd": 20,
        "conditions": {
            "type": "price_trigger",
            "operator": "<",
            "value": 7
        }
    },
    "original_text": "buy $20 APT if price drops to $7"
}
```

### Trade Execution

```bash
POST /trade/execute
Content-Type: application/json

{
    "action": "buy",
    "tokenFrom": "USDC",
    "tokenTo": "APT",
    "amountUsd": 20,
    "conditions": {
        "type": "price_trigger",
        "operator": "<",
        "value": 7
    }
}
```

**Response (Executed):**
```json
{
    "trade_id": "abc123",
    "status": "executed",
    "action": "buy",
    "tokenFrom": "USDC",
    "tokenTo": "APT",
    "amountUsd": 20,
    "executedPrice": 6.85,
    "tokensReceived": 2.91970803,
    "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response (Pending - condition not met):**
```json
{
    "trade_id": "def456",
    "status": "pending",
    "action": "buy",
    "tokenFrom": "USDC",
    "tokenTo": "APT",
    "amountUsd": 20,
    "executedPrice": 8.50,
    "reason": "Condition not met: APT price is $8.50, waiting for < $7"
}
```

### Price Fetching

```bash
# Get current price
GET /price/APT

# Get detailed token info
GET /price/APT/info

# List supported tokens
GET /tokens
```

### Alerts

```bash
# Create alert
POST /alerts
Content-Type: application/json

{
    "token": "APT",
    "operator": "<",
    "target_price": 7.0,
    "message": "APT dropped below $7!"
}

# List all alerts
GET /alerts

# List active alerts only
GET /alerts?active_only=true

# Get specific alert
GET /alerts/{alert_id}

# Delete alert
DELETE /alerts/{alert_id}

# Cancel alert (mark as cancelled but keep record)
DELETE /alerts/{alert_id}?cancel_only=true
```

### Pending Trades

```bash
# List pending trades
GET /trade/pending

# Cancel pending trade
DELETE /trade/pending/{trade_id}
```

## Supported Tokens

The following tokens are supported for price fetching:

| Symbol | Name |
|--------|------|
| APT | Aptos |
| BTC | Bitcoin |
| ETH | Ethereum |
| SOL | Solana |
| USDC | USD Coin |
| USDT | Tether |
| BNB | Binance Coin |
| XRP | Ripple |
| ADA | Cardano |
| DOGE | Dogecoin |
| AVAX | Avalanche |
| DOT | Polkadot |
| MATIC | Polygon |
| LINK | Chainlink |
| UNI | Uniswap |
| ATOM | Cosmos |
| LTC | Litecoin |
| NEAR | NEAR Protocol |
| ARB | Arbitrum |
| OP | Optimism |
| SUI | Sui |
| SEI | Sei |
| INJ | Injective |
| TIA | Celestia |
| PEPE | Pepe |
| SHIB | Shiba Inu |
| WIF | dogwifhat |
| BONK | Bonk |

## Example Usage with cURL

```bash
# Parse a trading instruction
curl -X POST http://localhost:8000/ai/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "sell $50 ETH when price goes above $2500"}'

# Get APT price
curl http://localhost:8000/price/APT

# Create a price alert
curl -X POST http://localhost:8000/alerts \
  -H "Content-Type: application/json" \
  -d '{"token": "BTC", "operator": ">", "target_price": 50000, "message": "BTC hit 50k!"}'

# Execute a trade
curl -X POST http://localhost:8000/trade/execute \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "tokenFrom": "USDC",
    "tokenTo": "APT",
    "amountUsd": 100,
    "conditions": {"type": "immediate", "operator": null, "value": null}
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI parsing | None (uses mock parser) |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ALERT_CHECK_INTERVAL` | Background check interval (seconds) | `10` |

## Background Worker

The server starts a background worker that:
- Checks all active alerts every 10 seconds (configurable)
- Monitors pending conditional trades
- Prints to console when alerts trigger or trades execute
- Automatically executes pending trades when conditions are met

## Important Notes

⚠️ **This is a SIMULATION/DEMO system:**
- No actual blockchain transactions occur
- No real money or tokens are exchanged
- No wallet connections
- No smart contract interactions
- Trade "execution" is purely simulated

## License

MIT
