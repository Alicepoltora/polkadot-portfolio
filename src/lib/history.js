import axios from 'axios';
import { ethers } from 'ethers';

const TIMEOUT = 12000;

// ─── Subscan transfer history (requires API key for transfers endpoint) ────────
export async function fetchSubscanTransfers(slug, address, page = 0, rows = 25) {
  const key = import.meta.env.VITE_SUBSCAN_KEY;
  try {
    const { data } = await axios.post(
      `https://${slug}.api.subscan.io/api/v2/scan/transfers`,
      { address, row: rows, page },
      { timeout: TIMEOUT, headers: { 'Content-Type': 'application/json', ...(key ? { 'X-API-Key': key } : {}) } }
    );
    if (data?.code !== 0) return { transfers: [], count: 0, error: data?.message };
    // Transfer amounts: Subscan returns natural unit strings (e.g. "1000" = 1000 DOT)
    const decimals = slug === 'kusama' ? 12 : 10;
    const transfers = (data?.data?.transfers ?? []).map(t => {
      const rawAmt = parseFloat(t.amount ?? 0);
      // Apply planck conversion only if it looks like a raw integer
      const amount = (rawAmt > 1e8 && !String(t.amount ?? '').includes('.'))
        ? rawAmt / Math.pow(10, decimals)
        : rawAmt;
      return {
        id:        t.hash || t.extrinsic_index,
        hash:      t.hash,
        from:      t.from,
        to:        t.to,
        amount,
        symbol:    t.asset_symbol || t.symbol || (slug === 'kusama' ? 'KSM' : 'DOT'),
        fee:       parseFloat(t.fee ?? 0),
        success:   t.success !== false,
        timestamp: t.block_timestamp * 1000,
        blockNum:  t.block_num,
        chain:     slug,
        type:      t.from?.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
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
  const key = import.meta.env.VITE_SUBSCAN_KEY;
  try {
    const { data } = await axios.post(
      `https://${slug}.api.subscan.io/api/v2/scan/account/reward_slash`,
      { address, row: rows, page, is_stash: true },
      { timeout: TIMEOUT, headers: { 'Content-Type': 'application/json', ...(key ? { 'X-API-Key': key } : {}) } }
    );
    if (data?.code !== 0) return { rewards: [], count: 0 };
    // Reward amounts are returned in planck (raw integer strings)
    // DOT has 10 decimals, KSM has 12 — use slug to determine
    const decimals = slug === 'kusama' ? 12 : 10;
    const rewards = (data?.data?.list ?? []).map(r => {
      const rawAmount = parseFloat(r.amount ?? 0);
      // If amount looks like planck (very large integer with no decimal), convert
      const amount = (rawAmount > 1e6 && !String(r.amount ?? '').includes('.'))
        ? rawAmount / Math.pow(10, decimals)
        : rawAmount;
      return {
        id:        `${r.extrinsic_index || r.event_index}`,
        hash:      r.extrinsic_hash,
        amount,
        symbol:    slug === 'kusama' ? 'KSM' : 'DOT',
        era:       r.era,
        timestamp: r.block_timestamp * 1000,
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

// ─── Moonscan (Etherscan-compatible) for Moonbeam EVM ─────────────────────────
export async function fetchMoonscanHistory(evmAddress, page = 1, offset = 25) {
  try {
    const { data } = await axios.get('https://moonbeam.moonscan.io/api', {
      timeout: TIMEOUT,
      params: {
        module: 'account',
        action: 'txlist',
        address: evmAddress,
        page,
        offset,
        sort: 'desc',
        apikey: 'YourApiKeyToken', // free tier works without key on moonscan
      },
    });
    const txs = Array.isArray(data?.result) ? data.result : [];
    return txs.map(t => ({
      id:        t.hash,
      hash:      t.hash,
      from:      t.from,
      to:        t.to,
      amount:    parseFloat(ethers.formatEther(t.value || '0')),
      symbol:    'GLMR',
      fee:       parseFloat(ethers.formatEther(BigInt(t.gas || 0) * BigInt(t.gasPrice || 0) + 'n')) || 0,
      success:   t.isError === '0',
      timestamp: parseInt(t.timeStamp) * 1000,
      blockNum:  parseInt(t.blockNumber),
      chain:     'moonbeam',
      type:      t.from?.toLowerCase() === evmAddress.toLowerCase() ? 'send' : 'receive',
      method:    t.functionName ? t.functionName.split('(')[0] : '',
      source:    'moonscan',
    }));
  } catch (err) {
    console.warn('[fetchMoonscanHistory]', err.message);
    return [];
  }
}

// ─── Astar Blockscout for Astar EVM ──────────────────────────────────────────
export async function fetchAstarHistory(evmAddress, page = 0, limit = 25) {
  try {
    const { data } = await axios.get(
      `https://astar.blockscout.com/api/v2/addresses/${evmAddress}/transactions`,
      {
        timeout: TIMEOUT,
        params: { filter: 'to|from', limit, page },
      }
    );
    const items = data?.items ?? [];
    return items.map(t => ({
      id:        t.hash,
      hash:      t.hash,
      from:      t.from?.hash ?? t.from,
      to:        t.to?.hash ?? t.to,
      amount:    parseFloat(ethers.formatEther(t.value || '0')),
      symbol:    'ASTR',
      fee:       parseFloat(ethers.formatEther(BigInt(t.fee?.value || '0'))),
      success:   t.status === 'ok',
      timestamp: new Date(t.timestamp).getTime(),
      blockNum:  t.block,
      chain:     'astar',
      type:      t.from?.hash?.toLowerCase() === evmAddress.toLowerCase() ? 'send' : 'receive',
      method:    t.method ?? '',
      source:    'blockscout',
    }));
  } catch (err) {
    console.warn('[fetchAstarHistory]', err.message);
    return [];
  }
}

// ─── Derive EVM address from SS58 ────────────────────────────────────────────
export async function getEvmAddress(address) {
  if (address?.startsWith('0x') && address.length === 42) return address;
  try {
    const { decodeAddress } = await import('@polkadot/util-crypto');
    const bytes = decodeAddress(address);
    return ethers.hexlify(bytes.slice(12));
  } catch {
    return null;
  }
}
