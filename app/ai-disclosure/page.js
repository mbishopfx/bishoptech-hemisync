import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { PolicySection } from '@/components/legal/PolicySection';

export const metadata = {
  title: { absolute: 'AI Disclosure — Cognistration' },
  description: 'A plain-language explanation of Cognistration AI-assisted features and their limits.',
  alternates: { canonical: '/ai-disclosure' },
  openGraph: {
    title: 'AI Disclosure — Cognistration',
    description: 'A plain-language explanation of Cognistration AI-assisted features and their limits.',
    siteName: 'Cognistration',
    type: 'website',
    url: '/ai-disclosure',
    images: [{ url: '/images/og-preview.png', width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Disclosure — Cognistration',
    description: 'A plain-language explanation of Cognistration AI-assisted features and their limits.',
    images: ['/images/og-preview.png'],
  },
};

export default function AIDisclosurePage() {
  return (
    <LegalPageShell
      title="Cognistration AI disclosure"
      summary="Some Cognistration features use automated models to turn an intention into a listening suggestion or help shape a private session. This page explains what that means, what it does not mean, and where your judgment stays in control."
    >
      <PolicySection id="where-ai-appears" title="Where automated help appears">
        <p>On the public homepage, an intention such as “I need a clear mind” can be compared with Cognistration’s public tone library to suggest a starting point. If the model service is unavailable, the product can use a deterministic catalog match instead.</p>
        <p>Inside the private workspace, an assistant can help shape a session specification from your instructions. The result is a draft for you to review and adjust, not an instruction you must follow.</p>
      </PolicySection>

      <PolicySection id="how-it-works" title="What the system receives">
        <p>The feature receives the text needed for the request, such as an intention, prompt, or session conversation. It may also use the current session settings so that a suggested change fits the session you are editing. See the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/privacy">Privacy Policy</a> for the broader data-handling picture.</p>
      </PolicySection>

      <PolicySection id="limits" title="What AI does not do">
        <p>Automated output can be incomplete, inaccurate, or a poor fit. It does not diagnose, treat, or prevent a health condition; provide therapy or crisis support; determine whether listening is safe for you; or guarantee a particular mood, brainwave state, or outcome.</p>
        <p>Do not use the assistant as a substitute for a qualified professional. Do not enter information that you would not want processed to provide the feature.</p>
      </PolicySection>

      <PolicySection id="your-control" title="You stay in control">
        <p>Review each suggestion before using it. You can edit the tone, carrier, rhythm, duration, and other available controls, choose a different public tone, or stop listening. The product should support a deliberate choice, not pressure you into one.</p>
      </PolicySection>

      <PolicySection id="related-policies" title="Related guidance">
        <p>Read the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/health-warning">Health &amp; Safety guidance</a> before listening and the <a className="text-[#315e55] underline decoration-[#315e55]/30 underline-offset-4 transition hover:text-[#1d302c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#548477]" href="/terms">Terms</a> for the rules that apply when you use Cognistration.</p>
      </PolicySection>
    </LegalPageShell>
  );
}
