import { formatNumber, formatUSD, formatPercent } from '../lib/format';
import NetworkBadge from './NetworkBadge';

const TOKEN_ICONS = {
  DOT: '🔴', KSM: '⚫', GLMR: '🌙', ASTR: '⭐',
  ACA: '🔥', USDC: '🔵', USDT: '🟢', PINK: '🩷',
};

export default function TokenRow({ token, index }) {
  const { symbol, name, chainId, balance, price, value, change24h } = token;
  const isPos = change24h > 0;
  const isNeg = change24h < 0;

  return (
    <tr style={{ transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Asset */}
      <td style={{ padding: '14px 16px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--surface-high)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>
            {TOKEN_ICONS[symbol] || '🪙'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: 14, fontFamily: 'var(--font-display)' }}>
              {symbol}
            </div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-dim)', marginTop: 1 }}>{name}</div>
          </div>
        </div>
      </td>

      {/* Chain */}
      <td style={{ padding: '14px 12px' }}>
        <NetworkBadge chainId={chainId} showName />
      </td>

      {/* Balance */}
      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
        <div style={{ fontWeight: 500, color: 'var(--on-surface)', fontSize: 14 }}>
          {formatNumber(balance, balance < 1 ? 4 : 2)}
        </div>
      </td>

      {/* Price */}
      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
        {price > 0 ? (
          <>
            <div style={{ fontWeight: 500, color: 'var(--on-surface)', fontSize: 14 }}>
              {formatUSD(price)}
            </div>
            {change24h !== undefined && change24h !== null && (
              <div style={{
                fontSize: 11, marginTop: 2, fontWeight: 500,
                color: isPos ? 'var(--success)' : isNeg ? 'var(--error)' : 'var(--on-surface-dim)',
              }}>
                {isPos ? '▲' : isNeg ? '▼' : ''} {formatPercent(Math.abs(change24h))}
              </div>
            )}
          </>
        ) : <span style={{ color: 'var(--on-surface-faint)' }}>—</span>}
      </td>

      {/* Value */}
      <td style={{ padding: '14px 20px 14px 12px', textAlign: 'right' }}>
        <span style={{
          fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)',
          color: value > 0 ? 'var(--on-surface)' : 'var(--on-surface-faint)',
        }}>
          {value > 0 ? formatUSD(value) : '—'}
        </span>
      </td>
    </tr>
  );
}
