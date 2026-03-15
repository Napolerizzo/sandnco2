export default function Loading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8 }} />
        {[1,2,3].map(i => (
          <div key={i} className="skeleton" style={{ width: '100%', height: 140, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  )
}
