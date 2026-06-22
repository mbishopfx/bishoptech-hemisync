import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'AI Disclosure | Cognistration',
  description: 'How Cognistration uses AI-assisted features, prompts, and generated outputs on bishoptech.dev.',
  path: '/ai-disclosure'
});

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-medium tracking-tight text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-white/60">{children}</div>
    </section>
  );
}

export default function AIDisclosurePage() {
  return (
    <LegalPageShell
      eyebrow="AI Disclosure"
      title="Cognistration AI Disclosure"
      summary="Cognistration uses AI-assisted features to help generate tone suggestions, support product matching, and power certain internal workflows. This page explains the boundaries in plain language."
    >
      <Section title="Where AI is used">
        <p>
          Cognistration may use AI to help generate or refine audio tone ideas,
          suggest matches, support moderation or safety workflows, and assist
          with product operations. Some responses may be generated or shaped by
          model output before they are reviewed or used in the product.
        </p>
      </Section>

      <Section title="What AI does not do">
        <p>
          AI output is not medical advice, diagnosis, treatment, crisis support,
          or a guarantee of any result. Users should review the experience and
          use judgment before relying on any generated suggestion.
        </p>
      </Section>

      <Section title="Data handling">
        <p>
          Prompts and related session data may be sent to service providers that
          support hosting, analytics, authentication, storage, billing, and AI
          processing. Cognistration only shares the data reasonably necessary to
          deliver the feature being used.
        </p>
      </Section>

      <Section title="Human oversight">
        <p>
          The product is designed to stay trust-first and conservative. When a
          workflow depends on AI output, we aim to keep user-facing claims clear
          and grounded in what the product actually does.
        </p>
      </Section>

      <Section title="Related policies">
        <p>
          Review the <a className="text-cyan-300 hover:text-cyan-200" href="/privacy">Privacy Policy</a>,{' '}
          <a className="text-cyan-300 hover:text-cyan-200" href="/terms">Terms</a>, and{' '}
          <a className="text-cyan-300 hover:text-cyan-200" href="/health-warning">Health Warning</a>
          {' '}for the broader operating rules.
        </p>
      </Section>
    </LegalPageShell>
  );
}
