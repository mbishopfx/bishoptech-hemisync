import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Health Warning | Cognistration',
  description: 'Health and safety warning for Cognistration on bishoptech.dev.',
  path: '/health-warning'
});

function WarningCard({ title, body }) {
  return (
    <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/5 p-6 space-y-2">
      <h2 className="text-lg font-medium tracking-tight text-white">{title}</h2>
      <p className="text-sm leading-7 text-white/60">{body}</p>
    </div>
  );
}

export default function HealthWarningPage() {
  return (
    <LegalPageShell
      eyebrow="Health Warning"
      title="Cognistration Health and Safety Warning"
      summary="Effective June 12, 2026. Cognistration audio is provided for entertainment and general wellness exploration only. It is not medical advice, diagnosis, treatment, or emergency support."
    >
      <WarningCard
        title="Doctor approval required for higher-risk conditions"
        body="Do not use Cognistration without physician approval if you have epilepsy, a history of seizures, auditory hypersensitivity, a neurological condition, a history of dissociation, or any medical condition that could be aggravated by repetitive sound, deep relaxation, or altered alertness."
      />
      <WarningCard
        title="Do not use during driving or hazardous activity"
        body="Never listen while driving, riding, operating machinery, climbing, cooking over open heat, supervising hazards, or performing any task that requires full situational awareness."
      />
      <WarningCard
        title="Stop immediately if symptoms appear"
        body="Stop using the service immediately if you feel dizziness, disorientation, panic, nausea, headache, ear pain, unusual fatigue, heart palpitations, or any other adverse physical or mental reaction."
      />
      <WarningCard
        title="Volume and session limits"
        body="Use moderate volume and start with shorter sessions. Extended or overly loud listening can contribute to ear fatigue, hearing strain, and overstimulation."
      />
      <WarningCard
        title="Not a substitute for care"
        body="Cognistration is not a replacement for medical treatment, therapy, sleep care, psychiatric support, or crisis response. If you are in distress or need medical help, contact a licensed professional or emergency services."
      />
    </LegalPageShell>
  );
}
