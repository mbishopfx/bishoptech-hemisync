import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Cookie Policy | Cognistration',
  description: 'Cookie Policy for Cognistration on bishoptech.dev.',
  path: '/cookies'
});

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/60">{children}</div>
    </section>
  );
}

export default function CookiesPage() {
  return (
    <LegalPageShell
      eyebrow="Cookie Policy"
      title="Cognistration Cookie Policy"
      summary="Effective June 13, 2026. This page explains the cookies and similar storage tools used on bishoptech.dev."
    >
      <Section title="What we use">
        <p>We use cookies, local storage, and similar technologies to keep users signed in, remember playback state, preserve preferences, measure product performance, and understand how the site is used.</p>
        <p>For unauthenticated visitors, Cognistration also uses a short-lived usage counter cookie to enforce free trial limits. That cookie is functional, not advertising-based.</p>
      </Section>

      <Section title="Why we use them">
        <p>These tools help the site function properly, keep sessions stable, reduce repeated sign-ins, and make the experience smoother across pages and visits.</p>
        <p>We do not use these storage tools to run ad targeting or third-party profiling on this site.</p>
      </Section>

      <Section title="Your choices">
        <p>You can remove or block cookies through your browser settings. If you do, some parts of the site may not work as expected, including sign-in, saved state, playback continuity, and trial-limit enforcement.</p>
      </Section>

      <Section title="Related information">
        <p>For more detail about how we handle personal information, please review the <a className="text-cyan-300 hover:text-cyan-200" href="/privacy">Privacy Policy</a>.</p>
      </Section>
    </LegalPageShell>
  );
}
