import { formatUSD, formatNumber } from '../lib/format';
import { CHAINS } from '../lib/chains';
import NetworkBadge from './NetworkBadge';

export default function ChainCard({ chainId, tokens = [], loading }) {
  const chain = CHAINS[chainId];
  if (!chain) return null;

  const totalValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);
  const mainToken = tokens[0];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${chain.color}25`,
        borderRadius: 16,
        padding: '20px 24px',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = `${chain.color}50`;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${chain.color}15`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = `${chain.color}25`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Color accent top bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${chain.color}, ${chain.color}60)`,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <NetworkBadge chainId={chainId} showName size="md" />
        <span style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.05)',
          padding: '3px 8px',
          borderRadius: 20,
        }}>
          {chain.type === 'evm' ? 'EVM' : 'Substrate'}
        </span>
      </div>

      {/* Total value */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>
          {formatUSD(totalValue)}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
          Total Value
        </div>
      </div>

      {/* Token list */}
      {loading ? (
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          {[1, 2].map(i => (
            <div key={i} className="skeleton-line" style={{ height: 12, width: i === 1 ? '60%' : '40%' }} />
          ))}
        </div>
      ) : tokens.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tokens.slice(0, 4).map((token, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: i < Math.min(tokens.length, 4) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {token.symbol}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                {formatNumber(token.balance, token.balance < 1 ? 4 : 2)} {token.symbol}
              </span>
            </div>
          ))}
          {tokens.length > 4 && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
              +{tokens.length - 4} more
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '12px 0' }}>
          No assets found
        </div>
      )}
    </div>
  );
}
