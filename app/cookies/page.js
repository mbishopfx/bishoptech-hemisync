import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';
import { PrivacyChoicesButton } from '@/components/analytics/AnalyticsConsent';

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
      title="Cognistration cookie policy"
      activeHref="/cookies"
      lastUpdated="October 18, 2026"
      lastUpdatedDate="2026-10-18"
      summary="Cognistration uses cookies and browser storage for sign-in continuity, preferences, playback, preview limits, and product operation."
    >
      <PolicySection id="what-we-use" title="What we use">
        <p>We use essential cookies and browser storage to keep sign-in stable, remember preferences, preserve playback and preview state, and enforce public-preview limits. Optional Google Analytics measures general page views, CTA clicks, form starts, and completed purchases only after you allow it. These events exclude prompts, journal entries, health details, and form contents. Analytics can be changed through <PrivacyChoicesButton className="underline underline-offset-2" />.</p>
        <p>For unauthenticated visitors, a short-lived functional cookie can help count public preview generations. It is used for product operation, not as an advertising profile.</p>
      </PolicySection>

      <PolicySection id="why" title="Why they matter">
        <p>Essential storage supports requested site features. Optional analytics storage is used by Google Analytics only after you allow analytics. Rejecting analytics does not affect site features.</p>
      </PolicySection>

      <PolicySection id="choices" title="Your choices">
        <p>Use <PrivacyChoicesButton className="underline underline-offset-2" /> to allow or reject optional analytics at any time. Your choice is saved in local storage. You can also clear it in your browser settings; analytics will remain off until you choose again. Blocking essential cookies or local storage may affect sign-in, saved state, playback continuity, and public-preview limits.</p>
      </PolicySection>

      <PolicySection id="related" title="Related information">
        <p>For more detail about personal information, review the <a className="text-[#b6ddcc] underline decoration-[#b6ddcc]/40 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b6ddcc]" href="/privacy">Privacy Policy</a>.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
