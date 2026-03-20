import { useState, useEffect, useCallback } from 'react';
import {
  fetchSubscanTransfers,
  fetchSubscanRewards,
  fetchMoonscanHistory,
  fetchAstarHistory,
  getEvmAddress,
} from '../lib/history';

export function useHistory(address) {
  const [transfers,  setTransfers]  = useState([]);
  const [rewards,    setRewards]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [sources,    setSources]    = useState({});   // { chainSlug: 'ok'|'error'|'nokey' }
  const [hasSubscan, setHasSubscan] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setSources({});

    const key = import.meta.env.VITE_SUBSCAN_KEY;
    setHasSubscan(!!key);

    const results = [];
    const rewardResults = [];
    const srcMap = {};

    // ── 1. Polkadot transfers (Subscan, requires key) ──────────────────────
    if (key) {
      const dotResult = await fetchSubscanTransfers('polkadot', address, 0, 30);
      if (dotResult.error) {
        srcMap.polkadot = 'error';
      } else {
        srcMap.polkadot = 'ok';
        results.push(...dotResult.transfers);
      }

      const ksmResult = await fetchSubscanTransfers('kusama', address, 0, 15);
      if (!ksmResult.error) {
        srcMap.kusama = 'ok';
        results.push(...ksmResult.transfers);
      }

      // Staking rewards
      const rewardResult = await fetchSubscanRewards('polkadot', address, 0, 30);
      if (!rewardResult.error) {
        rewardResults.push(...rewardResult.rewards);
      }
    } else {
      srcMap.polkadot = 'nokey';
      srcMap.kusama   = 'nokey';
    }

    // ── 2. EVM chains (no API key needed from browser) ─────────────────────
    const evmAddress = await getEvmAddress(address);

    if (evmAddress) {
      const [moonTxs, astarTxs] = await Promise.all([
        fetchMoonscanHistory(evmAddress, 1, 25),
        fetchAstarHistory(evmAddress, 0, 25),
      ]);

      if (moonTxs.length > 0) {
        srcMap.moonbeam = 'ok';
        results.push(...moonTxs);
      } else {
        srcMap.moonbeam = 'empty';
      }

      if (astarTxs.length > 0) {
        srcMap.astar = 'ok';
        results.push(...astarTxs);
      } else {
        srcMap.astar = 'empty';
      }
    }

    // ── Sort all by timestamp desc ─────────────────────────────────────────
    const sorted = [...results].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const sortedRewards = [...rewardResults].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

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
