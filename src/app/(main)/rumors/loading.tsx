export default function RumorsLoading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Page header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: 140, height: 28, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 100, height: 36, borderRadius: 8 }} />
        </div>
        {/* Filter tabs skeleton */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ width: 72, height: 32, borderRadius: 8 }} />
          ))}
        </div>
        {/* Rumor card skeletons */}
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 160, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
