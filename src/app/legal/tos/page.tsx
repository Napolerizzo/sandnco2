import Link from 'next/link'
import Image from 'next/image'

export const metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030303] grid-bg py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Logo */}
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
            TERMS OF SERVICE
          </h1>
          <p className="font-mono text-xs text-zinc-500 mb-8">Last updated: March 2026</p>

          <div className="space-y-6 font-mono text-sm text-zinc-300 leading-relaxed">
            <Section title="1. Acceptance of Terms">
              By accessing or using sandnco.lol (&quot;King of Good Times&quot;, &quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
            </Section>

            <Section title="2. Eligibility">
              You must be at least 18 years of age to use this platform. By registering, you represent and warrant that you meet this requirement.
            </Section>

            <Section title="3. User Accounts">
              <ul className="space-y-2 mt-2">
                <li>• You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>• You may not create multiple accounts to circumvent bans or restrictions.</li>
                <li>• We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </Section>

            <Section title="4. Content Rules">
              When posting rumors, comments, or any content, you agree NOT to:
              <ul className="space-y-2 mt-2">
                <li>• Directly name or identify private individuals in harmful contexts</li>
                <li>• Accuse individuals of crimes without substantial evidence</li>
                <li>• Post hate speech, discrimination, or targeted harassment</li>
                <li>• Share defamatory, false, or deliberately misleading information</li>
                <li>• Post content that is sexually explicit or involves minors</li>
                <li>• Violate any applicable laws or regulations</li>
              </ul>
            </Section>

            <Section title="5. Rumor System">
              Rumors are user-generated content. We do not endorse, verify, or take responsibility for user-posted content. All rumors are subject to moderation and may be edited, removed, or investigated by our Myth-Buster team.
            </Section>

            <Section title="6. Challenge System & Prizes">
              <ul className="space-y-2 mt-2">
                <li>• Challenge prizes are subject to platform fees (10%)</li>
                <li>• Decisions by judges and AI scoring are final</li>
                <li>• We reserve the right to cancel challenges due to insufficient participation</li>
                <li>• Entry fees are non-refundable once a challenge begins</li>
                <li>• Premium membership does NOT influence challenge outcomes</li>
              </ul>
            </Section>

            <Section title="7. Wallet & Payments">
              <ul className="space-y-2 mt-2">
                <li>• Wallet funds are non-transferable between accounts</li>
                <li>• Withdrawals are subject to verification and processing times</li>
                <li>• We use Razorpay for secure payment processing</li>
                <li>• Minimum withdrawal amount: ₹100</li>
                <li>• All payments are in Indian Rupees (INR)</li>
              </ul>
            </Section>

            <Section title="8. Premium Membership">
              Premium membership grants access to exclusive features and challenges. Memberships are non-refundable after activation. Auto-renewal can be cancelled at any time before the next billing date.
            </Section>

            <Section title="9. Moderation">
              We reserve the right to moderate, edit, or remove any content that violates these terms. Repeated violations may result in account suspension or permanent ban. Moderation decisions can be appealed through our support system.
            </Section>

            <Section title="10. Intellectual Property">
              All platform content, design, logos, and branding are the property of sandnco.lol. User-generated content remains the property of users, but by posting you grant us a license to display and moderate it.
            </Section>

            <Section title="11. Limitation of Liability">
              To the maximum extent permitted by law, sandnco.lol is not liable for any indirect, incidental, or consequential damages arising from use of the platform. Total liability is limited to amounts paid by you in the past 30 days.
            </Section>

            <Section title="12. Changes to Terms">
              We may update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
            </Section>

            <Section title="13. Contact">
              For questions about these terms, contact us at{' '}
              <a href="mailto:sandncolol@gmail.com" className="text-yellow-400 hover:underline">sandncolol@gmail.com</a>
            </Section>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center text-xs font-mono text-zinc-600">
          <Link href="/legal/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
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
