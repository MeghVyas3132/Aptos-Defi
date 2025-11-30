'use client';

import { PriceProvider } from '@/context/PriceContext';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { WalletProvider } from '@/components/WalletProvider';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <WalletProvider>
        <PriceProvider>
          {children}
        </PriceProvider>
      </WalletProvider>
    </ReactQueryProvider>
  );
}
