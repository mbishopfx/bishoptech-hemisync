import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';
import { PolicyLink } from '@/components/legal/PolicyLink';

export const metadata = {
  title: { absolute: 'Health Warning — Cognistration' },
  description: 'Health and safety guidance for using Cognistration audio sessions.',
  alternates: { canonical: '/health-warning' },
  openGraph: {
    title: 'Health Warning — Cognistration',
    description: 'Health and safety guidance for using Cognistration audio sessions.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/health-warning',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health Warning — Cognistration',
    description: 'Health and safety guidance for using Cognistration audio sessions.',
    images: ['/images/og-preview.png'],
  },
};

export default function HealthWarningPage() {
  return (
    <LegalPageShell
      title="Cognistration health & safety"
      activeHref="/health-warning"
      summary="Cognistration audio sessions are for entertainment and general wellness exploration. Read this guidance before listening, especially if sound, relaxation, or changes in alertness may affect you."
    >
      <aside className="policy-callout policy-callout--safety" aria-labelledby="safety-callout-title">
        <h2 id="safety-callout-title" className="font-medium">If you are unsure, wait before listening</h2>
        <p className="mt-1">A listening session is optional. You can stop at any time, and you should never use one in place of appropriate medical or mental-health support.</p>
      </aside>

      <PolicySection id="scope" title="What Cognistration is">
        <p>Cognistration provides adjustable audio sessions and listening cues. It is not medical advice, diagnosis, treatment, therapy, a regulated medical device, or emergency support.</p>
      </PolicySection>

      <PolicySection id="situational-awareness" title="Protect your situational awareness">
        <p>Do not listen while driving, cycling in traffic, operating machinery, cooking over heat, swimming, climbing, supervising a hazard, or doing anything that requires your full attention to the environment. Headphones can reduce awareness of people, vehicles, alarms, and other signals around you.</p>
      </PolicySection>

      <PolicySection id="volume-and-duration" title="Start gently">
        <p>Use a comfortable, moderate volume and begin with a short session. Take breaks. Do not turn the volume up to make a session feel stronger, and do not continue listening through discomfort, ear fatigue, or overstimulation. Cognistration’s stereo sessions are designed for headphones, but headphones do not make an unsafe listening situation safe.</p>
      </PolicySection>

      <PolicySection id="check-first" title="Check with a qualified clinician first">
        <p>If you have epilepsy or a history of seizures, auditory sensitivity, tinnitus, a neurological condition, a history of dissociation, or another condition that could be affected by repetitive sound, relaxation, or altered alertness, ask a qualified clinician whether this type of listening is appropriate for you.</p>
      </PolicySection>

      <PolicySection id="stop" title="Stop if you feel unwell">
        <p>Stop immediately if you notice dizziness, disorientation, panic, nausea, headache, ear pain, unusual fatigue, palpitations, or any other physical or mental reaction. If symptoms are severe, persistent, or urgent, seek appropriate medical care or contact emergency services.</p>
      </PolicySection>

      <PolicySection id="support" title="Need help deciding?"><p>Review the <PolicyLink href="/ai-disclosure">AI Disclosure</PolicyLink> for how suggestions are produced, or <PolicyLink href="/contact">contact support</PolicyLink> for product questions. For health questions, speak with a qualified professional.</p></PolicySection>
    </LegalPageShell>
  );
}
