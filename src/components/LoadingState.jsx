export default function LoadingState({ message = 'Loading portfolio...' }) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      {/* Polkadot spinner */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div className="dot-spinner">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="dot-spinner__dot"
              style={{ '--i': i }}
            />
          ))}
        </div>
      </div>

      <p style={{ color: '#a0aec0', fontSize: 14, margin: 0 }}>{message}</p>

      {/* Skeleton cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginTop: 32,
        maxWidth: 900,
        margin: '32px auto 0',
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line" style={{ width: '60%', height: 20, marginBottom: 12 }} />
            <div className="skeleton-line" style={{ width: '40%', height: 32, marginBottom: 8 }} />
            <div className="skeleton-line" style={{ width: '80%', height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td colSpan={5}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
          <div className="skeleton-circle" style={{ width: 36, height: 36 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: '30%', height: 14, marginBottom: 6 }} />
            <div className="skeleton-line" style={{ width: '20%', height: 12 }} />
          </div>
          <div className="skeleton-line" style={{ width: '15%', height: 14 }} />
          <div className="skeleton-line" style={{ width: '15%', height: 14 }} />
        </div>
      </td>
    </tr>
  );
}
