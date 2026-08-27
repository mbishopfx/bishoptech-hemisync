import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';

export const metadata = {
  title: { absolute: 'Terms and Conditions — Cognistration' },
  description: 'Terms for using Cognistration audio sessions, tools, accounts, and digital purchases.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms and Conditions — Cognistration',
    description: 'Terms for using Cognistration audio sessions, tools, accounts, and digital purchases.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/terms',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms and Conditions — Cognistration',
    description: 'Terms for using Cognistration audio sessions, tools, accounts, and digital purchases.',
    images: ['/images/og-preview.png'],
  },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Cognistration terms of use"
      summary="These Terms govern your use of Cognistration, including its audio sessions, tone library, private workspace, account features, and digital purchases."
    >
      <PolicySection id="agreement" title="Your agreement">
        <p>By accessing or using Cognistration, you agree to these Terms. If you do not agree, do not use the service. If you use Cognistration for an organization or another person, you confirm that you have authority to accept these Terms on their behalf.</p>
      </PolicySection>

      <PolicySection id="service" title="What Cognistration provides">
        <p>Cognistration provides adjustable audio sessions, a public tone library, a private workspace, saved projects, digital downloads, and automated assistance for matching or shaping sessions. Features can vary by account, offer, device, and availability.</p>
        <p>The service is for entertainment and general wellness exploration. It is not medical advice, diagnosis, treatment, therapy, emergency support, or a substitute for a qualified professional.</p>
      </PolicySection>

      <PolicySection id="safety" title="Health and listening safety">
        <p>Review the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/health-warning">Health &amp; Safety guidance</a> before listening. Do not use Cognistration while driving, operating machinery, or doing anything that requires full situational awareness. Stop if you feel unwell and seek appropriate help when needed.</p>
      </PolicySection>

      <PolicySection id="accounts" title="Accounts and access">
        <p>Provide accurate account information, keep your sign-in details secure, and tell us if you believe someone has accessed your account without permission. You are responsible for activity under your account unless applicable law says otherwise.</p>
        <p>Cognistration is not directed to children under 13. If you are under the age of majority where you live, use the service only with the involvement and permission of a parent or legal guardian.</p>
      </PolicySection>

      <PolicySection id="purchases" title="Purchases and payment">
        <p>Paid workspace access, trials, tone packs, and one-time workshops may be offered. The price, duration, access, and any purchase-specific terms are shown before you confirm payment. Card details are handled by the payment processor’s hosted checkout rather than entered into Cognistration’s audio tools.</p>
        <p>Refunds, cancellations, and other purchase rights are governed by applicable law and any terms shown with the specific offer. For a billing or delivery problem, <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/contact">contact support</a> with the purchase email and date. Do not email payment-card details.</p>
      </PolicySection>

      <PolicySection id="acceptable-use" title="Acceptable use">
        <p>Do not use Cognistration to break the law, harm another person, infringe rights, distribute abusive or unlawful material, probe or disrupt the service, bypass access controls, scrape protected data, or impersonate another person.</p>
      </PolicySection>

      <PolicySection id="content" title="Your content and generated results">
        <p>You keep ownership of content you submit. You give Cognistration the limited permission needed to host, process, store, reproduce, and display that content to provide, secure, and improve the features you use. If you choose to publish content through a public or community feature, it may be visible to others as described at the time you publish it.</p>
        <p>You are responsible for having the rights to submit content and for reviewing generated suggestions before you use or share them. Automated output may be inaccurate, incomplete, or not unique.</p>
      </PolicySection>

      <PolicySection id="changes" title="Availability and changes">
        <p>We may update, suspend, or discontinue a feature, and we may update these Terms when the service changes. We do not promise uninterrupted availability or that every session, suggestion, download, or result will meet a particular expectation.</p>
      </PolicySection>

      <PolicySection id="disclaimers" title="Disclaimers and liability">
        <p>To the fullest extent permitted by law, Cognistration is provided on an “as is” and “as available” basis without guarantees that the service will be uninterrupted, error-free, or fit for a particular purpose.</p>
        <p>To the fullest extent permitted by law, Cognistration will not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service. Nothing in these Terms limits rights or remedies that cannot legally be limited.</p>
      </PolicySection>

      <PolicySection id="termination" title="Suspension and termination">
        <p>We may suspend or end access when reasonably necessary to protect users, the service, or others, or when you violate these Terms. You may stop using Cognistration at any time. Provisions that should continue by their nature, including ownership, disclaimers, and limitations, will continue to apply.</p>
      </PolicySection>

      <PolicySection id="contact" title="Questions">
        <p>Questions about these Terms can be sent to <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
