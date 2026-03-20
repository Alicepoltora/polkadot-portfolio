import { useState, useEffect } from 'react';
import { fetchMultiChainAccount, fetchChainAccount } from '../lib/subscan';
import { CHAINS } from '../lib/chains';

/**
 * Maps Subscan network slug → our chain key.
 * Subscan multichain API returns various slugs — including legacy names like
 * "statemint" (Asset Hub Polkadot), "statemine" (Asset Hub Kusama), etc.
 */
const SLUG_TO_CHAIN = {
  // Auto-generate from chains config
  ...Object.fromEntries(
    Object.values(CHAINS)
      .filter(c => c.subscanSlug)
      .map(c => [c.subscanSlug, c.id])
  ),
  // Legacy / alternative Subscan slugs
  statemint:          'assetHub',   // Asset Hub Polkadot (old name)
  'assethub-polkadot':'assetHub',
  statemine:          'kusama',     // Asset Hub Kusama tokens (map to kusama chain)
  'people-polkadot':  null,         // skip People chain (no relevant token)
  'people-kusama':    null,
  'bridge-hub-polkadot': null,
  'coretime-polkadot': null,
  // Parachain slugs Subscan uses
  moonbeam:           'moonbeam',
  astar:              'astar',
  acala:              'acala',
  hydration:          'hydration',
  phala:              'phala',
  bifrost:            'bifrost',
  'bifrost-polkadot': 'bifrost',
};

/**
 * Parse a raw balance string from Subscan multichain response.
 * The multichain API returns balances as raw planck strings (integers).
 * e.g. "118453959446566" for DOT (decimal=10) → 11845.395945 DOT
 * Also handles pre-formatted strings like "1247.9428" (returned by some endpoints).
 */
function parseBalance(rawBalance, decimal) {
  if (rawBalance == null || rawBalance === '' || rawBalance === '0') return 0;
  const s = String(rawBalance);
  const n = parseFloat(s);
  if (isNaN(n) || n === 0) return 0;
  // If it's a large integer (no decimal point and > 1 million), treat as planck
  if (!s.includes('.') && n > 1_000_000 && decimal) {
    return n / Math.pow(10, decimal);
  }
  // Already in natural units
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
        // Subscan can return multiple entries for same network (e.g. statemint appears
        // once per token: DOT, DED, TSN, etc.)
        // Group native chain tokens separately from Asset Hub tokens.
        const parsed = raw
          .map(item => {
            const chainId = SLUG_TO_CHAIN[item.network];
            if (chainId === null) return null;      // explicitly skipped
            if (chainId === undefined) return null; // unknown slug

            const chain = CHAINS[chainId];
            const decimal = item.decimal ?? chain?.decimals ?? 10;
            const symbol  = item.symbol ?? chain?.symbol ?? 'DOT';

            // For "statemint" entries: only keep the chain's native token (DOT)
            // and ignore other Asset Hub tokens (DED, TSN, etc.) here.
            // Those should be fetched via the Asset Hub specific API instead.
            if ((item.network === 'statemint' || item.network === 'assethub-polkadot')
                && symbol !== 'DOT') {
              return null;
            }

            return {
              chainId,
              chainName: chain?.name ?? item.network,
              symbol,
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
