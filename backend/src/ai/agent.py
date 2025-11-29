"""
Trade.apt Autonomous AI Trading Agent
======================================
A comprehensive AI agent that takes full control of the trading platform.
Handles all use cases, edge cases, and worst-case scenarios responsibly.

Capabilities:
- Natural language understanding for any trading request
- Real-time market analysis with price data
- Risk assessment and warnings
- Portfolio analysis
- Multi-step trade planning
- Error recovery and graceful degradation
- User education and guidance
"""

import os
import json
import re
from datetime import datetime
from typing import Optional, Dict, List, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client (fast & free!)
client = None
API_KEY = os.getenv("GROQ_API_KEY")
if API_KEY and API_KEY not in ["", "your_groq_api_key_here"]:
    client = Groq(api_key=API_KEY)

# AI Model Configuration - Using Groq's fast LLaMA models
AI_MODEL = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")  # Fast & powerful
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))
AI_MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "2000"))


def build_system_prompt(context: Dict[str, Any]) -> str:
    """
    Build a comprehensive system prompt with full context.
    """
    prices = context.get("prices", {})
    wallet = context.get("wallet", {})
    pending_orders = context.get("pending_orders", [])
    alerts = context.get("alerts", [])
    
    # Format price data
    price_lines = []
    for token, data in prices.items():
        if isinstance(data, dict):
            price = data.get("price", 0)
            change = data.get("change_24h", 0)
            emoji = "📈" if change >= 0 else "📉"
            price_lines.append(f"  {token}: ${price:,.2f} ({emoji} {change:+.2f}%)")
        elif data:
            price_lines.append(f"  {token}: ${data:,.2f}")
    
    price_info = "\n".join(price_lines) if price_lines else "  (Fetching prices...)"
    
    # Format wallet info
    wallet_info = "Not connected"
    if wallet.get("connected"):
        wallet_info = f"""Connected: {wallet.get('address', 'Unknown')[:8]}...
  Balance: ${wallet.get('balance_usd', 0):,.2f}
  Holdings: {json.dumps(wallet.get('holdings', {}), indent=2)}"""
    
    # Format pending orders
    orders_info = "None"
    if pending_orders:
        orders_info = "\n".join([
            f"  - {o.get('action', 'Unknown')} {o.get('token', '?')} @ ${o.get('target_price', 0)}"
            for o in pending_orders[:5]
        ])
    
    return f"""You are Trade.apt's Autonomous AI Trading Agent - a highly intelligent, responsible, and comprehensive trading assistant built on Aptos blockchain.

═══════════════════════════════════════════════════════════════
                    REAL-TIME MARKET DATA
═══════════════════════════════════════════════════════════════
{price_info}

═══════════════════════════════════════════════════════════════
                      WALLET STATUS
═══════════════════════════════════════════════════════════════
{wallet_info}

═══════════════════════════════════════════════════════════════
                     PENDING ORDERS
═══════════════════════════════════════════════════════════════
{orders_info}

═══════════════════════════════════════════════════════════════
                    YOUR CAPABILITIES
═══════════════════════════════════════════════════════════════

1. TRADING OPERATIONS:
   - Execute market buys/sells with real-time pricing
   - Set limit orders with price triggers
   - Create stop-loss and take-profit orders
   - Swap between any supported tokens
   - DCA (Dollar Cost Averaging) strategies

2. MARKET ANALYSIS:
   - Real-time price checks for any crypto
   - 24h price change analysis
   - Market trend assessment
   - Compare multiple tokens

3. PORTFOLIO MANAGEMENT:
   - View current holdings
   - Calculate portfolio value
   - Suggest rebalancing
   - Track P&L

4. RISK MANAGEMENT:
   - Warn about high-risk trades
   - Suggest position sizing
   - Identify market volatility
   - Prevent emotional trading

5. ALERTS & AUTOMATION:
   - Set price alerts
   - Create conditional orders
   - Manage pending trades

═══════════════════════════════════════════════════════════════
                    RESPONSE PROTOCOL
═══════════════════════════════════════════════════════════════

ALWAYS structure your response as JSON with this format:
{{
  "message": "Your conversational response to the user (markdown supported)",
  "intent": "chat|trade|price_check|portfolio|alert|analysis|help|error",
  "action": {{
    "type": "none|buy|sell|swap|limit_order|stop_loss|alert|cancel",
    "token_from": "SYMBOL or null",
    "token_to": "SYMBOL or null", 
    "amount_usd": number or null,
    "amount_tokens": number or null,
    "condition": {{
      "type": "immediate|price_above|price_below|time_based",
      "trigger_price": number or null,
      "expiry": "ISO datetime or null"
    }},
    "risk_level": "low|medium|high|critical",
    "requires_confirmation": true/false
  }},
  "warnings": ["List of any warnings or risks"],
  "suggestions": ["Helpful follow-up suggestions"],
  "market_context": "Brief market analysis if relevant"
}}

═══════════════════════════════════════════════════════════════
                    SAFETY PROTOCOLS
═══════════════════════════════════════════════════════════════

🛡️ ALWAYS FOLLOW THESE RULES:

1. NEVER execute trades without user confirmation
2. ALWAYS warn about:
   - Trades > 20% of portfolio
   - High volatility tokens (memecoins)
   - Unusual price movements
   - Slippage risks for large orders
   
3. For HIGH-RISK actions, set requires_confirmation: true and explain why

4. If user seems emotional or impulsive:
   - Suggest waiting
   - Remind them of risk management
   - Offer to set alerts instead

5. If request is unclear:
   - Ask clarifying questions
   - Don't assume amounts
   - Confirm token symbols

6. ERROR HANDLING:
   - If price fetch fails: use last known + warn
   - If wallet not connected: guide to connect
   - If insufficient balance: explain and suggest alternatives

═══════════════════════════════════════════════════════════════
                    EDGE CASE HANDLING
═══════════════════════════════════════════════════════════════

HANDLE THESE SCENARIOS:

1. "Buy all my money in PEPE" 
   → Warn about concentration risk, suggest smaller position

2. "Sell everything now!"
   → Ask what's wrong, suggest partial sell, warn about panic selling

3. "What should I buy?"
   → Don't give financial advice, explain you can analyze but not recommend

4. Ambiguous amounts: "Buy some ETH"
   → Ask for specific amount, suggest common amounts ($50, $100, etc.)

5. Unknown tokens: "Buy RANDOMCOIN"
   → Say you don't have data, warn about scam risks

6. Stale prices (API down):
   → Inform user, suggest trying again, don't execute trades

7. User wants leverage/margin:
   → Explain this platform is spot-only, no leverage

8. Conflicting orders:
   → Identify conflict, ask user to clarify

═══════════════════════════════════════════════════════════════
                    PERSONALITY
═══════════════════════════════════════════════════════════════

- Professional but friendly
- Use emojis sparingly for clarity (📈📉💰⚠️✅❌)
- Be concise but thorough on risks
- Celebrate user wins, support during losses
- Educational when explaining concepts
- Never condescending

Current timestamp: {datetime.utcnow().isoformat()}Z
"""


async def process_message(
    user_message: str,
    prices: Dict[str, Any],
    wallet: Optional[Dict] = None,
    pending_orders: Optional[List] = None,
    alerts: Optional[List] = None,
    conversation_history: Optional[List] = None
) -> Dict[str, Any]:
    """
    Process a user message with full context and return AI response.
    
    Args:
        user_message: The user's input
        prices: Current token prices from CoinGecko
        wallet: User's wallet info (address, balance, holdings)
        pending_orders: List of pending conditional orders
        alerts: List of active price alerts
        conversation_history: Previous messages for context
    
    Returns:
        Structured response with message, actions, warnings, etc.
    """
    
    # Build context
    context = {
        "prices": prices,
        "wallet": wallet or {"connected": False},
        "pending_orders": pending_orders or [],
        "alerts": alerts or []
    }
    
    system_prompt = build_system_prompt(context)
    
    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history if provided
    if conversation_history:
        for msg in conversation_history[-10:]:  # Last 10 messages for context
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
    
    # Add current message
    messages.append({"role": "user", "content": user_message})
    
    # Check if client is available
    if not client:
        return await fallback_response(user_message, prices)
    
    try:
        response = client.chat.completions.create(
            model=AI_MODEL,
            messages=messages,
            temperature=AI_TEMPERATURE,
            max_tokens=AI_MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # Validate and sanitize response
        return validate_response(result, prices)
        
    except json.JSONDecodeError as e:
        return {
            "message": "I understood your request but had trouble formatting my response. Let me try again - what would you like to do?",
            "intent": "error",
            "action": {"type": "none", "requires_confirmation": False},
            "warnings": ["Response parsing error"],
            "suggestions": ["Try rephrasing your request"]
        }
    except Exception as e:
        print(f"AI Agent error: {e}")
        return await fallback_response(user_message, prices)


def validate_response(response: Dict, prices: Dict) -> Dict:
    """
    Validate and enhance AI response with additional safety checks.
    """
    # Ensure required fields exist
    if "message" not in response:
        response["message"] = "I processed your request."
    
    if "intent" not in response:
        response["intent"] = "chat"
    
    if "action" not in response:
        response["action"] = {"type": "none", "requires_confirmation": False}
    
    # Add risk warnings for high-value trades
    action = response.get("action", {})
    amount = action.get("amount_usd", 0) or 0
    
    if amount > 1000:
        if "warnings" not in response:
            response["warnings"] = []
        response["warnings"].append(f"⚠️ Large trade amount: ${amount:,.2f}")
        action["requires_confirmation"] = True
        action["risk_level"] = "high" if amount > 5000 else "medium"
    
    # Check for memecoins
    token = action.get("token_to") or action.get("token_from") or ""
    memecoins = ["PEPE", "SHIB", "DOGE", "BONK", "WIF", "FLOKI"]
    if token.upper() in memecoins:
        if "warnings" not in response:
            response["warnings"] = []
        response["warnings"].append(f"⚠️ {token} is a memecoin with high volatility")
        action["risk_level"] = "high"
    
    return response


async def fallback_response(user_message: str, prices: Dict) -> Dict:
    """
    Enhanced fallback response when OpenAI is unavailable.
    Uses advanced pattern matching to handle complex trading commands.
    """
    message_lower = user_message.lower()
    
    # Token mappings
    tokens = {
        "bitcoin": "BTC", "btc": "BTC",
        "ethereum": "ETH", "eth": "ETH",
        "aptos": "APT", "apt": "APT",
        "solana": "SOL", "sol": "SOL",
        "doge": "DOGE", "dogecoin": "DOGE",
        "usdc": "USDC", "usdt": "USDT",
        "bnb": "BNB", "binance": "BNB",
        "xrp": "XRP", "ripple": "XRP",
        "cardano": "ADA", "ada": "ADA",
        "polygon": "MATIC", "matic": "MATIC",
        "avalanche": "AVAX", "avax": "AVAX",
    }
    
    def get_price(symbol: str) -> float:
        """Helper to get price from prices dict"""
        price = prices.get(symbol, 0)
        if isinstance(price, dict):
            return price.get("price", 0)
        return price or 0
    
    # Detect all tokens mentioned
    detected_tokens = []
    for name, symbol in tokens.items():
        if name in message_lower and symbol not in detected_tokens:
            detected_tokens.append(symbol)
    
    detected_token = detected_tokens[0] if detected_tokens else None
    
    # Extract percentages
    percentages = re.findall(r'(\d+)\s*%', message_lower)
    percentages = [int(p) for p in percentages]
    
    # Extract amounts
    amounts = re.findall(r'\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)', user_message)
    amounts = [float(a.replace(",", "")) for a in amounts]
    
    # Check for split patterns (50/50, 50-50, 50 50)
    split_pattern = re.search(r'(\d+)\s*[/\-]\s*(\d+)', message_lower)
    if not split_pattern and "50 50" in message_lower:
        split_pattern = type('obj', (object,), {'group': lambda self, n: '50' if n in [1, 2] else None})()
    
    # ==========================================
    # LIQUIDATE / PORTFOLIO REBALANCE
    # ==========================================
    if any(word in message_lower for word in ["liquidate", "convert all", "sell everything", "rebalance", "split"]):
        btc_price = get_price("BTC")
        eth_price = get_price("ETH")
        
        # Determine target tokens (default to BTC/ETH if mentioned or implied)
        target_tokens = []
        if "bitcoin" in message_lower or "btc" in message_lower:
            target_tokens.append("BTC")
        if "ethereum" in message_lower or "eth" in message_lower:
            target_tokens.append("ETH")
        
        # If no specific tokens, use the detected ones
        if not target_tokens and len(detected_tokens) >= 2:
            target_tokens = detected_tokens[:2]
        elif not target_tokens:
            target_tokens = ["BTC", "ETH"]  # Default
        
        # Determine split percentages
        if split_pattern:
            split1 = int(split_pattern.group(1))
            split2 = int(split_pattern.group(2))
        elif len(percentages) >= 2:
            split1, split2 = percentages[0], percentages[1]
        else:
            split1, split2 = 50, 50  # Default 50/50
        
        token1, token2 = target_tokens[0], target_tokens[1] if len(target_tokens) > 1 else target_tokens[0]
        price1 = get_price(token1)
        price2 = get_price(token2)
        
        return {
            "message": f"""🔄 **Portfolio Liquidation & Rebalance**

I'll convert your portfolio and split it:
• **{split1}%** → **{token1}** (${price1:,.2f})
• **{split2}%** → **{token2}** (${price2:,.2f})

**Execution Plan:**
1. Sell all current holdings to USDC
2. Buy {token1} with {split1}% of proceeds
3. Buy {token2} with {split2}% of proceeds

⚠️ **This is a significant transaction!**
Your wallet will prompt you to approve each step.

Ready to proceed?""",
            "intent": "trade",
            "action": {
                "type": "multi_trade",
                "trades": [
                    {
                        "type": "sell_all",
                        "token_to": "USDC",
                        "description": "Liquidate portfolio"
                    },
                    {
                        "type": "buy",
                        "token_from": "USDC",
                        "token_to": token1,
                        "percentage": split1,
                        "description": f"Buy {token1} with {split1}%"
                    },
                    {
                        "type": "buy",
                        "token_from": "USDC",
                        "token_to": token2,
                        "percentage": split2,
                        "description": f"Buy {token2} with {split2}%"
                    }
                ],
                "condition": {"type": "immediate"},
                "risk_level": "high",
                "requires_confirmation": True
            },
            "warnings": [
                "⚠️ This will sell ALL your current holdings",
                f"⚠️ Large portfolio rebalance operation",
                "⚠️ Market volatility may affect execution prices"
            ],
            "suggestions": ["Confirm execution", "Modify split ratio", "Cancel"]
        }
    
    # ==========================================
    # SWAP TOKENS
    # ==========================================
    if any(word in message_lower for word in ["swap", "exchange", "convert", "trade"]) and len(detected_tokens) >= 2:
        from_token = detected_tokens[0]
        to_token = detected_tokens[1]
        from_price = get_price(from_token)
        to_price = get_price(to_token)
        
        amount = amounts[0] if amounts else None
        
        return {
            "message": f"""🔄 **Swap {from_token} → {to_token}**

**Current Rates:**
• {from_token}: ${from_price:,.2f}
• {to_token}: ${to_price:,.2f}
• Rate: 1 {from_token} = {(from_price/to_price):.6f} {to_token}

{f"Amount: **${amount:,.2f}**" if amount else "How much would you like to swap?"}

Your wallet will prompt you to approve this swap.""",
            "intent": "trade",
            "action": {
                "type": "swap",
                "token_from": from_token,
                "token_to": to_token,
                "amount_usd": amount,
                "condition": {"type": "immediate"},
                "risk_level": "medium",
                "requires_confirmation": True
            },
            "suggestions": [f"Swap all {from_token}", f"Swap $100 of {from_token}"]
        }
    
    # ==========================================
    # DCA / RECURRING BUY
    # ==========================================
    if any(word in message_lower for word in ["dca", "recurring", "weekly", "daily", "monthly", "every"]):
        token = detected_token or "BTC"
        price = get_price(token)
        amount = amounts[0] if amounts else 100
        
        frequency = "weekly"
        if "daily" in message_lower:
            frequency = "daily"
        elif "monthly" in message_lower:
            frequency = "monthly"
        
        return {
            "message": f"""📅 **DCA Strategy: {token}**

I'll set up a recurring buy:
• **Token:** {token} (${price:,.2f})
• **Amount:** ${amount:,.2f}
• **Frequency:** {frequency.capitalize()}

This is a great way to build a position over time and reduce volatility risk! 📈

Shall I set this up?""",
            "intent": "trade",
            "action": {
                "type": "dca",
                "token_to": token,
                "amount_usd": amount,
                "frequency": frequency,
                "condition": {"type": "recurring"},
                "risk_level": "low",
                "requires_confirmation": True
            },
            "suggestions": ["Confirm DCA", "Change frequency", "Change amount"]
        }
    
    # ==========================================
    # LIMIT ORDER
    # ==========================================
    if any(word in message_lower for word in ["limit", "when", "if", "drops", "reaches", "hits", "below", "above"]):
        token = detected_token or "BTC"
        current_price = get_price(token)
        
        # Extract target price
        price_match = re.search(r'\$\s*(\d+(?:,\d{3})*(?:\.\d+)?k?)', message_lower)
        target_price = None
        if price_match:
            price_str = price_match.group(1).replace(",", "")
            if 'k' in price_str.lower():
                target_price = float(price_str.lower().replace('k', '')) * 1000
            else:
                target_price = float(price_str)
        
        is_buy = "buy" in message_lower
        is_above = any(word in message_lower for word in ["above", "reaches", "hits"])
        condition_type = "price_above" if is_above else "price_below"
        
        return {
            "message": f"""⏰ **Limit Order: {token}**

• **Current Price:** ${current_price:,.2f}
• **Target Price:** {f"${target_price:,.2f}" if target_price else "Not specified"}
• **Action:** {"Buy" if is_buy else "Sell"} when price goes {"above" if is_above else "below"} target

{"I'll monitor the price and notify you when conditions are met!" if target_price else "What's your target price?"}""",
            "intent": "trade",
            "action": {
                "type": "limit_order",
                "order_side": "buy" if is_buy else "sell",
                "token": token,
                "target_price": target_price,
                "condition": {"type": condition_type, "trigger_price": target_price},
                "risk_level": "low",
                "requires_confirmation": True
            }
        }
    
    # ==========================================
    # PRICE ALERTS
    # ==========================================
    if any(word in message_lower for word in ["alert", "notify", "tell me when", "watch"]):
        token = detected_token or "BTC"
        current_price = get_price(token)
        
        price_match = re.search(r'\$\s*(\d+(?:,\d{3})*(?:\.\d+)?k?)', message_lower)
        target_price = None
        if price_match:
            price_str = price_match.group(1).replace(",", "")
            if 'k' in price_str.lower():
                target_price = float(price_str.lower().replace('k', '')) * 1000
            else:
                target_price = float(price_str)
        
        return {
            "message": f"""🔔 **Price Alert: {token}**

• **Current Price:** ${current_price:,.2f}
• **Alert Price:** {f"${target_price:,.2f}" if target_price else "Please specify a price"}

{"I'll notify you when " + token + " reaches $" + f"{target_price:,.2f}!" if target_price else "At what price should I alert you?"}""",
            "intent": "alert",
            "action": {
                "type": "alert",
                "token": token,
                "target_price": target_price,
                "requires_confirmation": True
            },
            "suggestions": [f"Alert at ${current_price * 1.1:,.0f}", f"Alert at ${current_price * 0.9:,.0f}"]
        }
    
    # ==========================================
    # PORTFOLIO VIEW
    # ==========================================
    if any(word in message_lower for word in ["portfolio", "holdings", "balance", "what do i have", "my assets"]):
        btc_price = get_price("BTC")
        eth_price = get_price("ETH")
        apt_price = get_price("APT")
        
        return {
            "message": f"""📊 **Your Portfolio**

Connect your wallet to see your holdings!

**Current Market Prices:**
• BTC: ${btc_price:,.2f}
• ETH: ${eth_price:,.2f}
• APT: ${apt_price:,.2f}

Click "Connect Wallet" above to view your actual portfolio.""",
            "intent": "portfolio",
            "action": {"type": "none", "requires_confirmation": False},
            "suggestions": ["Connect wallet", "Check prices", "Set alerts"]
        }
    
    # ==========================================
    # PRICE CHECK
    # ==========================================
    if any(word in message_lower for word in ["price", "how much", "what's", "cost", "worth", "value"]):
        if detected_token and detected_token in prices:
            price = get_price(detected_token)
            return {
                "message": f"📊 **{detected_token}** is currently at **${price:,.2f}**\n\nWould you like to buy or sell?",
                "intent": "price_check",
                "action": {"type": "none", "requires_confirmation": False},
                "suggestions": [f"Buy $100 of {detected_token}", f"Set alert for {detected_token}"]
            }
        else:
            price_list = "\n".join([f"• **{k}**: ${get_price(k):,.2f}" for k in ["BTC", "ETH", "APT", "SOL"] if get_price(k)])
            return {
                "message": f"📊 **Current Prices:**\n{price_list}\n\nWhich token interests you?",
                "intent": "price_check",
                "action": {"type": "none", "requires_confirmation": False}
            }
    
    # ==========================================
    # BUY INTENT
    # ==========================================
    if "buy" in message_lower:
        token = detected_token or "APT"
        price = get_price(token)
        amount = amounts[0] if amounts else None
        
        # Check for "all" or percentage
        if any(word in message_lower for word in ["all", "everything", "max"]):
            return {
                "message": f"""🚀 **Buy {token} (Maximum)**

Current price: **${price:,.2f}**

I'll use your entire available balance to buy {token}.

⚠️ Your wallet will prompt you to approve this transaction.""",
                "intent": "trade",
                "action": {
                    "type": "buy",
                    "token_from": "USDC",
                    "token_to": token,
                    "use_max": True,
                    "condition": {"type": "immediate"},
                    "risk_level": "high",
                    "requires_confirmation": True
                },
                "warnings": ["⚠️ This will use your entire balance"]
            }
        
        return {
            "message": f"🚀 **Buy {token}**\n\nCurrent price: **${price:,.2f}**\n" + 
                      (f"Amount: **${amount:,.2f}**\n" if amount else "How much would you like to buy?\n") +
                      "\n⚠️ Your wallet will prompt you to approve this transaction.",
            "intent": "trade",
            "action": {
                "type": "buy",
                "token_from": "USDC",
                "token_to": token,
                "amount_usd": amount,
                "condition": {"type": "immediate"},
                "risk_level": "medium" if (amount or 0) > 500 else "low",
                "requires_confirmation": True
            },
            "warnings": [] if (amount or 0) < 1000 else [f"Large trade: ${amount:,.2f}"]
        }
    
    # ==========================================
    # SELL INTENT
    # ==========================================
    if "sell" in message_lower:
        token = detected_token or "BTC"
        price = get_price(token)
        
        # Check for "all"
        if any(word in message_lower for word in ["all", "everything"]):
            return {
                "message": f"""💰 **Sell All {token}**

Current price: **${price:,.2f}**

I'll sell your entire {token} position.

⚠️ Your wallet will prompt you to approve this transaction.""",
                "intent": "trade",
                "action": {
                    "type": "sell",
                    "token_from": token,
                    "token_to": "USDC",
                    "sell_all": True,
                    "condition": {"type": "immediate"},
                    "risk_level": "high",
                    "requires_confirmation": True
                },
                "warnings": [f"⚠️ This will sell ALL your {token}"]
            }
        
        return {
            "message": f"💰 **Sell {token}**\n\nCurrent price: **${price:,.2f}**\n\nHow much would you like to sell?",
            "intent": "trade",
            "action": {
                "type": "sell",
                "token_from": token,
                "token_to": "USDC",
                "condition": {"type": "immediate"},
                "requires_confirmation": True
            }
        }
    
    # ==========================================
    # HELP / GREETING
    # ==========================================
    if any(word in message_lower for word in ["hello", "hi", "help", "hey", "start"]):
        btc_price = get_price("BTC")
        eth_price = get_price("ETH")
        apt_price = get_price("APT")
        
        return {
            "message": f"""👋 **Welcome to Trade.apt!**

I'm your AI trading assistant. I can help you:

📊 **Check Prices**
"What's the price of Bitcoin?"

💰 **Buy Crypto**
"Buy $100 of ETH"

📈 **Sell Crypto**
"Sell my APT"

🔄 **Rebalance Portfolio**
"Liquidate my portfolio into BTC and ETH, split 50/50"

🎯 **Set Alerts**
"Alert me when BTC hits $100k"

⏰ **Limit Orders**
"Buy SOL if it drops to $200"

📅 **DCA Strategy**
"DCA $50 into ETH weekly"

**Current Market:**
• BTC: ${btc_price:,.2f}
• ETH: ${eth_price:,.2f}
• APT: ${apt_price:,.2f}

What would you like to do?""",
            "intent": "help",
            "action": {"type": "none", "requires_confirmation": False},
            "suggestions": ["Check prices", "Buy crypto", "View portfolio"]
        }
    
    # ==========================================
    # CATCH-ALL: TRY TO UNDERSTAND
    # ==========================================
    # If we have tokens mentioned, try to infer intent
    if detected_tokens:
        token = detected_tokens[0]
        price = get_price(token)
        
        return {
            "message": f"""I see you're interested in **{token}** (${price:,.2f})!

What would you like to do?
• Buy {token}
• Sell {token}
• Set a price alert
• View current price

Just let me know! 🤖""",
            "intent": "chat",
            "action": {"type": "none", "requires_confirmation": False},
            "suggestions": [f"Buy {token}", f"Sell {token}", f"Price alert for {token}"]
        }
    
    # Default response
    btc_price = get_price("BTC")
    eth_price = get_price("ETH")
    apt_price = get_price("APT")
    
    return {
        "message": f"""🤖 **I'm your AI Trading Assistant!**

Here's what I can do:

**Trading:**
• "Buy $100 of Bitcoin"
• "Sell all my ETH"
• "Swap APT for SOL"

**Advanced:**
• "Liquidate my portfolio into BTC and ETH 50/50"
• "DCA $50 into ETH weekly"
• "Buy BTC if it drops below $80k"

**Alerts:**
• "Alert me when ETH hits $4000"

**Current Prices:**
• BTC: ${btc_price:,.2f}
• ETH: ${eth_price:,.2f}
• APT: ${apt_price:,.2f}

What would you like to do?""",
        "intent": "chat",
        "action": {"type": "none", "requires_confirmation": False},
        "suggestions": ["Buy crypto", "Check prices", "Set alert"]
    }


# Convenience function for simple usage
async def chat(message: str, prices: Dict) -> Dict:
    """Simple chat interface."""
    return await process_message(message, prices)
