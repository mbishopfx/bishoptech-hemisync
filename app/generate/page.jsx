'use client';

import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { TechGridBackground } from '@/components/visuals/TechGridBackground';
import { Accordion } from '@/components/ui/accordion';
import { SessionLab } from './SessionLab';

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-[1200px] p-6 space-y-8">
      <TechGridBackground />
      <ThemeToggle />

      <Card className="glass-emphasis">
        <div className="space-y-3 p-6">
          <h2 className="text-xl font-semibold text-white">Important: About HemiSync and Gateway Practice</h2>
          <p className="text-white/80">
            Binaural and isochronic entrainment can support relaxation, focused attention, and meditative depth. Use
            high-quality headphones, remain seated, and never listen while driving or operating machinery. People with
            neurological conditions should consult a clinician first.
          </p>
          <p className="text-white/75">
            This laboratory is designed to explore hemispheric synchronization safely. Sessions are not medical devices
            and outcomes vary. Pause if you feel discomfort, hydrate, and ground yourself.
          </p>
        </div>
      </Card>

      <SessionLab />

      <div className="mt-10">
        <h2 className="mb-3 text-xl font-semibold text-white">Instructional Guide</h2>
        <Accordion
          items={[
            {
              title: '1. Design in the Lab',
              content:
                'Use the TahoeOS Session Lab preview to audition binaural blends, tweak breath guidance, and upload custom beds.'
            },
            {
              title: '2. Chat with the Session Architect',
              content:
                'Describe mood, progression, or narration style. The AI updates the spec and stores revisions in Supabase.'
            },
            {
              title: '3. Render Your Session',
              content:
                'When satisfied, click Generate Session to render a long-form WAV/MP3 with analytics and Supabase storage.'
            },
            {
              title: '4. Best Practices',
              content:
                'Stay hydrated, keep volume moderate, and log your experiences. Consistent daily practice is more effective than sporadic marathon sessions.'
            }
          ]}
        />
      </div>
    </main>
  );
}

