import { formatUSD, truncateAddress } from '../lib/format';
import { useState } from 'react';

export default function PortfolioHeader({ address, totalUSD, tokenCount, chainCount, pricesWarning }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const change = null; // Could add 24h change later

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(230,0,122,0.12) 0%, rgba(99,0,168,0.12) 100%)',
        border: '1px solid rgba(230,0,122,0.2)',
        borderRadius: 20,
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(230,0,122,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        {/* Left: address + balance */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {/* Identicon placeholder */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, #E6007A, #6300a8)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}>
              🔑
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.02em',
                }}>
                  {truncateAddress(address, 8, 8)}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)',
                    padding: 2,
                    display: 'flex',
                    transition: 'color 0.2s',
                  }}
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                Polkadot Network
              </div>
            </div>
          </div>

          <div style={{ fontSize: 42, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {formatUSD(totalUSD)}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
            Total Portfolio Value
          </div>
        </div>

        {/* Right: stats */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <StatBox label="Tokens" value={tokenCount || 0} icon="🪙" />
          <StatBox label="Networks" value={chainCount || 0} icon="⛓️" />
        </div>
      </div>

      {pricesWarning && (
        <div style={{
          marginTop: 16,
          padding: '8px 12px',
          background: 'rgba(250,200,0,0.1)',
          border: '1px solid rgba(250,200,0,0.2)',
          borderRadius: 8,
          fontSize: 12,
          color: '#fac800',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          ⚠️ {pricesWarning}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '12px 20px',
      textAlign: 'center',
      minWidth: 80,
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
