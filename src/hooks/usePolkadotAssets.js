import { useState, useEffect, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { planckToFloat } from '../lib/format';
import { CHAINS } from '../lib/chains';

const CONNECTION_TIMEOUT = 15000;

export function usePolkadotAssets(address) {
  const [dotBalance, setDotBalance] = useState(null);
  const [assetHubTokens, setAssetHubTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiRef = useRef(null);
  const assetHubApiRef = useRef(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    async function fetchAssets() {
      setLoading(true);
      setError(null);

      // --- Polkadot relay chain ---
      try {
        const provider = new WsProvider(CHAINS.polkadot.rpc, 1000, {}, CONNECTION_TIMEOUT);
        const api = await Promise.race([
          ApiPromise.create({ provider }),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('Polkadot RPC timeout')), CONNECTION_TIMEOUT)
          ),
        ]);

        if (!cancelled) {
          apiRef.current = api;
          const { data: { free, frozen } } = await api.query.system.account(address);
          const freeFloat = planckToFloat(free.toBigInt(), CHAINS.polkadot.decimals);
          setDotBalance(freeFloat);
        }
      } catch (err) {
        console.warn('Polkadot relay chain fetch error:', err.message);
        if (!cancelled) setError(`Relay chain: ${err.message}`);
      }

      // --- Asset Hub ---
      try {
        const ahProvider = new WsProvider(CHAINS.assetHub.rpc, 1000, {}, CONNECTION_TIMEOUT);
        const ahApi = await Promise.race([
          ApiPromise.create({ provider: ahProvider }),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('Asset Hub RPC timeout')), CONNECTION_TIMEOUT)
          ),
        ]);

        if (!cancelled) {
          assetHubApiRef.current = ahApi;
          const tokens = await fetchAssetHubTokens(ahApi, address);
          setAssetHubTokens(tokens);
        }
      } catch (err) {
        console.warn('Asset Hub fetch error:', err.message);
      }

      if (!cancelled) setLoading(false);
    }

    fetchAssets();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.disconnect().catch(() => {});
        apiRef.current = null;
      }
      if (assetHubApiRef.current) {
        assetHubApiRef.current.disconnect().catch(() => {});
        assetHubApiRef.current = null;
      }
    };
  }, [address]);

  return { dotBalance, assetHubTokens, loading, error };
}

async function fetchAssetHubTokens(api, address) {
  const assets = CHAINS.assetHub.assets;
  const results = [];

  for (const asset of assets) {
    try {
      const result = await api.query.assets.account(asset.id, address);
      if (result.isSome) {
        const assetAccount = result.unwrap();
        const balance = planckToFloat(assetAccount.balance.toBigInt(), asset.decimals);
        if (balance > 0) {
          results.push({
            ...asset,
            balance,
            chain: 'assetHub',
          });
        }
      }
    } catch (err) {
      console.warn(`Asset Hub token ${asset.symbol} error:`, err.message);
    }
  }

  return results;
}
