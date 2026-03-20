// Formatting utilities for numbers, addresses, and tokens

/**
 * Format a token balance given raw BigInt value and decimals
 */
export function formatBalance(raw, decimals = 10, precision = 4) {
  if (!raw) return '0';
  const divisor = BigInt(10 ** decimals);
  const rawBig = typeof raw === 'bigint' ? raw : BigInt(raw.toString());
  const whole = rawBig / divisor;
  const frac = rawBig % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, precision);
  const trimmed = fracStr.replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

/**
 * Format a number with commas + optional decimal places
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format USD value
 */
export function formatUSD(value) {
  if (!value && value !== 0) return '$0.00';
  if (value < 0.01) return '< $0.01';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

/**
 * Truncate an address for display
 */
export function truncateAddress(address, start = 6, end = 6) {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a percentage (e.g. APR)
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Parse a balance string to number (e.g. "123.456" → 123.456)
 */
export function parseBalanceToNumber(balanceStr) {
  if (!balanceStr) return 0;
  return parseFloat(balanceStr.replace(/,/g, '')) || 0;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompact(num) {
  if (!num) return '0';
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return formatNumber(num);
}

/**
 * Convert planck (or other smallest unit) to full token amount as float
 */
export function planckToFloat(planck, decimals = 10) {
  if (!planck) return 0;
  const raw = typeof planck === 'bigint' ? planck : BigInt(planck.toString());
  const divisor = Math.pow(10, decimals);
  return Number(raw) / divisor;
}
