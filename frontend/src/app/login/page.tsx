'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletSelector from '@/components/WalletSelector';
import { NETWORK, FAUCET_URL, EXPLORER_URL } from '@/constants';

export default function LoginPage() {
  const router = useRouter();
  const { connected, account } = useWallet();

  // Redirect to home when connected
  useEffect(() => {
    if (connected && account) {
      // Store wallet info in localStorage
      localStorage.setItem('wallet_address', account.address);
      localStorage.setItem('network', NETWORK);
      
      // Redirect to main dashboard
      router.push('/');
    }
  }, [connected, account, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Trade.apt</h1>
          <p className="text-gray-400">AI-Powered DeFi Trading Assistant</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 text-center">Connect Your Wallet</h2>

          {/* Network Badge - Devnet Only */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              <span className="text-cyan-400 text-sm font-medium">Devnet</span>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mb-6">
            Connect your Aptos wallet to start trading with AI assistance
          </p>

          {/* Wallet Selector */}
          <div className="flex justify-center">
            <WalletSelector />
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-gray-300 text-sm font-medium">Running on Devnet</p>
                <p className="text-gray-400 text-xs mt-1">
                  This is a development environment using test tokens. No real funds are required.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-gray-500">Helpful Links</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Helpful Links */}
          <div className="space-y-2">
            <a
              href="https://petra.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Get Petra Wallet (Recommended)
            </a>
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Devnet Faucet - Get Free Test APT
            </a>
            <a
              href={EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Aptos Explorer (Devnet)
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By connecting, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
