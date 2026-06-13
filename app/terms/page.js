import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata = {
  title: 'Terms and Conditions | Cognistration',
  description: 'Terms and Conditions for cognistration.com.'
};

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/60">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms and Conditions"
      title="Cognistration Terms and Conditions"
      summary="Effective June 12, 2026. These terms govern access to and use of cognistration.com and any related Cognistration services."
    >
      <Section title="Acceptance of terms">
        <p>By accessing or using Cognistration, you agree to these Terms and Conditions. If you do not agree, do not use the service.</p>
      </Section>

      <Section title="Nature of the service">
        <p>Cognistration provides entertainment and general wellness audio experiences, AI-assisted matching, saved libraries, community features, and related digital tools.</p>
        <p>Cognistration is not medical advice, mental health treatment, emergency support, or a substitute for a licensed professional.</p>
      </Section>

      <Section title="Health warning">
        <p>Do not use Cognistration while driving, operating machinery, or doing anything that requires full situational awareness.</p>
        <p>Do not use without physician approval if you have epilepsy, a seizure disorder, auditory hypersensitivity, a neurological condition, or another medical condition that could be affected by repetitive sound or altered alertness.</p>
        <p>Stop immediately if you experience discomfort, dizziness, disorientation, headache, anxiety, or any other adverse reaction.</p>
      </Section>

      <Section title="Accounts and subscriptions">
        <p>You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs under your account.</p>
        <p>Paid subscriptions, trials, and one-time purchases may be offered through Stripe or another payment processor. Fees are non-refundable except where required by law or expressly stated by Cognistration.</p>
      </Section>

      <Section title="Acceptable use">
        <p>You may not misuse the service, interfere with infrastructure, attempt unauthorized access, scrape protected data, infringe intellectual property rights, or use the service to create harmful, unlawful, or abusive content.</p>
      </Section>

      <Section title="User content">
        <p>You retain ownership of content you submit, but you grant Cognistration a limited license to host, process, store, reproduce, and display that content as needed to operate the service.</p>
        <p>You are responsible for ensuring that your submitted content does not violate law or third-party rights.</p>
      </Section>

      <Section title="Availability and changes">
        <p>Cognistration may modify, suspend, or discontinue features at any time. We do not guarantee uninterrupted availability or that every generated result will meet a particular expectation.</p>
      </Section>

      <Section title="Disclaimers and limitation of liability">
        <p>The service is provided on an “as is” and “as available” basis to the fullest extent permitted by law.</p>
        <p>To the fullest extent permitted by law, Cognistration disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted operation, and will not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service.</p>
      </Section>

      <Section title="Termination">
        <p>Cognistration may suspend or terminate access if you violate these terms, create risk for the platform, or use the service in a way that is unlawful or harmful.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about these terms can be sent to <a className="text-cyan-300 hover:text-cyan-200" href="mailto:legal@cognistration.com">legal@cognistration.com</a>.</p>
      </Section>
    </LegalPageShell>
  );
}
