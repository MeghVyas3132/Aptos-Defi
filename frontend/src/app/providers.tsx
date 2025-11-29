'use client';

import { PriceProvider } from '@/context/PriceContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PriceProvider>
      {children}
    </PriceProvider>
  );
}
