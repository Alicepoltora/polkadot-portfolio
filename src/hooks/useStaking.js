import { useState, useEffect } from 'react';
import { fetchStakingInfo, fetchChainAccount, fetchStakingAPR, fetchRewardHistory } from '../lib/subscan';
import { CHAINS } from '../lib/chains';

// Known approximate APRs as last-resort fallback
const FALLBACK_APR = { polkadot: 14.5, kusama: 17.0 };

export function useStaking(address) {
  const [staking,  setStaking]  = useState(null);
  const [apr,      setApr]      = useState(null);
  const [rewards,  setRewards]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!address) { setStaking(null); setApr(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        // ── Fetch staking data and APR in parallel ───────────────────────
        const [ledger, account, aprValue, rewardList] = await Promise.all([
          fetchStakingInfo('polkadot', address),
          fetchChainAccount('polkadot', address),
          fetchStakingAPR('polkadot'),
          fetchRewardHistory('polkadot', address, 10),
        ]);

        if (cancelled) return;

        // Combine ledger + account to build staking object
        let stakingData = null;

        if (ledger && (ledger.bonded > 0 || ledger.total > 0)) {
          stakingData = ledger;
        } else if (account && account.bonded > 0) {
          // Some stash accounts: staking info lives in account search result
          stakingData = {
            bonded:    account.bonded,
            total:     account.bonded + account.unbonding,
            unbonding: account.unbonding,
            claimable: 0,
          };
        }
        // If still nothing found, the address simply isn't staking
        setStaking(stakingData);

        // APR: live from Subscan, else fallback
        setApr(aprValue ?? FALLBACK_APR.polkadot);

        // Reward history
        if (rewardList?.length) {
          setRewards(
            rewardList.map(r => ({
              era:    r.era,
              amount: parseFloat(r.amount ?? 0) / Math.pow(10, CHAINS.polkadot.decimals),
              time:   r.block_timestamp,
            }))
          );
        }
      } catch (err) {
        console.warn('[useStaking] error:', err.message);
        if (!cancelled) {
          setError(err.message);
          setApr(FALLBACK_APR.polkadot);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();

    return () => { cancelled = true; };
  }, [address]);

  return { staking, apr, rewards, loading, error };
}
