import { CHAINS } from '../lib/chains';

// Polkadot relay and Asset Hub = "POLKADOT" badge; everything else = "PARACHAIN"
const RELAY_IDS = new Set(['polkadot', 'assetHub']);

// Per-chain custom labels for better UX
const CHAIN_LABELS = {
  polkadot:  'POLKADOT',
  assetHub:  'ASSET HUB',
  kusama:    'KUSAMA',
  moonbeam:  'MOONBEAM',
  astar:     'ASTAR',
  acala:     'ACALA',
  hydration: 'HYDRATION',
  phala:     'PHALA',
  bifrost:   'BIFROST',
};

export default function NetworkBadge({ chainId, showName = true }) {
  const chain = CHAINS[chainId];
  if (!chain) return null;

  const isRelay     = RELAY_IDS.has(chainId);
  const badgeClass  = isRelay ? 'badge-polkadot' : 'badge-parachain';
  const label       = showName
    ? (CHAIN_LABELS[chainId] ?? chainId.toUpperCase())
    : (isRelay ? 'POLKADOT' : 'PARACHAIN');

  return (
    <span className={badgeClass} style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.07em',
      padding: '3px 8px',
      borderRadius: 4,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
