'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faWallet, faShieldAlt, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface Message {
  type: 'bot' | 'user' | 'approval';
  content: string;
  trade?: TradeData;
}

interface TradeData {
  intent: string;
  action: string;
  tokenFrom: string;
  tokenTo: string;
  amountUsd: number;
  conditions: {
    type: string;
    operator: string | null;
    value: number | null;
  };
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: '👋 Hey! I\'m your AI trading assistant.\n\n🔒 **Your Security:**\n• I only *parse* your requests - I never access your wallet\n• All trades require YOUR approval in your wallet\n• Your private keys stay with YOU\n\nConnect your wallet to start trading, or ask me about prices!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check for Petra wallet on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).aptos) {
      try {
        const wallet = (window as any).aptos;
        if (wallet.isConnected) {
          const account = await wallet.account();
          setWalletAddress(account.address);
        }
      } catch (e) {
        console.log('Wallet not connected');
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).aptos) {
      try {
        const wallet = (window as any).aptos;
        const response = await wallet.connect();
        setWalletAddress(response.address);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `✅ Wallet connected!\n\n**Address:** ${response.address.slice(0, 6)}...${response.address.slice(-4)}\n\n🔒 Remember: I can ONLY suggest trades. YOU approve every transaction in your wallet. I never have access to your funds.`
        }]);
      } catch (error: any) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: '❌ Wallet connection failed. Make sure you have Petra or Pontem wallet installed!'
        }]);
      }
    } else {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '🦊 No Aptos wallet detected!\n\nPlease install:\n• Petra Wallet (petra.app)\n• Pontem Wallet (pontem.network)\n\nThen refresh this page.'
      }]);
    }
  };

  const handleApprove = async (trade: TradeData) => {
    if (!walletAddress) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '⚠️ Please connect your wallet first to approve trades.'
      }]);
      return;
    }

    setMessages(prev => [...prev, {
      type: 'bot',
      content: '🔐 Opening wallet for approval...\n\n**Check your wallet popup!**\n\nYou\'ll see the exact transaction details there. Only sign if everything looks correct.'
    }]);

    try {
      // In a real implementation, this would create and submit the transaction
      // The wallet popup shows EXACTLY what will happen - user has full control
      const wallet = (window as any).aptos;
      
      // Example: Building an Aptos transaction (would use actual DEX contract)
      // const payload = {
      //   type: "entry_function_payload",
      //   function: "0x1::coin::transfer",
      //   type_arguments: ["0x1::aptos_coin::AptosCoin"],
      //   arguments: [receiverAddress, amount]
      // };
      // const response = await wallet.signAndSubmitTransaction(payload);
      
      // Simulated delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `✅ **Trade Submitted!**\n\n📋 **Order:**\n• ${trade.action.toUpperCase()} ${trade.amountUsd > 0 ? '$' + trade.amountUsd : ''} ${trade.tokenTo || trade.tokenFrom}\n${trade.conditions.type === 'price_trigger' ? `• Trigger: When price ${trade.conditions.operator} $${trade.conditions.value}` : '• Execution: Immediate'}\n\n🔗 Transaction will appear in your wallet history.\n\n_Note: This is a demo. In production, this executes on Aptos mainnet via your wallet._`
      }]);
      
    } catch (error: any) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `❌ Transaction cancelled or failed.\n\nReason: ${error.message || 'User rejected the transaction'}\n\nNo funds were moved. Try again when ready!`
      }]);
    }
  };

  const handleReject = () => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content: '🚫 Trade cancelled. No transaction was created.\n\nLet me know if you\'d like to try something else!'
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });

      const data = await response.json();

      if (data.success) {
        let botResponse = data.message || 'I understood your request.';
        
        // If there's a trade, show approval UI
        if (data.parsed && data.parsed.action) {
          const trade = data.parsed as TradeData;
          
          // Add the conversational response
          setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
          
          // Add approval message with buttons
          const approvalMsg = `🔐 **Approval Required**\n\nI've prepared this trade:\n• **Action:** ${trade.action.toUpperCase()}\n• **Token:** ${trade.action === 'sell' ? trade.tokenFrom : trade.tokenTo}\n• **Amount:** ${trade.amountUsd > 0 ? '$' + trade.amountUsd.toLocaleString() : 'To be specified'}\n• **Type:** ${trade.conditions.type === 'price_trigger' ? `Conditional (${trade.conditions.operator} $${trade.conditions.value})` : 'Market Order'}\n\n⚠️ **Your wallet will ask you to sign.**\nI cannot access your funds - only YOU can approve this.`;
          
          setMessages(prev => [...prev, { 
            type: 'approval', 
            content: approvalMsg,
            trade: trade
          }]);
        } else {
          setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: data.error || 'Sorry, I couldn\'t process that. Try asking about crypto prices or making a trade!' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I\'m having trouble connecting. Make sure the server is running.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <aside className="panel-border border-r-0 border-t-0 border-b-0 bg-bg-panel flex flex-col h-full z-20">
      {/* Chat Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center">
          <div className="relative">
            <FontAwesomeIcon icon={faRobot} className="text-green-400 text-lg" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-white">AI ASSISTANT</h3>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
              Read-only • You control trades
            </p>
          </div>
        </div>
        
        {/* Wallet Button */}
        <button
          onClick={connectWallet}
          className={`text-xs px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            walletAddress 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-aptos-blue/20 text-aptos-blue border border-aptos-blue/30 hover:bg-aptos-blue/30'
          }`}
        >
          <FontAwesomeIcon icon={faWallet} />
          {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect'}
        </button>
      </div>

      {/* Trust Banner */}
      <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/20">
        <p className="text-[10px] text-green-400 flex items-center gap-2">
          <FontAwesomeIcon icon={faShieldAlt} />
          AI parses only • Your keys stay with you • Wallet approval required
        </p>
      </div>

      {/* Chat History */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start'}`}>
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed shadow-sm max-w-[90%] whitespace-pre-wrap ${
                message.type === 'user'
                  ? 'bg-aptos-blue text-white rounded-tr-none'
                  : message.type === 'approval'
                  ? 'bg-yellow-500/10 border border-yellow-500/30 text-gray-300 rounded-tl-none'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 rounded-tl-none'
              }`}
            >
              {message.content}
              
              {/* Approval Buttons */}
              {message.type === 'approval' && message.trade && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(message.trade!)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Approve & Sign
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition border border-red-500/30"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-700 text-xs text-gray-300">
              <span className="animate-pulse">Analyzing request...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative">
          <input
            type="text"
            placeholder={walletAddress ? "Ask the AI agent..." : "Connect wallet or ask about prices..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-black border border-gray-700 text-gray-300 text-xs rounded-lg pl-3 pr-10 py-3 focus:outline-none focus:border-aptos-blue focus:ring-1 focus:ring-aptos-blue transition"
          />
          <button
            onClick={sendMessage}
            className="absolute right-2 top-2 text-aptos-blue hover:text-white p-1 rounded transition"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </aside>
  );
}
