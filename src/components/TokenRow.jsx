import { formatNumber, formatUSD, formatPercent } from '../lib/format';
import NetworkBadge from './NetworkBadge';

/* ── Token icon definitions ── */
const TOKEN_CONFIGS = {
  DOT:  { bg: 'linear-gradient(135deg,#e20078,#9d0056)', letter: 'D', glow: 'rgba(226,0,120,0.4)'  },
  KSM:  { bg: 'linear-gradient(135deg,#2d2d2d,#4a4a4a)', letter: 'K', glow: 'rgba(100,100,100,0.4)'},
  GLMR: { bg: 'linear-gradient(135deg,#53cbc8,#1e7f7d)', letter: 'G', glow: 'rgba(83,203,200,0.3)' },
  ASTR: { bg: 'linear-gradient(135deg,#0070eb,#0047ab)', letter: 'A', glow: 'rgba(0,112,235,0.35)' },
  ACA:  { bg: 'linear-gradient(135deg,#e84142,#9c0e0e)', letter: 'A', glow: 'rgba(232,65,66,0.35)' },
  USDC: { bg: 'linear-gradient(135deg,#2775ca,#1a4d8a)', letter: 'U', glow: 'rgba(39,117,202,0.3)' },
  USDT: { bg: 'linear-gradient(135deg,#26a17b,#15634b)', letter: 'U', glow: 'rgba(38,161,123,0.3)' },
  PINK: { bg: 'linear-gradient(135deg,#ff89b0,#e20078)', letter: 'P', glow: 'rgba(255,137,176,0.4)' },
  IBTC: { bg: 'linear-gradient(135deg,#f7931a,#c86d00)', letter: 'i', glow: 'rgba(247,147,26,0.35)' },
  INTR: { bg: 'linear-gradient(135deg,#7b2fff,#4a00b0)', letter: 'I', glow: 'rgba(123,47,255,0.35)' },
  HDX:  { bg: 'linear-gradient(135deg,#4b53ff,#2a2fc7)', letter: 'H', glow: 'rgba(75,83,255,0.35)'  },
  PHA:  { bg: 'linear-gradient(135deg,#03ac58,#016a36)', letter: 'P', glow: 'rgba(3,172,88,0.35)'   },
  BNC:  { bg: 'linear-gradient(135deg,#5b5b5b,#383838)', letter: 'B', glow: 'rgba(91,91,91,0.3)'    },
  vDOT: { bg: 'linear-gradient(135deg,#e20078,#5b2e8a)', letter: 'v', glow: 'rgba(226,0,120,0.3)'   },
  LDOT: { bg: 'linear-gradient(135deg,#e40c5b,#8b003a)', letter: 'L', glow: 'rgba(228,12,91,0.3)'   },
};

function TokenIcon({ symbol }) {
  const cfg = TOKEN_CONFIGS[symbol] || {
    bg: 'linear-gradient(135deg,#3a3f52,#272b38)',
    letter: symbol?.[0] || '?',
    glow: 'rgba(255,255,255,0.1)',
  };
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%',
      background: cfg.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px ${cfg.glow}`,
      fontSize: 15, fontWeight: 800,
      color: 'white',
      fontFamily: 'var(--font-display)',
      letterSpacing: '-0.02em',
    }}>
      {cfg.letter}
    </div>
  );
}

export default function TokenRow({ token, index }) {
  const { symbol, name, chainId, balance, price, value, change24h } = token;
  const isPos = change24h > 0;
  const isNeg = change24h < 0;

  return (
    <tr style={{ transition: 'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Asset */}
      <td style={{ padding: '13px 16px 13px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <TokenIcon symbol={symbol} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: 14, fontFamily: 'var(--font-display)' }}>
              {symbol}
            </div>
            <div style={{ fontSize: 11, color: 'var(--on-surface-dim)', marginTop: 1 }}>{name}</div>
          </div>
        </div>
      </td>

      {/* Chain */}
      <td style={{ padding: '13px 12px' }}>
        <NetworkBadge chainId={chainId} showName />
      </td>

      {/* Balance */}
      <td style={{ padding: '13px 12px', textAlign: 'right' }}>
        <div style={{ fontWeight: 500, color: 'var(--on-surface)', fontSize: 14, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          {formatNumber(balance, balance < 1 ? 4 : 2)}
        </div>
      </td>

      {/* Price */}
      <td style={{ padding: '13px 12px', textAlign: 'right' }}>
        {price > 0 ? (
          <>
            <div style={{ fontWeight: 500, color: 'var(--on-surface)', fontSize: 13 }}>
              {formatUSD(price)}
            </div>
            {change24h !== undefined && change24h !== null && (
              <div style={{
                fontSize: 11, marginTop: 2, fontWeight: 600,
                color: isPos ? 'var(--success)' : isNeg ? 'var(--error)' : 'var(--on-surface-dim)',
              }}>
                {isPos ? '▲' : isNeg ? '▼' : ''} {formatPercent(Math.abs(change24h))}
              </div>
            )}
          </>
        ) : <span style={{ color: 'var(--on-surface-faint)' }}>—</span>}
      </td>

      {/* Value */}
      <td style={{ padding: '13px 20px 13px 12px', textAlign: 'right' }}>
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
