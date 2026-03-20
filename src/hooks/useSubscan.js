import { useState, useEffect } from 'react';
import { fetchMultiChainAccount, fetchChainAccount } from '../lib/subscan';
import { CHAINS } from '../lib/chains';

/**
 * Maps Subscan network slug → our chain key.
 * Subscan returns slugs like "polkadot", "kusama", "moonbeam", "astar", "acala",
 * "hydration", "phala", "bifrost-polkadot", "assethub-polkadot", etc.
 */
const SLUG_TO_CHAIN = Object.fromEntries(
  Object.values(CHAINS)
    .filter(c => c.subscanSlug)
    .map(c => [c.subscanSlug, c.id])
);

/**
 * Parse a raw balance string from Subscan multichain response.
 * Subscan returns balance as a string representing the value already divided
 * by 10^decimal, e.g. "1234.5678" for 1234.5678 DOT.
 * But for some chains it might be in raw planck form — we handle both by
 * checking if the decimal field is provided and the balance is a large integer.
 */
function parseBalance(rawBalance, decimal) {
  if (rawBalance == null || rawBalance === '') return 0;
  const n = parseFloat(rawBalance);
  if (isNaN(n)) return 0;
  // If the number looks already divided (has decimal point or is small)
  // vs raw planck (huge integer), apply division if needed
  if (decimal && n > 1e9 && !String(rawBalance).includes('.')) {
    return n / Math.pow(10, decimal);
  }
  return n;
}

export function useSubscan(address) {
  const [multiChainData, setMultiChainData] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  useEffect(() => {
    if (!address) { setMultiChainData([]); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      // ── 1. Try the single multichain call first ──────────────────────────
      const raw = await fetchMultiChainAccount(address);

      if (!cancelled && raw.length > 0) {
        const parsed = raw
          .map(item => {
            const chainId = SLUG_TO_CHAIN[item.network];
            if (!chainId) return null;
            const chain = CHAINS[chainId];
            const decimal = item.decimal ?? chain?.decimals ?? 10;
            return {
              chainId,
              chainName: chain?.name ?? item.network,
              symbol:    chain?.symbol ?? item.symbol ?? 'UNKNOWN',
              balance:   parseBalance(item.balance,   decimal),
              bonded:    parseBalance(item.bonded,    decimal),
              unbonding: parseBalance(item.unbonding, decimal),
              locked:    parseBalance(item.lock,      decimal),
              source:    'subscan-multichain',
            };
          })
          .filter(Boolean)
          .filter(c => c.balance > 0 || c.bonded > 0);

        setMultiChainData(parsed);
        if (!cancelled) setLoading(false);
        return;
      }

      // ── 2. Fallback: query each chain individually ───────────────────────
      const chains = Object.values(CHAINS).filter(
        c => c.subscanSlug && c.id !== 'assetHub'
      );

      const results = await Promise.allSettled(
        chains.map(c => fetchChainAccount(c.subscanSlug, address))
      );

      if (cancelled) return;

      const fallback = results
        .map((r, i) => {
          if (r.status !== 'fulfilled' || !r.value) return null;
          const acc   = r.value;
          const chain = chains[i];
          if (acc.balance <= 0 && acc.bonded <= 0) return null;
          return {
            chainId:   chain.id,
            chainName: chain.name,
            symbol:    chain.symbol,
            balance:   acc.balance,
            bonded:    acc.bonded,
            unbonding: acc.unbonding,
            locked:    0,
            source:    'subscan-per-chain',
          };
        })
        .filter(Boolean);

      setMultiChainData(fallback);
      if (fallback.length === 0) {
        setError('No on-chain data found for this address');
      }
      setLoading(false);
    }

    fetchAll().catch(err => {
      if (!cancelled) {
        console.warn('[useSubscan] error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [address]);

  const getChainBalance = (chainId) =>
    multiChainData.find(d => d.chainId === chainId) ?? null;

  return { multiChainData, loading, error, getChainBalance };
}
