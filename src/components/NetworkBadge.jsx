import { CHAINS } from '../lib/chains';

const CHAIN_LOGOS = {
  polkadot: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#E6007A" />
      <circle cx="16" cy="8" r="3.5" fill="white" />
      <circle cx="16" cy="24" r="3.5" fill="white" />
      <circle cx="8" cy="12" r="3.5" fill="white" />
      <circle cx="24" cy="12" r="3.5" fill="white" />
      <circle cx="8" cy="20" r="3.5" fill="white" />
      <circle cx="24" cy="20" r="3.5" fill="white" />
    </svg>
  ),
  assetHub: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#E6007A" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">A</text>
    </svg>
  ),
  kusama: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#1a1a1a" />
      <circle cx="16" cy="8" r="3" fill="white" />
      <circle cx="16" cy="24" r="3" fill="white" />
      <circle cx="8" cy="12" r="3" fill="white" />
      <circle cx="24" cy="12" r="3" fill="white" />
      <circle cx="8" cy="20" r="3" fill="white" />
      <circle cx="24" cy="20" r="3" fill="white" />
    </svg>
  ),
  moonbeam: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#53CBC8" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">M</text>
    </svg>
  ),
  astar: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#00B4FF" />
      <polygon points="16,6 19,13 26,13 20,18 22,25 16,21 10,25 12,18 6,13 13,13" fill="white" />
    </svg>
  ),
  acala: (
    <svg viewBox="0 0 32 32" width="20" height="20">
      <circle cx="16" cy="16" r="16" fill="#E40C5B" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">ACA</text>
    </svg>
  ),
};

export default function NetworkBadge({ chainId, showName = true, size = 'md' }) {
  const chain = CHAINS[chainId];
  if (!chain) return null;

  const sizes = {
    sm: { logo: 16, text: '11px', gap: 4 },
    md: { logo: 20, text: '13px', gap: 6 },
    lg: { logo: 24, text: '15px', gap: 8 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        background: `${chain.color}18`,
        border: `1px solid ${chain.color}40`,
        borderRadius: 20,
        padding: '3px 8px 3px 4px',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {CHAIN_LOGOS[chainId] ? (
          <span style={{ width: s.logo, height: s.logo, display: 'flex' }}>
            {CHAIN_LOGOS[chainId]}
          </span>
        ) : (
          <span
            style={{
              width: s.logo,
              height: s.logo,
              borderRadius: '50%',
              background: chain.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: s.logo * 0.5,
              fontWeight: 'bold',
            }}
          >
            {chain.shortName?.[0]}
          </span>
        )}
      </span>
      {showName && (
        <span style={{ fontSize: s.text, fontWeight: 600, color: chain.color }}>
          {chain.shortName}
        </span>
      )}
    </span>
  );
}
