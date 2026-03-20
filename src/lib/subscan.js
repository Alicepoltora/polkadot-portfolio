import axios from 'axios';

// Subscan HTTP API — works from browser (CORS enabled on public endpoints)
// No API key needed for basic use; add VITE_SUBSCAN_KEY for higher rate limits

const TIMEOUT = 12000;

function headers() {
  const key = import.meta.env.VITE_SUBSCAN_KEY;
  return {
    'Content-Type': 'application/json',
    ...(key ? { 'X-API-Key': key } : {}),
  };
}

function client(slug) {
  return axios.create({
    baseURL: `https://${slug}.api.subscan.io`,
    timeout: TIMEOUT,
    headers: headers(),
  });
}

// ─── Multichain: get native balances across all Polkadot ecosystem chains ────
// Returns array of { network, symbol, decimal, balance (raw), bonded, unbonding }
export async function fetchMultiChainAccount(address) {
  try {
    const { data } = await axios.post(
      'https://polkadot.api.subscan.io/api/scan/multiChain/account',
      { address },
      { timeout: TIMEOUT, headers: headers() }
    );
    return data?.data ?? [];
  } catch (err) {
    console.warn('[Subscan] multiChain/account error:', err.message);
    return [];
  }
}

// ─── Single-chain account: native balance + staking info ─────────────────────
// Returns { balance, bonded, unbonding, nonce } all as parsed floats
export async function fetchChainAccount(slug, address) {
  try {
    const { data } = await client(slug).post('/api/v2/scan/search', { key: address });
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

// ─── Staking ledger via Subscan ───────────────────────────────────────────────
export async function fetchStakingInfo(slug, address) {
  try {
    const { data } = await client(slug).post('/api/scan/staking/ledger', {
      address,
    });
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

// ─── Network-level staking APY ────────────────────────────────────────────────
export async function fetchStakingAPR(slug = 'polkadot') {
  try {
    // Subscan v2 native staking overview returns avg_return
    const { data } = await client(slug).post('/api/scan/staking/overview', {});
    const apr = data?.data?.avg_return;
    if (apr != null) return parseFloat(apr);
    return null;
  } catch {
    // Fallback: try validator list average
    try {
      const { data } = await client(slug).post('/api/scan/staking/validators', {
        row: 20, page: 0,
      });
      const avg = data?.data?.avg_return ?? data?.data?.avg_apr;
      return avg != null ? parseFloat(avg) : null;
    } catch (err) {
      console.warn(`[Subscan] ${slug} APR error:`, err.message);
      return null;
    }
  }
}

// ─── Token balances on a chain (ERC-20 / pallet-assets) ──────────────────────
export async function fetchTokenBalances(slug, address) {
  try {
    const { data } = await client(slug).post('/api/scan/account/tokens', { address });
    return data?.data ?? {};
  } catch (err) {
    console.warn(`[Subscan] ${slug} token balances error:`, err.message);
    return {};
  }
}

// ─── Reward history ───────────────────────────────────────────────────────────
export async function fetchRewardHistory(slug, address, rows = 20) {
  try {
    const { data } = await client(slug).post('/api/v2/scan/account/reward_slash', {
      address, row: rows, page: 0, is_stash: true,
    });
    return data?.data?.list ?? [];
  } catch (err) {
    console.warn(`[Subscan] ${slug} reward history error:`, err.message);
    return [];
  }
}

// Legacy export for backwards-compat
export { fetchStakingAPR as fetchStakingAPRLegacy };
