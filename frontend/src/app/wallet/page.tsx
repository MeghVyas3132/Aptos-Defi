'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getAccountBalance, formatAddress } from '@/utils/aptosClient';
import { NETWORK, FAUCET_URL, EXPLORER_URL } from '@/constants';

export default function WalletPage() {
  const router = useRouter();
  const { connected, account, disconnect } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!connected || !account) {
      router.push('/login');
      return;
    }

    loadBalance();
  }, [connected, account, router]);

  const loadBalance = async () => {
    if (!account) return;
    
    try {
      const bal = await getAccountBalance(account.address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestFaucet = async () => {
    if (!account) return;

    setIsFaucetLoading(true);
    setFaucetMessage(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/wallet/faucet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: account.address,
          amount_apt: 1,
          network: 'devnet',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFaucetMessage({ type: 'success', text: 'Successfully received 1 APT from faucet' });
        // Refresh balance after a delay
        setTimeout(loadBalance, 2000);
      } else {
        setFaucetMessage({ type: 'error', text: data.error || 'Faucet request failed' });
      }
    } catch (error) {
      setFaucetMessage({ type: 'error', text: 'Network error - try again later' });
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      localStorage.removeItem('wallet_address');
      localStorage.removeItem('network');
      router.push('/login');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!connected || !account) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Trade.apt</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Network Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-cyan-400 text-sm font-medium">Devnet</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Trading
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Wallet Management</h1>

        {/* Wallet Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden mb-6">
          {/* Wallet Header */}
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl text-white font-mono">{formatAddress(account.address, 6)}</p>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="p-6 border-b border-slate-700">
            <p className="text-sm text-gray-400 mb-2">Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{balance.toFixed(4)}</span>
              <span className="text-xl text-gray-400">APT</span>
            </div>
            <p className="text-sm text-cyan-400 mt-2">Network: Devnet</p>
          </div>

          {/* Faucet Section */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Devnet Faucet</p>
                <p className="text-xs text-gray-500">Get free APT tokens for testing</p>
              </div>
              <button
                onClick={handleRequestFaucet}
                disabled={isFaucetLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
              >
                {isFaucetLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Request 1 APT</span>
                  </>
                )}
              </button>
            </div>

            {faucetMessage && (
              <div className={`p-3 rounded-lg ${
                faucetMessage.type === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {faucetMessage.text}
              </div>
            )}

            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-3 text-sm text-purple-400 hover:text-purple-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Official Aptos Devnet Faucet
            </a>
          </div>

          {/* Quick Links */}
          <div className="p-6">
            <p className="text-sm text-gray-400 mb-3">Quick Links</p>
            <div className="space-y-2">
              <a
                href={`${EXPLORER_URL}/account/${account.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">View on Aptos Explorer (Devnet)</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href="https://aptoslabs.com/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">Aptos Developer Docs</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Disconnect Wallet
        </button>

        {/* Devnet Info Card */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">About Devnet</h2>
          
          <div className="space-y-4 text-sm text-gray-400">
            <p>
              You are connected to the <strong className="text-cyan-400">Aptos Devnet</strong> - a development network 
              for testing and experimentation.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>All tokens are <strong>free test tokens</strong> with no real value</li>
              <li>Use the faucet to get free APT for testing trades</li>
              <li>The network may reset periodically, clearing all data</li>
              <li>Perfect for learning and testing the AI trading assistant</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-cyan-400 text-sm">
              <strong>Getting Started:</strong> Request free APT from the faucet above, then go back to 
              the trading dashboard to test AI-powered trading commands like "buy 0.1 APT" or 
              "what's the price of bitcoin?"
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
