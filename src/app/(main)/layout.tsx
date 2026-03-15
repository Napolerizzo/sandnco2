import Navbar from '@/components/layout/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font)' }}>
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  )
}
