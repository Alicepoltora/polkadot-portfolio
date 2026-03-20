import { useState, useEffect } from 'react';
import { fetchMultiChainAccount, fetchTokenBalances } from '../lib/subscan';
import { CHAINS } from '../lib/chains';

export function useSubscan(address) {
  const [multiChainData, setMultiChainData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Try multichain API first
        const multiChain = await fetchMultiChainAccount(address);

        // Map to our chain format
        const formatted = multiChain
          .map((item) => {
            const chainKey = Object.keys(CHAINS).find(
              (k) => CHAINS[k].subscanSlug === item.network
            );
            if (!chainKey) return null;
            const chain = CHAINS[chainKey];
            return {
              chainId: chainKey,
              chainName: chain.name,
              symbol: chain.symbol,
              balance: parseFloat(item.balance || 0),
              locked: parseFloat(item.lock || 0),
              bonded: parseFloat(item.bonded || 0),
              unbonding: parseFloat(item.unbonding || 0),
              source: 'subscan-multichain',
            };
          })
          .filter(Boolean);

        if (!cancelled) {
          setMultiChainData(formatted);
        }
      } catch (err) {
        console.warn('Subscan multichain fetch error:', err.message);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [address]);

  /**
   * Get balance for a specific chain from multichain data
   */
  const getChainBalance = (chainId) => {
    return multiChainData.find((d) => d.chainId === chainId) || null;
  };

  return { multiChainData, loading, error, getChainBalance };
}
