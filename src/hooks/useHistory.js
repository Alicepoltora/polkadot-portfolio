import { useState, useEffect, useCallback } from 'react';
import {
  fetchSubscanTransfers,
  fetchSubscanRewards,
  getEvmAddress,
} from '../lib/history';

/**
 * Chains to fetch transfer history from Subscan.
 * Moonbeam uses the derived EVM address; others use the original SS58.
 */
const TRANSFER_CHAINS = ['polkadot', 'kusama', 'moonbeam', 'astar'];

export function useHistory(address) {
  const [transfers,  setTransfers]  = useState([]);
  const [rewards,    setRewards]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [sources,    setSources]    = useState({});   // { slug: 'ok'|'error'|'nokey'|'empty' }
  const [hasSubscan, setHasSubscan] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setSources({});
    setTransfers([]);
    setRewards([]);

    const key = import.meta.env.VITE_SUBSCAN_KEY;
    const hasKey = !!key;
    setHasSubscan(hasKey);

    if (!hasKey) {
      // No API key — mark all sources as nokey and bail
      const nokey = {};
      TRANSFER_CHAINS.forEach(s => { nokey[s] = 'nokey'; });
      setSources(nokey);
      setLoading(false);
      return;
    }

    // Derive EVM address once (for Moonbeam, which indexes by H160)
    const evmAddress = await getEvmAddress(address);

    const results      = [];
    const rewardResult = [];
    const srcMap       = {};

    // Fetch all chains in parallel
    await Promise.all(
      TRANSFER_CHAINS.map(async (slug) => {
        // Moonbeam indexes transactions by EVM H160; use it if available
        const queryAddr = (slug === 'moonbeam' && evmAddress) ? evmAddress : address;
        const res = await fetchSubscanTransfers(slug, queryAddr, 0, 30);

        if (res.error) {
          srcMap[slug] = 'error';
          console.warn(`[history] ${slug} error:`, res.error);
        } else if (res.transfers.length === 0) {
          srcMap[slug] = 'empty';
        } else {
          srcMap[slug] = 'ok';
          results.push(...res.transfers);
        }
      })
    );

    // Staking rewards: polkadot + kusama
    await Promise.all(
      ['polkadot', 'kusama'].map(async (slug) => {
        const res = await fetchSubscanRewards(slug, address, 0, 30);
        if (res.rewards?.length > 0) {
          rewardResult.push(...res.rewards);
        }
      })
    );

    // Sort all by timestamp desc
    const sorted        = [...results].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const sortedRewards = [...rewardResult].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    setTransfers(sorted);
    setRewards(sortedRewards);
    setSources(srcMap);
    setLoading(false);
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  return { transfers, rewards, loading, sources, hasSubscan, reload: load };
}
