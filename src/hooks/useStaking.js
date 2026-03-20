import { useState, useEffect, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { planckToFloat } from '../lib/format';
import { CHAINS } from '../lib/chains';
import { fetchStakingAPR } from '../lib/subscan';

const CONNECTION_TIMEOUT = 15000;

export function useStaking(address) {
  const [staking, setStaking] = useState(null);
  const [apr, setApr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    async function fetchStaking() {
      setLoading(true);
      setError(null);

      try {
        const provider = new WsProvider(CHAINS.polkadot.rpc, 1000, {}, CONNECTION_TIMEOUT);
        const api = await Promise.race([
          ApiPromise.create({ provider }),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('Staking RPC timeout')), CONNECTION_TIMEOUT)
          ),
        ]);

        if (!cancelled) {
          apiRef.current = api;

          // Get staking ledger
          const ledger = await api.query.staking.ledger(address);
          let stakingData = null;

          if (ledger.isSome) {
            const l = ledger.unwrap();
            const bonded = planckToFloat(l.active.toBigInt(), CHAINS.polkadot.decimals);
            const total = planckToFloat(l.total.toBigInt(), CHAINS.polkadot.decimals);

            // Unbonding chunks
            const unbondingChunks = l.unlocking.map((chunk) => ({
              value: planckToFloat(chunk.value.toBigInt(), CHAINS.polkadot.decimals),
              era: chunk.era.toNumber(),
            }));
            const unbonding = unbondingChunks.reduce((sum, c) => sum + c.value, 0);

            // Claimable rewards via derive
            let claimable = 0;
            try {
              const stakingInfo = await api.derive.staking.account(address);
              const rewards = stakingInfo?.rewardDestination;
              // redeemable
              if (stakingInfo?.redeemable) {
                claimable = planckToFloat(
                  stakingInfo.redeemable.toBigInt(),
                  CHAINS.polkadot.decimals
                );
              }
            } catch (err) {
              console.warn('Staking derive error:', err.message);
            }

            stakingData = {
              bonded,
              total,
              unbonding,
              unbondingChunks,
              claimable,
            };
          }

          setStaking(stakingData);

          // Fetch APR from Subscan
          const aprValue = await fetchStakingAPR('polkadot');
          if (!cancelled) {
            // Subscan returns avg APR for the network; fallback to known avg
            setApr(aprValue !== null ? aprValue : 14.5);
          }
        }
      } catch (err) {
        console.warn('Staking fetch error:', err.message);
        if (!cancelled) {
          setError(err.message);
          // Set fallback APR
          setApr(14.5);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStaking();

    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.disconnect().catch(() => {});
        apiRef.current = null;
      }
    };
  }, [address]);

  return { staking, apr, loading, error };
}
