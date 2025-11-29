'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface Message {
  type: 'bot' | 'user';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: 'Ask me to analyze your portfolio, find a stock, or summarize today\'s audit logs.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call the backend AI parse endpoint
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });

      const data = await response.json();

      if (data.success && data.parsed) {
        const parsed = data.parsed;
        const botResponse = `I understood your request:\n• Action: ${parsed.action.toUpperCase()}\n• From: ${parsed.tokenFrom}\n• To: ${parsed.tokenTo}\n• Amount: $${parsed.amountUsd}\n• Condition: ${parsed.conditions.type === 'immediate' ? 'Execute immediately' : `${parsed.conditions.operator} $${parsed.conditions.value}`}`;
        setMessages((prev) => [...prev, { type: 'bot', content: botResponse }]);
      } else {
        setMessages((prev) => [...prev, { type: 'bot', content: data.error || 'I couldn\'t understand that request. Try something like "buy $20 APT if price drops to $7".' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { type: 'bot', content: 'Sorry, I\'m having trouble connecting to the backend. Make sure the server is running.' }]);
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
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center">
          <div className="relative">
            <FontAwesomeIcon icon={faRobot} className="text-green-400 text-lg" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-white">AI CHATBOT</h3>
            <p className="text-[10px] text-gray-500">How can I assist your trades?</p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start'}`}>
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed shadow-sm max-w-[90%] whitespace-pre-wrap ${
                message.type === 'user'
                  ? 'bg-aptos-blue text-white rounded-tr-none'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 rounded-tl-none'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none border border-gray-700 text-xs text-gray-300">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask the AI agent..."
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
