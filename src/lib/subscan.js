import axios from 'axios';

// Subscan API wrapper
// Docs: https://support.subscan.io/

const SUBSCAN_BASE = 'https://polkadot.api.subscan.io';
const TIMEOUT = 10000;

// Create axios instance per network
function createClient(network) {
  return axios.create({
    baseURL: `https://${network}.api.subscan.io`,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      // Add your API key here for higher rate limits:
      // 'X-API-Key': import.meta.env.VITE_SUBSCAN_API_KEY || '',
    },
  });
}

/**
 * Fetch account summary for a given address on a specific network
 */
export async function fetchAccountSummary(network, address) {
  const client = createClient(network);
  try {
    const { data } = await client.post('/api/v2/scan/search', {
      key: address,
      row: 1,
      page: 0,
    });
    return data?.data || null;
  } catch (err) {
    console.warn(`Subscan ${network} account error:`, err.message);
    return null;
  }
}

/**
 * Fetch multichain balances via Subscan multiChain endpoint
 */
export async function fetchMultiChainAccount(address) {
  const client = axios.create({
    baseURL: 'https://polkadot.api.subscan.io',
    timeout: TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
  });
  try {
    const { data } = await client.post('/api/scan/multiChain/account', {
      address,
    });
    return data?.data || [];
  } catch (err) {
    console.warn('Subscan multiChain error:', err.message);
    return [];
  }
}

/**
 * Fetch staking validators to get average APR
 */
export async function fetchStakingAPR(network = 'polkadot') {
  const client = createClient(network);
  try {
    const { data } = await client.post('/api/scan/staking/validators', {
      row: 10,
      page: 0,
      order: 'desc',
      order_field: 'bonded_nominators_count',
    });
    const validators = data?.data?.list || [];
    if (!validators.length) return null;
    const avg =
      validators.reduce((sum, v) => sum + parseFloat(v.validator_prefs_value || 0), 0) /
      validators.length;
    // Typical DOT staking APR is around 14-15%
    return data?.data?.avg_apr ? parseFloat(data.data.avg_apr) : null;
  } catch (err) {
    console.warn('Subscan staking APR error:', err.message);
    return null;
  }
}

/**
 * Fetch token balance list for an address on a specific network
 */
export async function fetchTokenBalances(network, address) {
  const client = createClient(network);
  try {
    const { data } = await client.post('/api/scan/account/tokens', {
      address,
    });
    return data?.data || {};
  } catch (err) {
    console.warn(`Subscan ${network} tokens error:`, err.message);
    return {};
  }
}

/**
 * Fetch native token balance on a network
 */
export async function fetchNativeBalance(network, address) {
  const client = createClient(network);
  try {
    const { data } = await client.post('/api/v2/scan/search', {
      key: address,
    });
    const account = data?.data?.account;
    return {
      balance: account?.balance || '0',
      kton_balance: account?.kton_balance,
      bonded: account?.bonded || '0',
      unbonding: account?.unbonding || '0',
    };
  } catch (err) {
    console.warn(`Subscan ${network} native balance error:`, err.message);
    return null;
  }
}
