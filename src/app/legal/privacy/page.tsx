import Link from 'next/link'
import Image from 'next/image'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030303] grid-bg py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="KGT" fill className="object-contain" />
          </div>
          <Link href="/" className="font-display text-xl text-gradient-gold tracking-wider" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            KING OF GOOD TIMES
          </Link>
        </div>

        <div className="glass-gold rounded-2xl p-8">
          <h1 className="font-display text-4xl text-gradient-gold mb-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>
            PRIVACY POLICY
          </h1>
          <p className="font-mono text-xs text-zinc-500 mb-8">Last updated: March 2026</p>

          <div className="space-y-6 font-mono text-sm leading-relaxed">
            <Section title="1. Information We Collect">
              <ul className="space-y-2 mt-2 text-zinc-400">
                <li>• <span className="text-white">Account Info:</span> Email, username, display name, city</li>
                <li>• <span className="text-white">Activity Data:</span> Posts, votes, challenge entries, wallet transactions</li>
                <li>• <span className="text-white">Technical Data:</span> IP address, device type, browser, usage patterns</li>
                <li>• <span className="text-white">Payment Data:</span> Handled by Razorpay — we do not store card details</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Data">
              <ul className="space-y-2 mt-2 text-zinc-400">
                <li>• To operate and improve the platform</li>
                <li>• To process payments and manage wallets</li>
                <li>• To send important notifications about your account</li>
                <li>• To enforce our community guidelines</li>
                <li>• To provide analytics (via PostHog — anonymized)</li>
                <li>• To provide AI support (via our assistant — inputs are processed but not stored long-term)</li>
              </ul>
            </Section>

            <Section title="3. Anonymous Content">
              When you post anonymous rumors, your identity is hidden from other users. However, we internally maintain a link between your account and your anonymous posts for moderation purposes. We will reveal this information if legally required.
            </Section>

            <Section title="4. Data Sharing">
              We do not sell your personal data. We share data with:
              <ul className="space-y-2 mt-2 text-zinc-400">
                <li>• <span className="text-white">Razorpay</span> — payment processing</li>
                <li>• <span className="text-white">Supabase</span> — database and authentication</li>
                <li>• <span className="text-white">Cloudflare</span> — CDN, security, media storage</li>
                <li>• <span className="text-white">Resend</span> — transactional email</li>
                <li>• <span className="text-white">PostHog</span> — anonymized analytics</li>
              </ul>
            </Section>

            <Section title="5. Data Retention">
              <ul className="space-y-2 mt-2 text-zinc-400">
                <li>• Account data: Retained while your account is active</li>
                <li>• Transaction records: 7 years for financial compliance</li>
                <li>• Support tickets: 2 years after resolution</li>
                <li>• Deleted account data: Purged within 30 days (some data retained for compliance)</li>
              </ul>
            </Section>

            <Section title="6. Cookies">
              We use essential cookies for authentication and session management. No tracking cookies are used without consent. You can disable cookies in your browser settings.
            </Section>

            <Section title="7. Your Rights">
              You have the right to:
              <ul className="space-y-2 mt-2 text-zinc-400">
                <li>• Access the personal data we hold about you</li>
                <li>• Request correction of inaccurate data</li>
                <li>• Request deletion of your account and data</li>
                <li>• Port your data to another service</li>
                <li>• Object to certain processing</li>
              </ul>
              To exercise these rights, email <a href="mailto:sandncolol@gmail.com" className="text-yellow-400 hover:underline">sandncolol@gmail.com</a>
            </Section>

            <Section title="8. Security">
              We implement industry-standard security measures including 256-bit SSL encryption, secure authentication via Supabase, and Cloudflare security protection. However, no system is 100% secure.
            </Section>

            <Section title="9. Children's Privacy">
              This platform is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately.
            </Section>

            <Section title="10. Contact">
              Privacy concerns? Contact us at{' '}
              <a href="mailto:sandncolol@gmail.com" className="text-yellow-400 hover:underline">sandncolol@gmail.com</a>
            </Section>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center text-xs font-mono text-zinc-600">
          <Link href="/legal/tos" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="/support" className="hover:text-yellow-400 transition-colors">Support</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-tech text-xs text-yellow-400 tracking-widest uppercase mb-2">{title}</h2>
      <div className="text-zinc-400">{children}</div>
    </div>
  )
}
