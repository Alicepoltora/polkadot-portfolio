import { useState, useEffect } from 'react';
import axios from 'axios';
import { COINGECKO_IDS } from '../lib/chains';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// Fallback prices in case CoinGecko is rate-limited
const FALLBACK_PRICES = {
  polkadot: 7.82,
  kusama: 22.15,
  moonbeam: 0.12,
  astar: 0.058,
  acala: 0.035,
  tether: 1.0,
  'usd-coin': 1.0,
};

export function usePrices() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        const ids = COINGECKO_IDS.join(',');
        const { data } = await axios.get(`${COINGECKO_URL}/simple/price`, {
          params: {
            ids,
            vs_currencies: 'usd',
            include_24hr_change: true,
          },
          timeout: 8000,
        });

        if (!cancelled) {
          const priceMap = {};
          Object.entries(data).forEach(([id, info]) => {
            priceMap[id] = {
              usd: info.usd,
              change24h: info.usd_24h_change || 0,
            };
          });
          setPrices(priceMap);
          setUsingFallback(false);
        }
      } catch (err) {
        console.warn('CoinGecko price fetch failed, using fallback prices:', err.message);
        if (!cancelled) {
          // Use fallback prices
          const fallback = {};
          Object.entries(FALLBACK_PRICES).forEach(([id, usd]) => {
            fallback[id] = { usd, change24h: 0 };
          });
          setPrices(fallback);
          setUsingFallback(true);
          setError('Using estimated prices (live feed unavailable)');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPrices();

    // Refresh every 60 seconds
    const interval = setInterval(fetchPrices, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getPrice = (coingeckoId) => {
    if (!coingeckoId) return 0;
    return prices[coingeckoId]?.usd || FALLBACK_PRICES[coingeckoId] || 0;
  };

  const getChange = (coingeckoId) => {
    if (!coingeckoId) return 0;
    return prices[coingeckoId]?.change24h || 0;
  };

  return { prices, loading, error, usingFallback, getPrice, getChange };
}
