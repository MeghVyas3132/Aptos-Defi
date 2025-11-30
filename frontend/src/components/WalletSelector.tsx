"use client";

import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect, useRef } from "react";
import { formatAddress } from "../utils/aptosClient";

export function WalletSelector() {
  const { connected, account, disconnect, wallets, connect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get available wallets
  const installedWallets = wallets?.filter((w) => w.readyState === "Installed") || [];
  const notInstalledWallets = wallets?.filter((w) => w.readyState !== "Installed") || [];

  const handleConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  if (connected && account) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-lg text-cyan-400 hover:border-cyan-400 transition-all"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="font-mono">{formatAddress(account.address, 6)}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <p className="text-gray-400 text-sm">Connected Wallet</p>
              <p className="text-cyan-400 font-mono text-sm mt-1">{account.address}</p>
              <p className="text-gray-500 text-xs mt-1">Network: Devnet</p>
            </div>
            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Connect Wallet
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Connect Wallet</h3>
            <p className="text-gray-400 text-sm mt-1">Network: Devnet</p>
          </div>

          {installedWallets.length > 0 && (
            <div className="p-2">
              <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider">Installed Wallets</p>
              {installedWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet.name)}
                  className="w-full px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="text-white">{wallet.name}</span>
                </button>
              ))}
            </div>
          )}

          {notInstalledWallets.length > 0 && installedWallets.length === 0 && (
            <div className="p-4">
              <p className="text-gray-400 text-sm text-center mb-4">No wallets installed</p>
              <p className="text-gray-500 text-xs text-center mb-3">Install one of these wallets:</p>
              <div className="space-y-2">
                {notInstalledWallets.slice(0, 3).map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-8 h-8 rounded-lg opacity-50"
                    />
                    <div>
                      <span className="text-gray-300">{wallet.name}</span>
                      <p className="text-cyan-400 text-xs">Click to install →</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {installedWallets.length > 0 && notInstalledWallets.length > 0 && (
            <div className="p-2 border-t border-gray-700">
              <p className="text-gray-500 text-xs px-2 mb-2 uppercase tracking-wider">More Wallets</p>
              {notInstalledWallets.slice(0, 2).map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-6 h-6 rounded-lg opacity-50"
                  />
                  <span className="text-gray-400 text-sm">{wallet.name}</span>
                  <span className="text-cyan-400 text-xs ml-auto">Install</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WalletSelector;
