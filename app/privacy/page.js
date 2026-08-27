import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';

export const metadata = {
  title: { absolute: 'Privacy Policy — Cognistration' },
  description: 'How Cognistration handles account, session, device, payment, and AI-assisted feature data.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy — Cognistration',
    description: 'How Cognistration handles account, session, device, payment, and AI-assisted feature data.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/privacy',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy — Cognistration',
    description: 'How Cognistration handles account, session, device, payment, and AI-assisted feature data.',
    images: ['/images/og-preview.png'],
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Cognistration privacy policy"
      activeHref="/privacy"
      summary="This policy describes the information Cognistration receives when you create an account, use a session, contact support, make a purchase, or use an AI-assisted feature."
    >
      <PolicySection id="information-you-provide" title="Information you provide">
        <p>This can include account and profile details, prompts and intentions, session settings, journal entries, saved tones, community posts, purchase or delivery details, and messages you send to support. If you choose to enter sensitive information into a feature, it may be processed as part of providing that feature.</p>
      </PolicySection>

      <PolicySection id="automatic-information" title="Information collected automatically">
        <p>Depending on how you use the site, hosting and security systems may receive technical information such as browser and device details, IP address, request and page activity, cookies sent with a request, and product analytics events. Your browser may also keep cookies, local-storage values, and playback or preview state on your device. Some of these values are needed for sign-in, playback, public-preview limits, security, or site measurement.</p>
      </PolicySection>

      <PolicySection id="uses" title="How we use information">
        <p>We use information to create and secure accounts, deliver and save sessions, provide previews and downloads, process purchases, support the product, improve matching and safety workflows, prevent abuse, understand performance, and respond to requests.</p>
        <p>We use prompts and session information only as needed for the feature you request, including tone matching, session assistance, journaling support, or related product operations.</p>
      </PolicySection>

      <PolicySection id="ai-processing" title="AI-assisted features">
        <p>When you use an AI-assisted feature, the text and session context needed for that request may be sent to an AI processing provider. The public matcher selects from Cognistration’s available tone catalog; workspace assistance may help shape a session draft. Automated output can be wrong, so review it before use.</p>
        <p>Do not enter information into an AI-assisted feature that you do not want processed to provide that feature. See the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/ai-disclosure">AI Disclosure</a> for more detail.</p>
      </PolicySection>

      <PolicySection id="providers" title="Service providers">
        <p>Cognistration relies on service providers for authentication and data storage, hosting, site analytics, payments, email or delivery, and AI processing. For example, Supabase supports authentication and storage, Stripe processes payments, Vercel hosts the site and provides analytics, and AI providers process prompts needed for selected features.</p>
        <p>Information may be shared with a provider when it is reasonably necessary to perform the service you requested. Those providers may handle information under their own privacy terms.</p>
      </PolicySection>

      <PolicySection id="payments" title="Payments">
        <p>Payments are processed by Stripe or another payment processor shown at checkout. Cognistration does not store full payment-card numbers in its application data. The processor may collect and retain payment and transaction information under its own terms and policies.</p>
      </PolicySection>

      <PolicySection id="security" title="How we protect information">
        <p>We use HTTPS for the production site, access controls for authenticated data, and security features provided by our hosting, database, authentication, and payment providers. Payment details are entered through hosted payment checkout rather than Cognistration’s audio tools. No online service is completely risk-free, so please use a unique password and contact support promptly if you suspect unauthorized access.</p>
      </PolicySection>

      <PolicySection id="cookies-and-storage" title="Cookies and local storage">
        <p>Cognistration uses cookies and browser storage for sign-in continuity, preferences, playback and preview state, usage limits, and product operation. A short-lived functional cookie can help enforce unauthenticated public-preview limits.</p>
        <p>You can block or remove cookies and local storage through your browser settings. Some features, including sign-in, saved state, playback continuity, and preview-limit enforcement, may not work correctly afterward. The <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/cookies">Cookie Policy</a> has more detail.</p>
      </PolicySection>

      <PolicySection id="sharing" title="When information is shared">
        <p>We do not sell your personal information for money. We may share information with service providers, when required by law or legal process, to protect users and the service, or as part of a merger, acquisition, financing, or transfer of assets.</p>
      </PolicySection>

      <PolicySection id="choices" title="Your choices">
        <p>You can update account information from your profile settings where available. You can ask about access, correction, or deletion of account data by emailing <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>. We may need enough information to identify the account and protect it from an unauthorized request.</p>
        <p>Some information may need to remain available for security, accounting, fraud prevention, dispute resolution, service integrity, or legal compliance. We do not state a fixed retention period here because it depends on the feature and the reason the information is kept.</p>
      </PolicySection>

      <PolicySection id="children" title="Children">
        <p>Cognistration is not directed to children under 13. If you believe a child has provided personal information through the service, contact <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </PolicySection>

      <PolicySection id="health-context" title="Health and safety context">
        <p>Cognistration is for entertainment and general wellness exploration. It is not medical advice, diagnosis, treatment, or emergency support. Review the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/health-warning">Health &amp; Safety guidance</a> before listening.</p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>Questions about this policy or a privacy request can be sent to <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
