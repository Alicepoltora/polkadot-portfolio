import { useState, useEffect, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { planckToFloat } from '../lib/format';
import { fetchChainAccount, fetchTokenBalances } from '../lib/subscan';
import { CHAINS } from '../lib/chains';

const WS_TIMEOUT = 20000;

export function usePolkadotAssets(address) {
  const [dotBalance,      setDotBalance]      = useState(null);
  const [assetHubTokens,  setAssetHubTokens]  = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);
  const apiRef       = useRef(null);
  const ahApiRef     = useRef(null);

  useEffect(() => {
    if (!address) {
      setDotBalance(null);
      setAssetHubTokens([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      // ── Strategy: try Subscan HTTP first (fast), then fall back to WS ──

      // 1. DOT balance via Subscan
      let dotFetched = false;
      try {
        const acc = await fetchChainAccount('polkadot', address);
        if (acc && !cancelled) {
          setDotBalance(acc.balance);
          dotFetched = true;
        }
      } catch (err) {
        console.warn('[usePolkadotAssets] Subscan DOT error:', err.message);
      }

      // 2. Asset Hub token balances via Subscan tokens API
      let ahFetched = false;
      try {
        const tokenData = await fetchTokenBalances('assethub-polkadot', address);
        const native = tokenData?.native ?? [];
        if (Array.isArray(native) && native.length > 0 && !cancelled) {
          const mapped = native
            .map(t => {
              const assetDef = CHAINS.assetHub.assets.find(
                a => a.symbol === t.symbol || a.id === t.asset_id
              );
              const decimals = assetDef?.decimals ?? parseInt(t.decimals ?? 6);
              const balance = parseFloat(t.balance ?? 0) / Math.pow(10, decimals);
              if (balance <= 0) return null;
              return {
                id:         assetDef?.id ?? t.asset_id,
                symbol:     t.symbol,
                name:       t.symbol,
                decimals,
                balance,
                coingeckoId: assetDef?.coingeckoId ?? null,
              };
            })
            .filter(Boolean);
          setAssetHubTokens(mapped);
          ahFetched = true;
        }
      } catch (err) {
        console.warn('[usePolkadotAssets] Subscan AssetHub error:', err.message);
      }

      if (cancelled) return;

      // 3. Fallback to WebSocket if Subscan failed
      if (!dotFetched) {
        try {
          const provider = new WsProvider(CHAINS.polkadot.rpc, 1000, {}, WS_TIMEOUT);
          const api = await Promise.race([
            ApiPromise.create({ provider }),
            new Promise((_, rej) =>
              setTimeout(() => rej(new Error('Polkadot WS timeout')), WS_TIMEOUT)
            ),
          ]);
          if (!cancelled) {
            apiRef.current = api;
            const { data: { free } } = await api.query.system.account(address);
            setDotBalance(planckToFloat(free.toBigInt(), CHAINS.polkadot.decimals));
          }
        } catch (err) {
          console.warn('[usePolkadotAssets] WS DOT fallback error:', err.message);
          if (!cancelled) setError(`Could not fetch DOT balance: ${err.message}`);
        }
      }

      // 4. Fallback AssetHub via WS if Subscan failed
      if (!ahFetched) {
        try {
          const ahProvider = new WsProvider(CHAINS.assetHub.rpc, 1000, {}, WS_TIMEOUT);
          const ahApi = await Promise.race([
            ApiPromise.create({ provider: ahProvider }),
            new Promise((_, rej) =>
              setTimeout(() => rej(new Error('AssetHub WS timeout')), WS_TIMEOUT)
            ),
          ]);
          if (!cancelled) {
            ahApiRef.current = ahApi;
            const tokens = await fetchAssetHubViaWS(ahApi, address);
            setAssetHubTokens(tokens);
          }
        } catch (err) {
          console.warn('[usePolkadotAssets] WS AssetHub fallback error:', err.message);
        }
      }

      if (!cancelled) setLoading(false);
    }

    fetchAll();

    return () => {
      cancelled = true;
      apiRef.current?.disconnect().catch(() => {});
      apiRef.current = null;
      ahApiRef.current?.disconnect().catch(() => {});
      ahApiRef.current = null;
    };
  }, [address]);

  return { dotBalance, assetHubTokens, loading, error };
}

async function fetchAssetHubViaWS(api, address) {
  const assets = CHAINS.assetHub.assets;
  const results = [];
  for (const asset of assets) {
    try {
      const result = await api.query.assets.account(asset.id, address);
      if (result.isSome) {
        const balance = planckToFloat(
          result.unwrap().balance.toBigInt(),
          asset.decimals
        );
        if (balance > 0) results.push({ ...asset, balance, chain: 'assetHub' });
      }
    } catch (err) {
      console.warn(`[AssetHub WS] ${asset.symbol} error:`, err.message);
    }
  }
  return results;
}
