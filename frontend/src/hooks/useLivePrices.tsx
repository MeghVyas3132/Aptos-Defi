'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PriceData {
  symbol: string;
  price: number;
  change_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  last_update: string;
  source: string;
  is_stale: boolean;
}

export interface LivePrices {
  [symbol: string]: PriceData;
}

interface PriceUpdateEvent {
  type: 'initial' | 'update' | 'heartbeat';
  prices?: LivePrices;
  symbol?: string;
  price?: PriceData;
  timestamp?: string;
}

export function useLivePrices() {
  const [prices, setPrices] = useState<LivePrices>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      const eventSource = new EventSource('/api/prices/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔌 Connected to live price stream');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: PriceUpdateEvent = JSON.parse(event.data);

          if (data.type === 'initial' && data.prices) {
            // Initial full price list
            setPrices(data.prices);
            setLastUpdate(new Date());
          } else if (data.type === 'update' && data.symbol && data.price) {
            // Single price update
            setPrices((prev) => ({
              ...prev,
              [data.symbol!]: data.price!,
            }));
            setLastUpdate(new Date());
          } else if (data.type === 'heartbeat') {
            // Connection alive
            setLastUpdate(new Date());
          }
        } catch (e) {
          console.error('Failed to parse price update:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Price stream error:', error);
        setIsConnected(false);
        eventSource.close();

        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reconnecting to price stream...');
          connect();
        }, 3000);
      };
    } catch (e) {
      console.error('Failed to connect to price stream:', e);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Helper to get single price
  const getPrice = useCallback(
    (symbol: string): number | null => {
      const data = prices[symbol.toUpperCase()];
      return data ? data.price : null;
    },
    [prices]
  );

  // Helper to get formatted price
  const getFormattedPrice = useCallback(
    (symbol: string): string => {
      const price = getPrice(symbol);
      if (price === null) return '---';
      if (price < 0.01) return `$${price.toFixed(6)}`;
      if (price < 1) return `$${price.toFixed(4)}`;
      if (price < 1000) return `$${price.toFixed(2)}`;
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    },
    [getPrice]
  );

  // Helper to get price change color
  const getPriceChangeColor = useCallback(
    (symbol: string): string => {
      const data = prices[symbol.toUpperCase()];
      if (!data) return 'text-gray-400';
      if (data.change_24h > 0) return 'text-green-400';
      if (data.change_24h < 0) return 'text-red-400';
      return 'text-gray-400';
    },
    [prices]
  );

  return {
    prices,
    isConnected,
    lastUpdate,
    getPrice,
    getFormattedPrice,
    getPriceChangeColor,
    connect,
    disconnect,
  };
}

// Component for displaying a live price
export function LivePrice({
  symbol,
  className = '',
  showChange = false,
}: {
  symbol: string;
  className?: string;
  showChange?: boolean;
}) {
  const { prices, getFormattedPrice, getPriceChangeColor } = useLivePrices();
  const data = prices[symbol.toUpperCase()];

  if (!data) {
    return <span className={`animate-pulse ${className}`}>Loading...</span>;
  }

  return (
    <span className={className}>
      <span className={getPriceChangeColor(symbol)}>{getFormattedPrice(symbol)}</span>
      {showChange && (
        <span className={`ml-1 text-xs ${getPriceChangeColor(symbol)}`}>
          ({data.change_24h >= 0 ? '+' : ''}
          {data.change_24h.toFixed(2)}%)
        </span>
      )}
    </span>
  );
}
