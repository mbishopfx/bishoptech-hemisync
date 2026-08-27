import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';

export const metadata = {
  title: { absolute: 'Cookie Policy — Cognistration' },
  description: 'How Cognistration uses cookies and browser storage to operate the site.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Cookie Policy — Cognistration',
    description: 'How Cognistration uses cookies and browser storage to operate the site.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/cookies',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy — Cognistration',
    description: 'How Cognistration uses cookies and browser storage to operate the site.',
    images: ['/images/og-preview.png'],
  },
};

export default function CookiesPage() {
  return (
    <LegalPageShell
      title="How browser storage helps"
      summary="Cognistration uses cookies and browser storage for sign-in continuity, preferences, playback, preview limits, and product operation."
    >
      <PolicySection id="what-we-use" title="What we use">
        <p>We use cookies, local storage, and similar browser technologies to keep sign-in stable, remember preferences, preserve playback and preview state, enforce public-preview limits, and understand product performance.</p>
        <p>For unauthenticated visitors, a short-lived functional cookie can help count public preview generations. It is used for product operation, not as an advertising profile.</p>
      </PolicySection>

      <PolicySection id="why" title="Why they matter">
        <p>These tools help pages and sessions work consistently across visits. Some are essential to a feature; others help us understand whether the product is working as intended.</p>
      </PolicySection>

      <PolicySection id="choices" title="Your choices">
        <p>You can remove or block cookies and local storage through your browser settings. Sign-in, saved state, playback continuity, and public-preview limits may not work as expected after you do so.</p>
      </PolicySection>

      <PolicySection id="related" title="Related information">
        <p>For more detail about personal information, review the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/privacy">Privacy Policy</a>.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
