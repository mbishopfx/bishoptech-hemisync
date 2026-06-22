import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy | Cognistration',
  description: 'Privacy Policy for Cognistration on bishoptech.dev.',
  path: '/privacy'
});

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/60">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy Policy"
      title="Cognistration Privacy Policy"
      summary="Effective June 12, 2026. This policy explains what information Cognistration collects on bishoptech.dev, how it is used, and the choices available to users."
    >
      <Section title="Information we collect">
        <p>We collect information you provide directly, including account details, profile information, prompts, journal entries, saved tones, community posts, and support messages.</p>
        <p>We also collect technical and usage data such as browser details, device information, IP address, page activity, cookies, local storage values, and product analytics events.</p>
        <p>Payments are processed by Stripe. Cognistration does not store full payment card numbers.</p>
      </Section>

      <Section title="How we use information">
        <p>We use information to operate the service, authenticate accounts, deliver audio sessions, save your library, process subscriptions, improve matching and safety systems, detect abuse, and respond to support requests.</p>
        <p>Prompts and session data may be sent to service providers that help power tone generation, AI-assisted matching, hosting, analytics, storage, authentication, and billing.</p>
      </Section>

      <Section title="Service providers and infrastructure">
        <p>Cognistration uses vendors such as Supabase for authentication and data storage, Stripe for payments, Vercel for hosting and analytics, and AI providers to process prompts needed for product features.</p>
        <p>These providers only receive the data reasonably necessary to perform their services for Cognistration.</p>
      </Section>

      <Section title="Cookies and local storage">
        <p>bishoptech.dev uses cookies and local storage to keep users signed in, preserve playback state, enforce usage limits, and understand product activity.</p>
        <p>We also use a short-lived functional cookie for unauthenticated trial limits. You can control cookies through your browser settings, but disabling them may break parts of the service.</p>
      </Section>

      <Section title="Data sharing">
        <p>Cognistration does not sell personal information for money. We may share information with vendors, affiliates, legal authorities, or counterparties involved in a merger, acquisition, financing, or asset transfer when reasonably necessary.</p>
      </Section>

      <Section title="Your choices">
        <p>You may update account information from your profile settings where available. You may also request account or data deletion by contacting <a className="text-cyan-300 hover:text-cyan-200" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
        <p>Some information may be retained when required for security, accounting, fraud prevention, dispute resolution, or legal compliance.</p>
      </Section>

      <Section title="Children">
        <p>Cognistration is not directed to children under 13, and users under 18 should use the service only with a parent or legal guardian’s involvement.</p>
      </Section>

      <Section title="Health and safety context">
        <p>Cognistration is offered for entertainment and general wellness exploration only. It is not medical advice, diagnosis, treatment, or a regulated medical device.</p>
        <p>If you have epilepsy, a seizure history, auditory sensitivity, a neurological condition, or any medical condition that could be aggravated by repetitive sound or altered alertness, use only with physician approval.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about this policy can be sent to <a className="text-cyan-300 hover:text-cyan-200" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </Section>
    </LegalPageShell>
  );
}
