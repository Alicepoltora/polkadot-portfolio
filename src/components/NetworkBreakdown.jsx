import { formatUSD } from '../lib/format';
import { CHAINS } from '../lib/chains';

const CHAIN_COLORS = {
  polkadot:  'var(--primary-light)',
  assetHub:  'var(--primary-light)',
  kusama:    '#a78bfa',
  moonbeam:  'var(--tertiary)',
  astar:     '#60a5fa',
  acala:     '#fb923c',
};

export default function NetworkBreakdown({ tokensByChain }) {
  const chains = Object.entries(tokensByChain).map(([chainId, tokens]) => {
    const value = tokens.reduce((s, t) => s + (t.value || 0), 0);
    return { chainId, value };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  const total = chains.reduce((s, c) => s + c.value, 0);

  return (
    <div className="glass-card" style={{ padding: '20px 22px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 18, color: 'var(--on-surface)' }}>
        Network Breakdown
      </div>

      {chains.length === 0 ? (
        <div style={{ color: 'var(--on-surface-dim)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          No data yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {chains.map(({ chainId, value }) => {
            const chain = CHAINS[chainId];
            if (!chain) return null;
            const pct = total > 0 ? (value / total) * 100 : 0;
            const color = CHAIN_COLORS[chainId] || 'var(--on-surface-dim)';
            return (
              <div key={chainId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 5px ${color}`,
                      flexShrink: 0,
                      display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 13, color: 'var(--on-surface)', fontWeight: 500 }}>{chain.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>
                    {formatUSD(value)}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 2,
                    boxShadow: `0 0 6px ${color}`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button style={{
        width: '100%',
        marginTop: 20,
        padding: '10px 0',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--on-surface-dim)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '0.02em',
        transition: 'all 0.2s',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(123,233,255,0.08)'; e.currentTarget.style.color='var(--tertiary)'; e.currentTarget.style.borderColor='rgba(123,233,255,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='var(--on-surface-dim)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
      >
        Analyze Diversification
      </button>
    </div>
  );
}
