import Navbar from '@/components/layout/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030303]">
      <Navbar />
      <main className="pt-14">
        {children}
      </main>
    </div>
  )
}
