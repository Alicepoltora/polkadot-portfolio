import { formatUSD, formatNumber, formatPercent } from '../lib/format';

export default function StakingPanel({ staking, apr, dotPrice, loading }) {
  const safeApr = apr || 14.5;

  /* ── Compact APY card (shown in right sidebar) ── */
  return (
    <div className="glass-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--on-surface-dim)', textTransform: 'uppercase' }}>
          Staking APY
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(226,0,120,0.2)',
          border: '1px solid rgba(226,0,120,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15,
        }}>⚡</div>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, lineHeight: 1, color: 'var(--on-surface)', marginBottom: 8 }}>
        {formatPercent(safeApr, 1)}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 14 }} />
      ) : staking ? (
        <div style={{ fontSize: 12, color: 'var(--on-surface-dim)', lineHeight: 1.5, marginBottom: 14 }}>
          Your active staking is yielding approximately{' '}
          <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            {formatUSD((staking.bonded * safeApr / 100) / 12)}/month
          </span>{' '}in rewards.
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--on-surface-dim)', marginBottom: 14 }}>
          Stake DOT to earn passive rewards at the current network APY.
        </div>
      )}

      {staking && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <MiniStat label="Bonded" value={`${formatNumber(staking.bonded, 2)} DOT`} color="var(--primary-light)" />
          <MiniStat label="Claimable" value={`${formatNumber(staking.claimable, 4)} DOT`} color="var(--success)" />
          {staking.unbonding > 0 && (
            <MiniStat label="Unbonding" value={`${formatNumber(staking.unbonding, 2)} DOT`} color="var(--warning)" />
          )}
        </div>
      )}

      <button style={{
        width: '100%',
        padding: '11px 0',
        borderRadius: 10,
        border: 'none',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
        color: 'white',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        boxShadow: '0 4px 16px rgba(226,0,120,0.3)',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Manage Stakes
      </button>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: 'var(--on-surface-dim)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
    </div>
  );
}
