import { Network } from "@aptos-labs/ts-sdk";

// Production: Use DEVNET only
export const NETWORK: Network = Network.DEVNET;

// Contract address (deployed on devnet)
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;

// Aptos API key (optional, for higher rate limits)
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;

// Backend API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Explorer URL for devnet
export const EXPLORER_URL = 'https://explorer.aptoslabs.com/?network=devnet';

// Faucet URL for devnet
export const FAUCET_URL = 'https://aptoslabs.com/testnet-faucet';
