import axios from 'axios';

const TIMEOUT = 12000;

/**
 * Route all Subscan requests through /api/subscan proxy to avoid CORS.
 * The proxy runs as a Vercel serverless function and adds the X-API-Key header.
 */
async function subscanProxy(slug, path, payload = {}) {
  const key = import.meta.env.VITE_SUBSCAN_KEY;

  try {
    // Production / Vercel preview — use serverless proxy
    const { data } = await axios.post(
      '/api/subscan',
      { slug, path, payload },
      { timeout: TIMEOUT, headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch {
    // Fallback: direct call (dev without vercel dev, or if proxy returns non-2xx)
    if (!key) throw new Error('No Subscan API key and proxy unavailable');
    const { data } = await axios.post(
      `https://${slug}.api.subscan.io${path}`,
      payload,
      {
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      }
    );
    return data;
  }
}

// ─── Multichain: native balances across all Polkadot ecosystem chains ────────
export async function fetchMultiChainAccount(address) {
  try {
    const data = await subscanProxy('polkadot', '/api/scan/multiChain/account', { address });
    return data?.data ?? [];
  } catch (err) {
    console.warn('[Subscan] multiChain/account error:', err.message);
    return [];
  }
}

// ─── Single-chain account: native balance + staking info ─────────────────────
export async function fetchChainAccount(slug, address) {
  try {
    const data = await subscanProxy(slug, '/api/v2/scan/search', { key: address });
    const acc = data?.data?.account;
    if (!acc) return null;
    return {
      balance:   parseFloat(acc.balance   ?? acc.ring_balance ?? 0),
      bonded:    parseFloat(acc.bonded    ?? 0),
      unbonding: parseFloat(acc.unbonding ?? 0),
      nonce:     acc.nonce ?? 0,
    };
  } catch (err) {
    console.warn(`[Subscan] ${slug} account error:`, err.message);
    return null;
  }
}

// ─── Staking ledger ───────────────────────────────────────────────────────────
export async function fetchStakingInfo(slug, address) {
  try {
    const data = await subscanProxy(slug, '/api/scan/staking/ledger', { address });
    const ledger = data?.data;
    if (!ledger) return null;
    return {
      bonded:    parseFloat(ledger.active     ?? 0),
      total:     parseFloat(ledger.total      ?? 0),
      unbonding: parseFloat(ledger.unlocking  ?? 0),
      claimable: parseFloat(ledger.redeemable ?? 0),
    };
  } catch (err) {
    console.warn(`[Subscan] ${slug} staking ledger error:`, err.message);
    return null;
  }
}

// ─── Network staking APY ──────────────────────────────────────────────────────
export async function fetchStakingAPR(slug = 'polkadot') {
  try {
    const data = await subscanProxy(slug, '/api/scan/staking/overview', {});
    const apr = data?.data?.avg_return;
    if (apr != null) return parseFloat(apr);
    return null;
  } catch {
    try {
      const data = await subscanProxy(slug, '/api/scan/staking/validators', { row: 20, page: 0 });
      const avg = data?.data?.avg_return ?? data?.data?.avg_apr;
      return avg != null ? parseFloat(avg) : null;
    } catch (err) {
      console.warn(`[Subscan] ${slug} APR error:`, err.message);
      return null;
    }
  }
}

// ─── Token balances (pallet-assets / ERC-20) ──────────────────────────────────
export async function fetchTokenBalances(slug, address) {
  try {
    const data = await subscanProxy(slug, '/api/scan/account/tokens', { address });
    return data?.data ?? {};
  } catch (err) {
    console.warn(`[Subscan] ${slug} token balances error:`, err.message);
    return {};
  }
}

// ─── Reward history ───────────────────────────────────────────────────────────
export async function fetchRewardHistory(slug, address, rows = 20) {
  try {
    const data = await subscanProxy(slug, '/api/v2/scan/account/reward_slash', {
      address, row: rows, page: 0, is_stash: true,
    });
    return data?.data?.list ?? [];
  } catch (err) {
    console.warn(`[Subscan] ${slug} reward history error:`, err.message);
    return [];
  }
}
