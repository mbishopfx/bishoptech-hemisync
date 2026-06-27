import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { buildAbsoluteUrl } from '@/lib/seo';

export const metadata = {
  title: { absolute: 'Contact & Support — Cognistration' },
  description: 'Contact Cognistration for general questions, billing help, privacy requests, and legal notices.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact & Support — Cognistration',
    description: 'Contact Cognistration for general questions, billing help, privacy requests, and legal notices.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/contact',
    images: [{ url: '/images/og-preview.png', width: 886, height: 886, alt: 'Cognistration preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact & Support — Cognistration',
    description: 'Contact Cognistration for general questions, billing help, privacy requests, and legal notices.',
    images: ['/images/og-preview.png'],
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact & Support | Cognistration',
  description: 'Contact Cognistration for general questions, billing help, privacy requests, and legal notices.',
  url: buildAbsoluteUrl('/contact'),
  mainEntity: {
    '@type': 'Organization',
    '@id': buildAbsoluteUrl('/#organization')
  }
};

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/60">{children}</div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <LegalPageShell
      eyebrow="Contact & Support"
      title="Contact Cognistration"
      summary="Use this page for general questions, billing help, privacy requests, and legal notices. Contact paths stay simple and direct."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Section title="General contact">
        <p>For general questions, account help, or support requests, email <a className="text-cyan-300 hover:text-cyan-200" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </Section>

      <Section title="Privacy requests">
        <p>For data access, deletion, or privacy questions, email <a className="text-cyan-300 hover:text-cyan-200" href="mailto:matt@bishoptech.dev">matt@bishoptech.dev</a>.</p>
      </Section>

      <Section title="What to include">
        <p>If your message is about an account, billing issue, or content problem, include the email address tied to the account and a short description of the issue so we can route it efficiently.</p>
      </Section>

      <Section title="Business identity">
        <p>Cognistration is the public product name used across the site. The contact addresses above are the current official paths published on the site.</p>
      </Section>
    </LegalPageShell>
  );
}