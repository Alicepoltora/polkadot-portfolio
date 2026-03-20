import { useState } from 'react';
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
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#0d1020',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PolkaHubLogo width={130} showTagline={false} />
        </div>

        {/* User pill */}
        {address && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, flexShrink: 0,
            }}>🔑</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--on-surface)' }}>PolkaHub User</div>
              <div style={{ fontSize: 10, color: 'var(--on-surface-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Network Explorer
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
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
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
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

      {/* Connect Wallet */}
      <div style={{ padding: '16px 16px 24px' }}>
        <button
          onClick={onConnectWallet}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 12,
            border: '1px solid rgba(226,0,120,0.4)',
            background: 'transparent',
            color: 'var(--primary-light)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(226,0,120,0.12)';
            e.currentTarget.style.borderColor = 'rgba(226,0,120,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(226,0,120,0.4)';
          }}
        >
          {address ? `${address.slice(0,6)}…${address.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>
    </aside>
  );
}

function HubIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="rgba(226,0,120,0.15)" />
      {/* Hub: центральный узел + 6 спиц — иконка Polkadot */}
      <circle cx="14" cy="14" r="3" fill="#ff89b0" />
      <circle cx="14" cy="6"  r="2" fill="#ff89b0" opacity="0.9" />
      <circle cx="14" cy="22" r="2" fill="#ff89b0" opacity="0.9" />
      <circle cx="7"  cy="10" r="2" fill="#ff89b0" opacity="0.7" />
      <circle cx="21" cy="10" r="2" fill="#ff89b0" opacity="0.7" />
      <circle cx="7"  cy="18" r="2" fill="#ff89b0" opacity="0.7" />
      <circle cx="21" cy="18" r="2" fill="#ff89b0" opacity="0.7" />
      <line x1="14" y1="11" x2="14" y2="8"  stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
      <line x1="14" y1="17" x2="14" y2="20" stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
      <line x1="11.4" y1="12.5" x2="9"  y2="11" stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
      <line x1="16.6" y1="12.5" x2="19" y2="11" stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
      <line x1="11.4" y1="15.5" x2="9"  y2="17" stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
      <line x1="16.6" y1="15.5" x2="19" y2="17" stroke="#ff89b0" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
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
