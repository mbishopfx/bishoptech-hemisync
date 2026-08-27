import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';
import { PolicyLink } from '@/components/legal/PolicyLink';
import { buildAbsoluteUrl } from '@/lib/seo';

export const metadata = {
  title: { absolute: 'Contact & Support — Cognistration' },
  description: 'Contact Cognistration for account help, billing questions, privacy requests, and product support.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact & Support — Cognistration',
    description: 'Contact Cognistration for account help, billing questions, privacy requests, and product support.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/contact',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Support — Cognistration',
    description: 'Contact Cognistration for account help, billing questions, privacy requests, and product support.',
    images: ['/images/og-preview.png'],
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact & Support | Cognistration',
  description: 'Contact Cognistration for account help, billing questions, privacy requests, and product support.',
  url: buildAbsoluteUrl('/contact'),
  mainEntity: {
    '@type': 'Organization',
    '@id': buildAbsoluteUrl('/#organization')
  }
};

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Cognistration support"
      activeHref="/contact"
      summary="Use one direct support path for account questions, billing, privacy requests, and product feedback."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="policy-contact">
        <div>
          <h2 className="policy-contact__label">Email support</h2>
          <address className="not-italic">
            <a className="policy-contact__email" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>
          </address>
        </div>
        <a href="mailto:matt@bishoptech.dev" className="policy-contact__action">Email support</a>
      </div>

      <PolicySection id="general-help" title="General help">
        <p>Use the support email for sign-in issues, session questions, tone pack questions, accessibility feedback, or anything that does not fit another category.</p>
      </PolicySection>

      <PolicySection id="billing" title="Billing and purchases">
        <p>For a checkout, subscription, one-time purchase, or download issue, include the email used at checkout and the approximate date of the purchase. Do not send a password, full payment-card number, security code, or other payment credentials by email.</p>
      </PolicySection>

      <PolicySection id="privacy-requests" title="Privacy requests">
        <p>For an account or data question, say whether you are asking about access, correction, deletion, or another privacy concern. Include the email address associated with the account so we can identify the right record and respond through the appropriate process.</p>
      </PolicySection>

      <PolicySection id="safety" title="Health and safety">
        <p>Product support cannot assess a medical condition or provide emergency help. Review the <PolicyLink href="/health-warning">Health &amp; Safety guidance</PolicyLink> before listening. If you may be in immediate danger or need urgent care, contact local emergency services or a qualified professional.</p>
      </PolicySection>

      <PolicySection id="what-to-send" title="What to send">
        <p>A short description, the affected page or feature, and the email tied to the account are usually enough. If you are reporting a problem, include the steps that led to it and any visible error message. Please leave out passwords, private journal text, payment credentials, and sensitive health information unless it is essential to your request.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
