import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Terminal, ChevronLeft } from 'lucide-react'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-[var(--cyan)] font-mono py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Logo */}
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
              <Shield className="w-3 h-3" /> TERMS_OF_SERVICE
            </div>
          </div>

          <div className="terminal-body">
            <h1 className="text-2xl font-extrabold text-glow-cyan uppercase tracking-wider mb-1">
              TERMS_OF_SERVICE
            </h1>
            <p className="text-[9px] text-[var(--text-dim)] mb-8 tracking-wider">LAST_UPDATED: MARCH_2026</p>

            <div className="space-y-6 text-[11px] text-[var(--text-dim)] leading-relaxed">
              <Section title="1. ACCEPTANCE_OF_TERMS">
                By accessing or using sandnco.lol (&quot;King of Good Times&quot;, &quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
              </Section>

              <Section title="2. ELIGIBILITY">
                You must be at least 18 years of age to use this platform. By registering, you represent and warrant that you meet this requirement.
              </Section>

              <Section title="3. USER_ACCOUNTS">
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>You may not create multiple accounts to circumvent bans or restrictions.</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                </ul>
              </Section>

              <Section title="4. CONTENT_RULES">
                When posting rumors, comments, or any content, you agree NOT to:
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Directly name or identify private individuals in harmful contexts</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Accuse individuals of crimes without substantial evidence</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Post hate speech, discrimination, or targeted harassment</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Share defamatory, false, or deliberately misleading information</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Post content that is sexually explicit or involves minors</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--red)]">▸</span>Violate any applicable laws or regulations</li>
                </ul>
              </Section>

              <Section title="5. RUMOR_SYSTEM">
                Rumors are user-generated content. We do not endorse, verify, or take responsibility for user-posted content. All rumors are subject to moderation and may be edited, removed, or investigated by our Myth-Buster team.
              </Section>

              <Section title="6. CHALLENGE_SYSTEM_&_PRIZES">
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Challenge prizes are subject to platform fees (10%)</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Decisions by judges and AI scoring are final</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>We reserve the right to cancel challenges due to insufficient participation</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Entry fees are non-refundable once a challenge begins</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Premium membership does NOT influence challenge outcomes</li>
                </ul>
              </Section>

              <Section title="7. WALLET_&_PAYMENTS">
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Wallet funds are non-transferable between accounts</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Withdrawals are subject to verification and processing times</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>We use Razorpay for secure payment processing</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>Minimum withdrawal amount: ₹100</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--cyan)]">▸</span>All payments are in Indian Rupees (INR)</li>
                </ul>
              </Section>

              <Section title="8. PREMIUM_MEMBERSHIP">
                Premium membership grants access to exclusive features and challenges. Memberships are non-refundable after activation. Auto-renewal can be cancelled at any time before the next billing date.
              </Section>

              <Section title="9. MODERATION">
                We reserve the right to moderate, edit, or remove any content that violates these terms. Repeated violations may result in account suspension or permanent ban. Moderation decisions can be appealed through our support system.
              </Section>

              <Section title="10. INTELLECTUAL_PROPERTY">
                All platform content, design, logos, and branding are the property of sandnco.lol. User-generated content remains the property of users, but by posting you grant us a license to display and moderate it.
              </Section>

              <Section title="11. LIMITATION_OF_LIABILITY">
                To the maximum extent permitted by law, sandnco.lol is not liable for any indirect, incidental, or consequential damages arising from use of the platform. Total liability is limited to amounts paid by you in the past 30 days.
              </Section>

              <Section title="12. CHANGES_TO_TERMS">
                We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </Section>

              <Section title="13. CONTACT">
                For questions about these terms, contact us at{' '}
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
          <Link href="/legal/privacy" className="hover:text-[var(--cyan)] transition-colors">PRIVACY_POLICY</Link>
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
