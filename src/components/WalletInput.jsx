import { useState } from 'react';
import { DEMO_ADDRESS } from '../lib/chains';

export default function WalletInput({ onSearch, loading }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const addr = value.trim();
    if (addr) onSearch(addr);
  };

  const handleDemo = () => {
    setValue(DEMO_ADDRESS);
    onSearch(DEMO_ADDRESS);
  };

  return (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: focused
              ? '0 0 0 3px rgba(230,0,122,0.35), 0 4px 24px rgba(230,0,122,0.12)'
              : '0 4px 24px rgba(0,0,0,0.18)',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <div
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.10)',
              borderRight: 'none',
              borderRadius: '14px 0 0 14px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 10,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <circle cx="12" cy="11" r="1"/>
            </svg>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter Polkadot address (SS58 or 0x)..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: 15,
                padding: '16px 0',
                fontFamily: "'Fira Code', monospace",
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            style={{
              background: 'linear-gradient(135deg, #E6007A, #c0005e)',
              border: 'none',
              borderRadius: '0 14px 14px 0',
              color: 'white',
              fontWeight: 700,
              fontSize: 15,
              padding: '0 28px',
              cursor: loading || !value.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !value.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Try demo:</span>
        <button
          onClick={handleDemo}
          style={{
            background: 'transparent',
            border: '1px solid rgba(230,0,122,0.3)',
            borderRadius: 6,
            color: '#E6007A',
            fontSize: 11,
            padding: '3px 8px',
            cursor: 'pointer',
            fontFamily: "'Fira Code', monospace",
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(230,0,122,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {DEMO_ADDRESS.slice(0, 8)}...{DEMO_ADDRESS.slice(-6)}
        </button>
      </div>
    </div>
  );
}
