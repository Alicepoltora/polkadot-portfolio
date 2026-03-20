import { formatUSD, formatNumber, formatPercent } from '../lib/format';

export default function StakingPanel({ staking, apr, dotPrice, loading }) {
  if (loading) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
      }}>
        <div className="skeleton-line" style={{ width: 160, height: 20, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card" style={{ height: 80 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!staking) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
          No staking position found for this address
        </div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 6 }}>
          Current DOT staking APR: <span style={{ color: '#E6007A', fontWeight: 600 }}>~{formatPercent(apr)}</span>
        </div>
      </div>
    );
  }

  const { bonded, unbonding, claimable, unbondingChunks } = staking;
  const bondedUSD = (bonded || 0) * (dotPrice || 0);
  const unbondingUSD = (unbonding || 0) * (dotPrice || 0);
  const claimableUSD = (claimable || 0) * (dotPrice || 0);
  const yearlyRewards = (bonded || 0) * ((apr || 14.5) / 100);
  const monthlyRewards = yearlyRewards / 12;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E6007A22, #E6007A44)',
            border: '1px solid #E6007A40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}>
            🔒
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: 16 }}>DOT Staking</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Polkadot Network</div>
          </div>
        </div>

        {/* APR badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.05))',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 10,
          padding: '8px 16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#4ade80' }}>
            {formatPercent(apr)}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Current APR</div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StakingCard
          icon="🔒"
          label="Bonded"
          value={formatNumber(bonded, 4)}
          suffix="DOT"
          subValue={formatUSD(bondedUSD)}
          color="#E6007A"
        />
        <StakingCard
          icon="⏳"
          label="Unbonding"
          value={formatNumber(unbonding, 4)}
          suffix="DOT"
          subValue={formatUSD(unbondingUSD)}
          color="#f59e0b"
          tooltip="Funds being unstaked (28-day period)"
        />
        <StakingCard
          icon="💰"
          label="Claimable"
          value={formatNumber(claimable, 4)}
          suffix="DOT"
          subValue={formatUSD(claimableUSD)}
          color="#4ade80"
        />
        <StakingCard
          icon="📈"
          label="Est. Monthly"
          value={`~${formatNumber(monthlyRewards, 2)}`}
          suffix="DOT"
          subValue={`~${formatUSD(monthlyRewards * (dotPrice || 0))}/mo`}
          color="#60a5fa"
        />
      </div>

      {/* Unbonding chunks */}
      {unbondingChunks && unbondingChunks.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.05)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 12,
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
            ⏳ Unbonding Queue
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {unbondingChunks.map((chunk, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Era {chunk.era}</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                  {formatNumber(chunk.value, 4)} DOT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StakingCard({ icon, label, value, suffix, subValue, color, tooltip }) {
  return (
    <div
      title={tooltip}
      style={{
        background: `${color}08`,
        border: `1px solid ${color}20`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: tooltip ? 'help' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'white' }}>
        {value} <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{subValue}</div>
    </div>
  );
}
