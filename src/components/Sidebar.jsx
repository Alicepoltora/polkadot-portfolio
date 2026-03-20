import { truncateAddress } from '../lib/format';
import PolkaHubLogo from './PolkaHubLogo';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <GridIcon /> },
  { id: 'assets',    label: 'Assets',    icon: <StackIcon /> },
  { id: 'staking',   label: 'Staking',   icon: <LockIcon /> },
  { id: 'history',   label: 'History',   icon: <ClockIcon /> },
  { id: 'settings',  label: 'Settings',  icon: <GearIcon /> },
];

export default function Sidebar({ activeTab, onTabChange, address, onConnectWallet }) {
  return (
    <aside className="app-sidebar" style={{
      minHeight: '100vh',
      background: '#0d1020',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px' }}>
        <PolkaHubLogo width={130} showTagline={false} />
      </div>

      {/* Profile block — shown when address is loaded */}
      {address && (
        <div style={{
          margin: '0 12px 8px',
          padding: '10px 12px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(226,0,120,0.12) 0%, rgba(226,0,120,0.04) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e20078, #8B00C9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 2px rgba(226,0,120,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="white" fillOpacity="0.9"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              PolkaHub Curator
            </div>
            <div style={{ fontSize: 9, color: 'var(--primary-light)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Network Explorer
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: '8px 12px', flex: 1 }}>
        {NAV.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? 'rgba(226,0,120,0.15)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--on-surface-dim)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 2,
                transition: 'all 0.15s',
                textAlign: 'left',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Active accent bar */}
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 2px 2px 0',
                  background: 'var(--primary-light)',
                  boxShadow: '0 0 8px rgba(255,137,176,0.6)',
                }} />
              )}
              <span style={{
                color: isActive ? 'var(--primary-light)' : 'var(--on-surface-faint)',
                display: 'flex', flexShrink: 0,
              }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Connect Wallet — solid pink CTA */}
      <div style={{ padding: '16px 16px 28px' }}>
        <button
          onClick={onConnectWallet}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 12,
            border: 'none',
            background: address
              ? 'rgba(226,0,120,0.15)'
              : 'linear-gradient(135deg, #e20078, #c0005e)',
            color: address ? 'var(--primary-light)' : 'white',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            fontFamily: 'var(--font-body)',
            boxShadow: address ? 'none' : '0 4px 18px rgba(226,0,120,0.35)',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {address
            ? `${address.slice(0,6)}…${address.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </aside>
  );
}

function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function StackIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function GearIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
