export default function FeedLoading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Page header skeleton */}
        <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 8 }} />
        {/* Create post bar skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 56, borderRadius: 12 }} />
        {/* Feed post skeletons */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 12 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
