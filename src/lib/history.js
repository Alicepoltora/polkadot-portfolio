import axios from 'axios';
import { ethers } from 'ethers';

const TIMEOUT = 15000;

/**
 * Symbol/decimals per Subscan slug.
 * Subscan /v2/scan/transfers returns amounts already in natural units.
 */
const SLUG_META = {
  polkadot: { symbol: 'DOT',  decimals: 10 },
  kusama:   { symbol: 'KSM',  decimals: 12 },
  moonbeam: { symbol: 'GLMR', decimals: 18 },
  astar:    { symbol: 'ASTR', decimals: 18 },
  acala:    { symbol: 'ACA',  decimals: 12 },
};

/**
 * Call Subscan through our own serverless proxy (/api/subscan) to avoid CORS.
 * Falls back to a direct call if proxy unavailable (dev mode).
 */
async function subscanPost(slug, path, payload) {
  // In production use the proxy; in local dev check for direct key
  const key = import.meta.env.VITE_SUBSCAN_KEY;

  // Try proxy first (works in both dev and prod, no CORS)
  try {
    const { data } = await axios.post(
      '/api/subscan',
      { slug, path, payload },
      { timeout: TIMEOUT, headers: { 'Content-Type': 'application/json' } }
    );
    return data;
  } catch (proxyErr) {
    // Proxy not available (e.g., running plain `vite dev` without vercel dev)
    // Fall back to direct call (only works if CORS is not blocked)
    if (!key) throw proxyErr;
    const { data } = await axios.post(
      `https://${slug}.api.subscan.io${path}`,
      payload,
      { timeout: TIMEOUT, headers: { 'Content-Type': 'application/json', 'X-API-Key': key } }
    );
    return data;
  }
}

// ─── Subscan transfer history ─────────────────────────────────────────────────
export async function fetchSubscanTransfers(slug, address, page = 0, rows = 25) {
  try {
    const data = await subscanPost(slug, '/api/v2/scan/transfers', { address, row: rows, page });
    if (data?.code !== 0) return { transfers: [], count: 0, error: data?.message };

    const meta = SLUG_META[slug] ?? { symbol: 'DOT', decimals: 10 };

    const transfers = (data?.data?.transfers ?? []).map(t => {
      const rawAmt = parseFloat(t.amount ?? 0);
      // Guard against planck form (large integer, no decimal point)
      const amount = (rawAmt > 1e8 && !String(t.amount ?? '').includes('.'))
        ? rawAmt / Math.pow(10, meta.decimals)
        : rawAmt;
      return {
        id:        t.hash || t.extrinsic_index,
        hash:      t.hash,
        from:      t.from,
        to:        t.to,
        amount,
        symbol:    t.asset_symbol || t.symbol || meta.symbol,
        fee:       parseFloat(t.fee ?? 0),
        success:   t.success !== false,
        timestamp: (t.block_timestamp ?? 0) * 1000,
        blockNum:  t.block_num,
        chain:     slug,
        type:      (t.from ?? '').toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
        source:    'subscan',
      };
    });
    return { transfers, count: data?.data?.count ?? 0 };
  } catch (err) {
    return { transfers: [], count: 0, error: err.message };
  }
}

// ─── Subscan staking reward history ──────────────────────────────────────────
export async function fetchSubscanRewards(slug, address, page = 0, rows = 25) {
  try {
    const data = await subscanPost(slug, '/api/v2/scan/account/reward_slash', {
      address, row: rows, page, is_stash: true,
    });
    if (data?.code !== 0) return { rewards: [], count: 0 };

    const meta = SLUG_META[slug] ?? { symbol: 'DOT', decimals: 10 };
    const rewards = (data?.data?.list ?? []).map(r => {
      const rawAmount = parseFloat(r.amount ?? 0);
      // Rewards come in planck form from Subscan
      const amount = (rawAmount > 1e6 && !String(r.amount ?? '').includes('.'))
        ? rawAmount / Math.pow(10, meta.decimals)
        : rawAmount;
      return {
        id:        `${r.extrinsic_index || r.event_index}`,
        hash:      r.extrinsic_hash,
        amount,
        symbol:    meta.symbol,
        era:       r.era,
        timestamp: (r.block_timestamp ?? 0) * 1000,
        blockNum:  r.block_num,
        chain:     slug,
        type:      'reward',
        source:    'subscan',
        success:   true,
        from:      'Staking',
        to:        address,
      };
    });
    return { rewards, count: data?.data?.count ?? 0 };
  } catch (err) {
    return { rewards: [], count: 0 };
  }
}

// ─── Derive EVM address from SS58 ─────────────────────────────────────────────
export async function getEvmAddress(address) {
  if (!address) return null;
  if (address.startsWith('0x') && address.length === 42) return address.toLowerCase();
  try {
    const { decodeAddress } = await import('@polkadot/util-crypto');
    const bytes = decodeAddress(address);
    // Moonbeam/Astar unified accounts: last 20 bytes of 32-byte pubkey
    return ethers.hexlify(bytes.slice(12)).toLowerCase();
  } catch {
    return null;
  }
}
