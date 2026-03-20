export default function LoadingState({ message = 'Fetching portfolio data...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24 }}>
      <div className="dot-spinner">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="dot-spinner__dot" style={{ '--i': i }} />
        ))}
      </div>
      <p style={{ color: 'var(--on-surface-dim)', fontSize: 14, margin: 0 }}>{message}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 14, marginTop: 12 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="glass-card" style={{ padding: '20px', height: 100 }}>
            <div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '70%', height: 24, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '40%', height: 11 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
