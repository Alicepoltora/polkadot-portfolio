import { useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory';
import { CHAINS } from '../lib/chains';

const CHAIN_EXPLORERS = {
  polkadot:  (hash) => `https://polkadot.subscan.io/extrinsic/${hash}`,
  kusama:    (hash) => `https://kusama.subscan.io/extrinsic/${hash}`,
  moonbeam:  (hash) => `https://moonbeam.moonscan.io/tx/${hash}`,
  astar:     (hash) => `https://astar.blockscout.com/tx/${hash}`,
  acala:     (hash) => `https://acala.subscan.io/extrinsic/${hash}`,
};

const TYPE_META = {
  send:    { label: 'Sent',    color: 'var(--error)',        bg: 'rgba(255,80,80,0.08)',  icon: '↑' },
  receive: { label: 'Received', color: 'var(--success)',     bg: 'rgba(80,200,120,0.08)', icon: '↓' },
  reward:  { label: 'Reward',  color: 'var(--tertiary)',     bg: 'rgba(123,233,255,0.08)', icon: '✦' },
  stake:   { label: 'Staked',  color: 'var(--primary-light)',bg: 'rgba(226,0,120,0.08)',  icon: '🔒' },
};

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatAmount(amount, symbol, type) {
  const sign = type === 'send' ? '-' : '+';
  const n = Math.abs(amount);
  const formatted = n < 0.001 ? n.toExponential(2) : n < 1 ? n.toFixed(4) : n < 1000 ? n.toFixed(2) : n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${sign}${formatted} ${symbol}`;
}

function ChainBadge({ chainId }) {
  const chain = CHAINS[chainId];
  if (!chain) return <span style={{ fontSize: 10, color: 'var(--on-surface-dim)' }}>{chainId}</span>;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 4,
      background: `${chain.color}18`, color: chain.color,
      border: `1px solid ${chain.color}30`,
      fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
    }}>
      {chain.name}
    </span>
  );
}

function TxRow({ tx }) {
  const meta = TYPE_META[tx.type] || TYPE_META.receive;
  const explorer = CHAIN_EXPLORERS[tx.chain];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '36px 1fr auto auto auto',
      gap: 12,
      alignItems: 'center',
      padding: '13px 20px',
      transition: 'background 0.15s',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Type icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: meta.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0, color: meta.color,
        fontWeight: 700,
      }}>
        {meta.icon}
      </div>

      {/* Details */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--on-surface)' }}>
            {meta.label}
          </span>
          <ChainBadge chainId={tx.chain} />
          {tx.method && (
            <span style={{ fontSize: 10, color: 'var(--on-surface-dim)', fontFamily: 'var(--font-mono)' }}>
              {tx.method}
            </span>
          )}
          {!tx.success && (
            <span style={{ fontSize: 10, color: 'var(--error)', fontWeight: 600 }}>FAILED</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-dim)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 8 }}>
          {tx.type === 'reward' ? (
            <span>Era {tx.era ?? '—'}</span>
          ) : (
            <span>{tx.hash ? `${tx.hash.slice(0, 10)}…${tx.hash.slice(-6)}` : '—'}</span>
          )}
          {explorer && tx.hash && (
            <a href={explorer(tx.hash)} target="_blank" rel="noopener noreferrer"
               style={{ color: 'var(--primary-light)', textDecoration: 'none', fontSize: 10 }}>
              ↗ explorer
            </a>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: 'right', minWidth: 100 }}>
        <div style={{
          fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)',
          color: meta.color,
        }}>
          {formatAmount(tx.amount, tx.symbol, tx.type)}
        </div>
      </div>

      {/* Date */}
      <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--on-surface-dim)', whiteSpace: 'nowrap', minWidth: 110 }}>
        {formatDate(tx.timestamp)}
      </div>

      {/* Status dot */}
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: tx.success ? 'var(--success)' : 'var(--error)',
        boxShadow: tx.success ? '0 0 5px var(--success)' : '0 0 5px var(--error)',
        flexShrink: 0,
      }} />
    </div>
  );
}

function SourceStatus({ sources, hasSubscan }) {
  const entries = Object.entries(sources);
  if (!entries.length) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {entries.map(([chain, status]) => (
        <span key={chain} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.05em',
          background: status === 'ok'    ? 'rgba(80,200,120,0.08)'
                    : status === 'nokey' ? 'rgba(255,180,0,0.08)'
                    : status === 'empty' ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,80,80,0.08)',
          color: status === 'ok'    ? 'var(--success)'
               : status === 'nokey' ? 'var(--warning)'
               : status === 'empty' ? 'var(--on-surface-dim)'
               : 'var(--error)',
          border: `1px solid ${
               status === 'ok'    ? 'rgba(80,200,120,0.2)'
             : status === 'nokey' ? 'rgba(255,180,0,0.2)'
             : status === 'empty' ? 'rgba(255,255,255,0.06)'
             : 'rgba(255,80,80,0.2)'}`,
        }}>
          {status === 'ok' ? '✓' : status === 'nokey' ? '🔑' : status === 'empty' ? '○' : '✗'}
          {' '}{(CHAINS[chain]?.name ?? chain)}
        </span>
      ))}
    </div>
  );
}

function NoKeyBanner() {
  return (
    <div style={{
      borderRadius: 14,
      background: 'rgba(226,0,120,0.06)',
      border: '1px solid rgba(226,0,120,0.18)',
      padding: '20px 24px',
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'rgba(226,0,120,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>🔑</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            Add Subscan API Key for Full History
          </div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-dim)', lineHeight: 1.6, marginBottom: 12 }}>
            Polkadot and Kusama transaction history requires a Subscan API key.
            The free plan gives <strong style={{ color: 'var(--primary-light)' }}>30,000 API calls/month</strong> — more than enough.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="https://support.subscan.io/" target="_blank" rel="noopener noreferrer" style={{
              background: 'linear-gradient(135deg,var(--primary),var(--primary-dim))',
              color: 'white', textDecoration: 'none',
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              boxShadow: '0 4px 12px rgba(226,0,120,0.3)',
            }}>
              Get Free Key →
            </a>
            <span style={{
              fontSize: 11, color: 'var(--on-surface-dim)', padding: '7px 0',
              fontFamily: 'var(--font-mono)',
            }}>
              Then set VITE_SUBSCAN_KEY in your .env
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTER_TABS = ['All', 'Transfers', 'Rewards', 'EVM'];

export default function HistoryView({ address }) {
  const { transfers, rewards, loading, sources, hasSubscan } = useHistory(address);
  const [filter, setFilter] = useState('All');
  const [page, setPage]     = useState(0);
  const PAGE_SIZE = 20;

  const allItems = useMemo(() => {
    const all = [
      ...transfers,
      ...rewards,
    ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (filter === 'All')       return all;
    if (filter === 'Transfers') return all.filter(t => t.type !== 'reward' && !['moonbeam','astar'].includes(t.chain));
    if (filter === 'Rewards')   return all.filter(t => t.type === 'reward');
    if (filter === 'EVM')       return all.filter(t => ['moonbeam','astar'].includes(t.chain));
    return all;
  }, [transfers, rewards, filter]);

  const visible  = allItems.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore  = visible.length < allItems.length;

  // Group by date
  const grouped = useMemo(() => {
    const groups = [];
    let currentDate = null;
    visible.forEach(tx => {
      const dateStr = tx.timestamp
        ? new Date(tx.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
        : 'Unknown Date';
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ type: 'header', date: dateStr });
      }
      groups.push({ type: 'tx', tx });
    });
    return groups;
  }, [visible]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800,
          letterSpacing: '-0.02em', color: 'var(--on-surface)', marginBottom: 4,
        }}>
          Transaction History
        </h2>
        <div style={{ fontSize: 13, color: 'var(--on-surface-dim)' }}>
          {allItems.length > 0
            ? `${allItems.length} transactions across ${Object.values(sources).filter(s => s === 'ok').length} chains`
            : loading ? 'Loading…' : 'No transactions found'}
        </div>
      </div>

      {/* Source status */}
      <SourceStatus sources={sources} hasSubscan={hasSubscan} />

      {/* No Subscan key banner */}
      {!hasSubscan && <NoKeyBanner />}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {FILTER_TABS.map(t => {
          const count = t === 'All' ? allItems.length
            : t === 'Transfers' ? transfers.filter(x => !['moonbeam','astar'].includes(x.chain)).length
            : t === 'Rewards'   ? rewards.length
            : t === 'EVM'       ? transfers.filter(x => ['moonbeam','astar'].includes(x.chain)).length
            : 0;
          const isActive = filter === t;
          return (
            <button key={t} onClick={() => { setFilter(t); setPage(0); }} style={{
              background: isActive ? 'rgba(255,137,176,0.12)' : 'rgba(255,255,255,0.04)',
              border: isActive ? '1px solid rgba(255,137,176,0.25)' : '1px solid transparent',
              borderRadius: 8, color: isActive ? 'var(--primary-light)' : 'var(--on-surface-dim)',
              fontWeight: isActive ? 600 : 400, fontSize: 12, padding: '6px 14px',
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {t}
              {count > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,137,176,0.25)' : 'rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto auto', gap: 12, alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              <div>
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '30%' }} />
              </div>
              <div className="skeleton" style={{ height: 14, width: 90 }} />
              <div className="skeleton" style={{ height: 10, width: 100 }} />
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>
            No transactions found
          </div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-dim)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            {hasSubscan
              ? 'This address has no transaction history on the connected networks.'
              : 'EVM history (Moonbeam, Astar) is shown automatically. Add a Subscan API key to see Polkadot & Kusama history.'}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr auto auto auto',
            gap: 12, padding: '10px 20px',
            background: 'var(--surface-low)', fontSize: 10, fontWeight: 600,
            color: 'var(--on-surface-dim)', letterSpacing: '0.07em', textTransform: 'uppercase',
          }}>
            <div />
            <div>Transaction</div>
            <div style={{ textAlign: 'right' }}>Amount</div>
            <div style={{ textAlign: 'right' }}>Date</div>
            <div />
          </div>

          {/* Rows with date headers */}
          {grouped.map((item, i) =>
            item.type === 'header' ? (
              <div key={`h-${i}`} style={{
                padding: '10px 20px 6px',
                fontSize: 11, fontWeight: 600, color: 'var(--on-surface-dim)',
                letterSpacing: '0.04em',
                background: 'rgba(255,255,255,0.015)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                {item.date}
              </div>
            ) : (
              <TxRow key={item.tx.id || i} tx={item.tx} />
            )
          )}

          {/* Load more */}
          {hasMore && (
            <div style={{ padding: '14px 20px', textAlign: 'center' }}>
              <button onClick={() => setPage(p => p + 1)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: 'var(--on-surface-dim)', padding: '8px 24px',
                fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(226,0,120,0.08)'; e.currentTarget.style.color='var(--primary-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='var(--on-surface-dim)'; }}
              >
                Load more ({allItems.length - visible.length} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
