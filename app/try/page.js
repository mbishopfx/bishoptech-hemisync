import { ArrowRight, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import { TryCockpit } from '@/components/challenge/TryCockpit';
import { MCP_TOOLS } from '@/lib/agentic/mcp-contract';
import { WEBMCP_TOOL_DEFINITIONS } from '@/lib/agentic/webmcp-contract';

const MCP_TOOL_COUNT = MCP_TOOLS.length;
const WEBMCP_TOOL_COUNT = WEBMCP_TOOL_DEFINITIONS.length;

const challengeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cognistration WebMCP challenge cockpit',
  url: 'https://cognistration.com/try',
  description: 'A public, bounded path through Cognistration intention clarification, visible multi-stage Agentic Session Score composition, truthful binaural preview, and technical export.'
};

export default function TryPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#13201d] text-white selection:bg-[#b6ddcc]/40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(challengeJsonLd) }} />
      <LiquidHeader theme="dark" />
      <main>
        <section className="relative overflow-hidden bg-[#13201d] px-5 pb-16 pt-36 sm:px-8 sm:pb-24 sm:pt-44 lg:px-12">
          <div className="pointer-events-none absolute -left-24 top-20 size-96 rounded-full bg-[#b6ddcc]/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute right-0 top-0 size-[28rem] rounded-full bg-[#d7c7aa]/[0.08] blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1400px]">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#b6ddcc]">WebMCP challenge cockpit</p>
              <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.07em] sm:text-7xl">From an intention to a session you can actually try.</h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">Co-compose a visible multi-stage frequency score with an agent: inspect every carrier step and linear beat path, refine or undo a stage, export the technical recipe, and keep preview audio under human control.</p>
              <div className="mt-8 flex flex-wrap gap-4 text-sm">
                <a href="#cockpit" className="glass-action glass-action--primary inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-medium">Run the flow <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></a>
                <Link href="/agent-instructions.md" className="glass-action glass-action--secondary inline-flex items-center gap-2 rounded-full px-5 py-3.5">Agent instructions</Link>
              </div>
            </div>
            <div className="mt-12 flex flex-wrap gap-3 text-xs text-white/45"><span className="glass-pill rounded-full px-3 py-2">{WEBMCP_TOOL_COUNT} public WebMCP tools</span><span className="glass-pill rounded-full px-3 py-2">{MCP_TOOL_COUNT} public MCP tools</span><span className="glass-pill rounded-full px-3 py-2">No account required for the flow</span></div>
          </div>
        </section>

        <section id="cockpit" className="bg-[#182723] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="glass-subpanel mb-8 flex flex-col gap-4 rounded-2xl border border-[#b6ddcc]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#b6ddcc]" aria-hidden="true" /><p className="max-w-3xl text-sm leading-6 text-white/60">The public route is deliberately bounded: tools can return choices and stage visible controls, but they do not save diary content or start audio without an explicit preview action.</p></div>
              <Link href="/health-warning" className="shrink-0 text-xs text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4">Safety boundaries ↗</Link>
            </div>
            <TryCockpit />
          </div>
        </section>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
