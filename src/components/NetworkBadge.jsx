import { CHAINS } from '../lib/chains';

const PARACHAIN_IDS = ['moonbeam','astar','acala','kusama'];

export default function NetworkBadge({ chainId, showName = true, size = 'sm' }) {
  const chain = CHAINS[chainId];
  if (!chain) return null;

  const isParachain = PARACHAIN_IDS.includes(chainId);
  const badgeClass = isParachain ? 'badge-parachain' : 'badge-polkadot';
  const label = isParachain ? 'PARACHAIN' : 'POLKADOT';

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
      {showName ? (chainId === 'assetHub' ? 'ASSET HUB' : label) : label}
    </span>
  );
}
