import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { NETWORK, APTOS_API_KEY } from "../constants";

// Create the Aptos client configuration for devnet
const aptosConfig = new AptosConfig({
  network: NETWORK,
  ...(APTOS_API_KEY && { clientConfig: { API_KEY: APTOS_API_KEY } }),
});

// Export the Aptos client instance
export const aptos = new Aptos(aptosConfig);

// Helper function to get account balance
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const resources = await aptos.getAccountResources({ accountAddress: address });
    const aptResource = resources.find(
      (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
    );
    if (aptResource) {
      const balance = (aptResource.data as any).coin.value;
      return parseInt(balance) / 100000000; // Convert from octas to APT
    }
    return 0;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}

// Helper function to check if account exists
export async function accountExists(address: string): Promise<boolean> {
  try {
    await aptos.getAccountInfo({ accountAddress: address });
    return true;
  } catch {
    return false;
  }
}

// Helper to format address for display
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Helper to convert APT to octas
export function aptToOctas(apt: number): bigint {
  return BigInt(Math.floor(apt * 100000000));
}

// Helper to convert octas to APT
export function octasToApt(octas: bigint | number): number {
  return Number(octas) / 100000000;
}

export default aptos;
