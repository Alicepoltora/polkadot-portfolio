import { formatNumber, formatUSD, formatPercent } from '../lib/format';
import NetworkBadge from './NetworkBadge';

const TOKEN_ICONS = {
  DOT: '🔴',
  KSM: '⚫',
  GLMR: '🌙',
  ASTR: '⭐',
  ACA: '🔥',
  USDC: '🔵',
  USDT: '🟢',
  PINK: '🩷',
};

export default function TokenRow({ token, index }) {
  const { symbol, name, chain, chainId, balance, price, value, change24h } = token;
  const hasChange = change24h !== undefined && change24h !== null;
  const isPositive = change24h > 0;
  const isNegative = change24h < 0;

  return (
    <tr
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* # */}
      <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.25)', fontSize: 12, width: 40 }}>
        {index + 1}
      </td>

      {/* Token info */}
      <td style={{ padding: '14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            {TOKEN_ICONS[symbol] || '🪙'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{symbol}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{name}</div>
          </div>
        </div>
      </td>

      {/* Network */}
      <td style={{ padding: '14px 8px' }}>
        <NetworkBadge chainId={chainId} showName size="sm" />
      </td>

      {/* Balance */}
      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
        <div style={{ fontWeight: 500, color: 'white', fontSize: 14 }}>
          {formatNumber(balance, balance < 1 ? 4 : 2)}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
          {symbol}
        </div>
      </td>

      {/* Price + 24h change */}
      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
        {price > 0 ? (
          <>
            <div style={{ fontWeight: 500, color: 'white', fontSize: 14 }}>
              {formatUSD(price)}
            </div>
            {hasChange && (
              <div style={{
                fontSize: 11,
                marginTop: 1,
                color: isPositive ? '#4ade80' : isNegative ? '#f87171' : 'rgba(255,255,255,0.35)',
                fontWeight: 500,
              }}>
                {isPositive ? '▲' : isNegative ? '▼' : ''}
                {formatPercent(Math.abs(change24h))}
              </div>
            )}
          </>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>—</span>
        )}
      </td>

      {/* Value */}
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <div style={{
          fontWeight: 700,
          fontSize: 14,
          color: value > 0 ? 'white' : 'rgba(255,255,255,0.3)',
        }}>
          {value > 0 ? formatUSD(value) : '—'}
        </div>
      </td>
    </tr>
  );
}
