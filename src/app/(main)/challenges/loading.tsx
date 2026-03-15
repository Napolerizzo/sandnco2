export default function ChallengesLoading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Page header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: 160, height: 28, borderRadius: 8 }} />
          <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8 }} />
        </div>
        {/* Stats bar skeleton */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ flex: 1, height: 64, borderRadius: 10 }} />
          ))}
        </div>
        {/* Challenge card skeletons */}
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 180, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
