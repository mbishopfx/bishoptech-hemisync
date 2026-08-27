import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';
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
      <div className="flex flex-col gap-5 border-b border-[#cbd6cf] pb-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#315e55]">Support email</p>
          <a className="mt-2 inline-block break-words text-2xl font-medium tracking-[-0.04em] text-[#1d302c] underline decoration-[#9ebaae] underline-offset-8 transition hover:text-[#315e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477] sm:text-3xl" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>
        </div>
        <a href="mailto:matt@bishoptech.dev" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#1d302c] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#315e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]">Send an email</a>
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
        <p>Product support cannot assess a medical condition or provide emergency help. Review the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/health-warning">Health &amp; Safety guidance</a> before listening. If you may be in immediate danger or need urgent care, contact local emergency services or a qualified professional.</p>
      </PolicySection>

      <PolicySection id="what-to-send" title="What to send">
        <p>A short description, the affected page or feature, and the email tied to the account are usually enough. If you are reporting a problem, include the steps that led to it and any visible error message. Please leave out passwords, private journal text, payment credentials, and sensitive health information unless it is essential to your request.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
