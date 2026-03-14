import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Eye } from 'lucide-react'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="KGT" fill className="object-contain" />
          </div>
          <Link href="/" className="text-xs font-bold tracking-[0.2em] text-glow-cyan uppercase">
            KING_OF_GOOD_TIMES
          </Link>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <div className="terminal-dots"><span /><span /><span /></div>
            <div className="terminal-title">
              <Eye className="w-3 h-3" /> PRIVACY_POLICY
            </div>
          </div>

          <div className="terminal-body">
            <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider mb-1">
              PRIVACY_POLICY
            </h1>
            <p className="text-[9px] text-[var(--text-dim)] mb-8 tracking-wider">LAST_UPDATED: MARCH_2026</p>

            <div className="space-y-6 text-[11px] leading-relaxed">
              <Section title="1. INFORMATION_WE_COLLECT">
                <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">ACCOUNT_INFO:</span> Email, username, display name, city</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">ACTIVITY_DATA:</span> Posts, votes, challenge entries, wallet transactions</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">TECHNICAL_DATA:</span> IP address, device type, browser, usage patterns</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">PAYMENT_DATA:</span> Handled by Razorpay — we do not store card details</li>
                </ul>
              </Section>

              <Section title="2. HOW_WE_USE_YOUR_DATA">
                <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To operate and improve the platform</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To process payments and manage wallets</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To send important notifications about your account</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To enforce our community guidelines</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To provide analytics (via PostHog — anonymized)</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>To provide AI support (via our assistant — inputs are processed but not stored long-term)</li>
                </ul>
              </Section>

              <Section title="3. ANONYMOUS_CONTENT">
                When you post anonymous rumors, your identity is hidden from other users. However, we internally maintain a link between your account and your anonymous posts for moderation purposes. We will reveal this information if legally required.
              </Section>

              <Section title="4. DATA_SHARING">
                We do not sell your personal data. We share data with:
                <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">RAZORPAY</span> — payment processing</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">SUPABASE</span> — database and authentication</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">CLOUDFLARE</span> — CDN, security, media storage</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">RESEND</span> — transactional email</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span><span className="text-white">POSTHOG</span> — anonymized analytics</li>
                </ul>
              </Section>

              <Section title="5. DATA_RETENTION">
                <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Account data: Retained while your account is active</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Transaction records: 7 years for financial compliance</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Support tickets: 2 years after resolution</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Deleted account data: Purged within 30 days (some data retained for compliance)</li>
                </ul>
              </Section>

              <Section title="6. COOKIES">
                We use essential cookies for authentication and session management. No tracking cookies are used without consent. You can disable cookies in your browser settings.
              </Section>

              <Section title="7. YOUR_RIGHTS">
                You have the right to:
                <ul className="space-y-2 mt-2 text-[var(--text-dim)]">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Access the personal data we hold about you</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Request correction of inaccurate data</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Request deletion of your account and data</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Port your data to another service</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Object to certain processing</li>
                </ul>
                To exercise these rights, email <a href="mailto:sandncolol@gmail.com" className="text-[var(--cyan)] hover:underline">SANDNCOLOL@GMAIL.COM</a>
              </Section>

              <Section title="8. SECURITY">
                We implement industry-standard security measures including 256-bit SSL encryption, secure authentication via Supabase, and Cloudflare security protection. However, no system is 100% secure.
              </Section>

              <Section title="9. CHILDREN&apos;S_PRIVACY">
                This platform is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately.
              </Section>

              <Section title="10. CONTACT">
                Privacy concerns? Contact us at{' '}
                <a href="mailto:sandncolol@gmail.com" className="text-[var(--cyan)] hover:underline">SANDNCOLOL@GMAIL.COM</a>
              </Section>
            </div>
          </div>

          <div className="terminal-footer">
            <Lock className="w-3 h-3" />
            LEGAL_DOCUMENT | SANDNCO.LOL
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center text-[9px] text-[var(--text-dim)] tracking-[0.15em] uppercase">
          <Link href="/legal/tos" className="hover:text-[var(--cyan)] transition-colors">TERMS_OF_SERVICE</Link>
          <span className="text-[var(--text-ghost)]">·</span>
          <Link href="/support" className="hover:text-[var(--cyan)] transition-colors">SUPPORT</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] text-[var(--cyan)] tracking-[0.2em] uppercase mb-2 font-bold">{title}</h2>
      <div className="text-[var(--text-dim)]">{children}</div>
    </div>
  )
}
