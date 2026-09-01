import { ArrowRight, BookOpenText, Browser, CheckCircle, Code, Compass, Database, LockKey, TerminalWindow } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { LiquidHeader } from '@/components/layout/LiquidHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';
import {
  MCP_PROMPTS,
  MCP_PROTOCOL_VERSION,
  MCP_RESOURCES,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  MCP_TOOLS
} from '@/lib/agentic/mcp-contract';
import { getSkill, skillCatalogSummary } from '@/lib/agentic/skill-capability';
import {
  MEMBER_WEBMCP_CONTRACT_ID,
  MEMBER_WEBMCP_CONTRACT_VERSION,
  MEMBER_WEBMCP_TOOL_DEFINITIONS,
  WEBMCP_CONTRACT_ID,
  WEBMCP_CONTRACT_VERSION,
  WEBMCP_TOOL_DEFINITIONS
} from '@/lib/agentic/webmcp-contract';

export const metadata = {
  title: {
    absolute: 'MCP & WebMCP docs — Cognistration'
  },
  description: 'The public Cognistration SDK-style reference for MCP tools, WebMCP browser tools, resources, skills, prompts, transport, and safety boundaries.',
  alternates: {
    canonical: '/docs'
  },
  openGraph: {
    title: 'MCP & WebMCP docs — Cognistration',
    description: 'Discover Cognistration’s public MCP and WebMCP surfaces.',
    url: 'https://cognistration.com/docs'
  }
};

const MCP_URL = 'https://cognistration.com/api/mcp';
const MCP_TOOL_COUNT = MCP_TOOLS.length;
const MCP_RESOURCE_COUNT = MCP_RESOURCES.length;
const SKILL_COUNT = skillCatalogSummary().count;

const HTTP_SURFACES = [
  { method: 'POST', path: '/api/mcp', label: 'Remote MCP endpoint', description: 'Stateless Streamable HTTP JSON-RPC for discovery, tool calls, resources, prompts, skills, and bounded commerce operations.' },
  { method: 'GET', path: '/api/mcp', label: 'MCP health / discovery response', description: 'Returns the public MCP transport status and protocol metadata for a lightweight probe.' },
  { method: 'GET + POST', path: '/connect', label: 'Compatibility alias', description: 'Connects to the same public MCP handler when a host expects a /connect route.' },
  { method: 'GET', path: '/api/capabilities', label: 'Capability manifest', description: 'Machine-readable summary of MCP, WebMCP, member WebMCP, resources, skills, catalogs, and boundaries.' },
  { method: 'GET', path: '/openapi.json', label: 'REST compatibility contract', description: 'OpenAPI description of the public HTTP adapters and their request/response shapes.' },
  { method: 'GET', path: '/agent-instructions.md', label: 'Agent instructions', description: 'Human-readable routing guidance, safety rules, and the distinction between public and member surfaces.' },
  { method: 'GET', path: '/llms.txt', label: 'LLM discovery file', description: 'Canonical public product, policy, documentation, and agent-discovery links.' },
  { method: 'GET', path: '/.well-known/agent-card.json, /.well-known/ard.json', label: 'Agent discovery', description: 'A2A agent card and Agentic Resource Discovery manifest for compatible clients.' },
  { method: 'GET', path: '/.well-known/api-catalog, /api/mcp/server-card, /.well-known/mcp/manifest.json', label: 'API and MCP catalogs', description: 'RFC-style API Linkset, standards-based Server Card metadata, and the executable compatibility manifest.' },
  { method: 'GET', path: '/.well-known/agent-skills/index.json', label: 'Skills index', description: 'Five static, reusable operating skills with source and endpoint links.' },
  { method: 'GET + POST', path: '/api/docs-mcp', label: 'Documentation MCP', description: 'Read-only tools/list, resources/list, resources/read, and docs search/retrieval.' },
  { method: 'GET + POST', path: '/ask, /a2a', label: 'Agent compatibility', description: 'Bounded natural-language and stateless A2A compatibility surfaces.' },
  { method: 'GET + POST', path: '/api/sandbox, /api/batch', label: 'Testing helpers', description: 'Deterministic no-write sandbox and bounded read-only batch operations.' },
  { method: 'GET + POST', path: '/api/jobs, /api/v1', label: 'Lifecycle and version status', description: 'Explicit asynchronous-job status and the current versioned API namespace.' },
  { method: 'GET', path: '/try', label: 'Challenge cockpit', description: 'A judge-friendly browser route for the public WebMCP flow and its visible safety boundaries.' },
  { method: 'GET', path: '/.well-known/ucp', label: 'UCP discovery', description: 'Public commerce discovery for the optional Universal Commerce Protocol surface; it is separate from the Cognistration MCP tool registry.' }
];

const SUPPORTING_ROUTE_FAMILIES = [
  { method: 'POST', path: '/api/agent', description: 'Intention-to-tone compatibility adapter.' },
  { method: 'GET / POST', path: '/api/agent/intent-guidance, /tone-calibrate, /tone-compare', description: 'Bounded clarification, calibration, and direction-comparison adapters.' },
  { method: 'POST', path: '/api/agent/session-plan, /session-cue, /session-recipe', description: 'Timed planning, cue, and technical-settings-only recipe adapters.' },
  { method: 'GET', path: '/api/agent/policy, /account', description: 'Canonical policy and account-option lookups.' },
  { method: 'POST', path: '/api/agent/account/signup, /feedback', description: 'User-controlled signup and optional feedback submission widgets.' },
  { method: 'POST', path: '/api/agent/commerce/*', description: 'Server-priced tone-pack and workshop checkout, delivery, access, and revocation adapters.' },
  { method: 'GET / POST', path: '/api/machine-payments/*', description: 'Machine Payments Protocol challenge, fixed $0.50 machine resources, fixed $5.99 tone-pack fulfillment, and reconciliation compatibility routes.' },
  { method: 'GET / POST', path: '/api/ucp/*', description: 'UCP checkout-session and order compatibility routes; not a substitute for MCP confirmation rules.' },
  { method: 'GET / POST', path: '/api/member/*', description: 'Authenticated member-only workspace adapters; private records never enter the public tool registry.' }
];

const PROTOCOL_COMMANDS = [
  { command: 'server/discover', access: 'modern', description: 'Return the current protocol version, server capabilities, extension support, and routing instructions.' },
  { command: 'initialize', access: 'both', description: 'Negotiate the MCP protocol and return server capabilities; standard clients may omit stateless request metadata during this handshake.' },
  { command: 'ping', access: 'both', description: 'Check that the endpoint is reachable.' },
  { command: 'tools/list', access: 'both', description: `List the ${MCP_TOOL_COUNT} remote MCP tools and their schemas.` },
  { command: 'tools/call', access: 'both', description: 'Call one named tool with a bounded arguments object.' },
  { command: 'resources/list', access: 'both', description: `List the ${MCP_RESOURCE_COUNT} public resources, including the MCP Apps UI resources.` },
  { command: 'resources/read', access: 'both', description: 'Read one named resource by URI.' },
  { command: 'prompts/list', access: 'both', description: 'List the available prompt templates.' },
  { command: 'prompts/get', access: 'both', description: 'Resolve a named prompt template with its arguments.' },
  { command: 'skills/list', access: 'both', description: `List the ${SKILL_COUNT} reusable Cognistration skills.` },
  { command: 'skills/get', access: 'both', description: 'Read one skill manifest by its skill URI.' },
  { command: 'notifications/*', access: 'both', description: 'Accept supported client notifications without creating a side effect.' }
];

function schemaType(schema) {
  if (!schema) return 'not declared';
  if (Array.isArray(schema.type)) return schema.type.join(' | ');
  if (schema.type) return schema.type;
  if (schema.properties) return 'object';
  return 'value';
}

function schemaFields(schema) {
  if (!schema?.properties) return [];
  const required = new Set(schema.required || []);
  return Object.entries(schema.properties).map(([name, field]) => ({
    name,
    type: schemaType(field),
    required: required.has(name),
    detail: field.description || (field.enum ? field.enum.join(', ') : field.const || '')
  }));
}

function AuthTag({ value }) {
  const classes = value === 'public_read' || value === 'public_session'
    ? 'border-[#b6ddcc]/25 bg-[#b6ddcc]/[0.08] text-[#b6ddcc]'
    : value === 'authenticated_member'
      ? 'border-[#e0b493]/30 bg-[#e0b493]/[0.08] text-[#e0b493]'
      : 'border-white/15 bg-white/[0.05] text-white/55';

  return <span className={`inline-flex rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] ${classes}`}>{value}</span>;
}

function SchemaTable({ schema, emptyLabel }) {
  const fields = schemaFields(schema);
  if (!fields.length) {
    return <p className="text-xs leading-5 text-white/42">{emptyLabel || `Returns ${schemaType(schema)}.`}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      {fields.map((field) => (
        <div key={field.name} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] gap-3 border-b border-white/10 px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(140px,0.7fr)_minmax(100px,0.45fr)_minmax(0,1.5fr)]">
          <code className="min-w-0 break-words text-[11px] text-[#d7eadf]">{field.name}{field.required ? <span className="text-[#e0b493]" title="Required"> *</span> : null}</code>
          <span className="text-[10px] text-white/42">{field.type}</span>
          <span className="col-span-2 text-[10px] leading-4 text-white/45 sm:col-span-1">{field.detail || '—'}</span>
        </div>
      ))}
    </div>
  );
}

function ToolRow({ tool, index, kind }) {
  return (
    <details className="group border-b border-white/10 last:border-b-0">
      <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 transition hover:bg-white/[0.035] [&::-webkit-details-marker]:hidden sm:grid-cols-[42px_minmax(0,1.1fr)_minmax(0,1.8fr)_auto] sm:items-start">
        <span className="font-mono text-[10px] text-white/30">{String(index + 1).padStart(2, '0')}</span>
        <code className="break-words text-xs text-[#d7eadf]">{tool.name}</code>
        <span className="text-xs leading-5 text-white/52">{tool.description}</span>
        <span className="flex items-center gap-2 text-white/30"><AuthTag value={tool.authorization || kind} /><span className="text-lg leading-none transition group-open:rotate-45">+</span></span>
      </summary>
      <div className="grid gap-6 border-t border-white/10 bg-black/10 px-4 py-5 sm:grid-cols-[minmax(150px,0.55fr)_minmax(0,1fr)_minmax(0,1fr)] sm:pl-[58px]">
        <div className="space-y-3">
          <div><p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Contract</p><p className="mt-1 text-xs text-white/60">{kind}</p></div>
          <div><p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Side effect</p><p className="mt-1 text-xs leading-5 text-white/58">{tool.sideEffect || 'not declared'}</p></div>
          <div><p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Consent</p><p className="mt-1 text-xs leading-5 text-white/58">{tool.consent || 'none declared'}</p></div>
        </div>
        <div><p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Arguments</p><SchemaTable schema={tool.inputSchema} emptyLabel="No arguments." /></div>
        <div><p className="mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Returns</p><SchemaTable schema={tool.outputSchema} emptyLabel="The tool returns a structured completion envelope; see the live response for its result schema." /></div>
      </div>
    </details>
  );
}

function RouteRow({ route }) {
  return (
    <div className="grid gap-2 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[120px_minmax(220px,0.7fr)_minmax(0,1.5fr)] sm:gap-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#b6ddcc]">{route.method}</span>
      <code className="break-words text-xs text-[#d7eadf]">{route.path}</code>
      <div><p className="text-xs text-white/70">{route.label}</p><p className="mt-1 text-xs leading-5 text-white/42">{route.description}</p></div>
    </div>
  );
}

function CommandRow({ item }) {
  return (
    <div className="grid gap-2 border-b border-white/10 px-4 py-3.5 last:border-b-0 sm:grid-cols-[150px_72px_minmax(0,1fr)] sm:items-start sm:gap-5">
      <code className="text-xs text-[#d7eadf]">{item.command}</code>
      <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/32">{item.access}</span>
      <span className="text-xs leading-5 text-white/48">{item.description}</span>
    </div>
  );
}

function ResourceRow({ resource }) {
  return (
    <div className="grid gap-2 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(230px,0.9fr)_minmax(0,1.2fr)_auto] sm:items-start sm:gap-5">
      <code className="break-all text-xs text-[#d7eadf]">{resource.uri}</code>
      <div><p className="text-xs text-white/70">{resource.name}</p><p className="mt-1 text-xs leading-5 text-white/42">{resource.description}</p></div>
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">{resource.mimeType}</span>
    </div>
  );
}

function SkillRow({ skill }) {
  return (
    <div className="grid gap-2 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(250px,0.95fr)_minmax(0,1.3fr)] sm:gap-5">
      <code className="break-all text-xs text-[#d7eadf]">{skill.uri}</code>
      <div><p className="text-xs text-white/70">{skill.frontmatter.name}</p><p className="mt-1 text-xs leading-5 text-white/42">{skill.frontmatter.description}</p></div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#b6ddcc]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/50">{children}</p>
    </div>
  );
}

export default function DocsPage() {
  const skillSummary = skillCatalogSummary();
  const skills = skillSummary.uris.map((uri) => getSkill(uri)).filter(Boolean);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#13201d] text-white selection:bg-[#b6ddcc]/40">
      <LiquidHeader theme="dark" />
      <a href="#docs-content" className="sr-only z-[70] rounded-full bg-[#d7eadf] px-4 py-2 text-sm font-medium text-[#17332e] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to documentation</a>
      <main id="docs-content">
        <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-36 sm:px-8 sm:pb-24 sm:pt-44 lg:px-12">
          <div className="pointer-events-none absolute -left-32 top-10 size-[28rem] rounded-full bg-[#b6ddcc]/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute right-[-8rem] top-0 size-[30rem] rounded-full bg-[#e0b493]/[0.08] blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)] lg:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#b6ddcc]">Cognistration SDK reference</p>
                <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.96] tracking-[-0.075em] sm:text-7xl">One public contract for people and agents.</h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">Discover the remote MCP endpoint, native browser WebMCP tools, interactive MCP Apps resources, reusable skills, prompt templates, and the exact boundary around every side effect.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/try" className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Open the demo cockpit <ArrowRight className="size-4" weight="bold" aria-hidden="true" /></Link>
                  <a href={MCP_URL} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-sm text-white/75 transition hover:border-white/45 hover:text-white">MCP endpoint <ArrowRight className="size-4" aria-hidden="true" /></a>
                </div>
              </div>
              <div className="border-l border-white/15 pl-5 sm:pl-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/32">Current release</p>
                <p className="mt-3 text-2xl font-medium tracking-[-0.04em] text-white">{MCP_SERVER_NAME}</p>
                <p className="mt-2 font-mono text-xs text-[#b6ddcc]">v{MCP_SERVER_VERSION} · protocol {MCP_PROTOCOL_VERSION}</p>
                <p className="mt-5 text-xs leading-6 text-white/42">The public registry is intentionally bounded. Private member tools are documented separately and require a signed-in member context.</p>
              </div>
            </div>
            <div className="mt-14 grid border-y border-white/15 sm:grid-cols-4">
              {[
                [String(MCP_TOOL_COUNT), 'remote MCP tools'],
                [String(WEBMCP_TOOL_DEFINITIONS.length), 'public WebMCP tools'],
                [String(MCP_RESOURCES.length), 'MCP resources'],
                [String(skillSummary.count), 'importable skills']
              ].map(([value, label]) => <div key={label} className="border-b border-white/10 px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><p className="text-2xl font-medium tracking-[-0.04em] text-white">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-white/35">{label}</p></div>)}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-20 lg:px-12">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">On this page</p>
            <nav className="mt-4 grid gap-2 text-xs text-white/50">
              {[
                ['connection', 'Connect'],
                ['commands', 'RPC commands'],
                ['mcp-tools', 'MCP tools'],
                ['webmcp', 'WebMCP'],
                ['resources', 'Resources'],
                ['skills', 'Skills'],
                ['prompts', 'Prompts'],
                ['routes', 'HTTP routes'],
                ['safety', 'Safety']
              ].map(([href, label]) => <a key={href} href={`#${href}`} className="transition hover:text-[#b6ddcc]">{label}</a>)}
            </nav>
            <div className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-white/35">
              <p>Schema source</p>
              <Link href="/api/capabilities" className="mt-1 block break-words text-[#b6ddcc] hover:text-white">/api/capabilities</Link>
              <a href="/openapi.json" className="mt-1 block break-words text-[#b6ddcc] hover:text-white">/openapi.json</a>
            </div>
          </aside>

          <div className="min-w-0 space-y-20">
            <section id="connection" className="scroll-mt-28">
              <SectionIntro eyebrow="01 · Connect" title="Start with the remote endpoint">Add Cognistration as a remote HTTPS MCP server. This is a server URL, not a Git repository or marketplace source.</SectionIntro>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
                <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3"><TerminalWindow className="size-4 text-[#b6ddcc]" aria-hidden="true" /><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">server configuration</span></div>
                  <pre className="overflow-x-auto p-5 text-xs leading-6 text-[#d7eadf]"><code>{`{
  "mcpServers": {
    "cognistration": {
      "url": "${MCP_URL}"
    }
  }
}`}</code></pre>
                </div>
                <div className="rounded-2xl border border-[#b6ddcc]/15 bg-[#b6ddcc]/[0.045] p-5 text-xs leading-6 text-white/55">
                  <CheckCircle className="size-5 text-[#b6ddcc]" weight="fill" aria-hidden="true" />
                  <p className="mt-3">Compatible hosts can discover the contract from <code className="text-[#d7eadf]">server/discover</code>, then list tools, resources, prompts, and skills.</p>
                  <p className="mt-3 text-white/38">Keep credentials, card data, private session records, and bearer access keys out of tool arguments unless a specific authenticated flow explicitly asks for a scoped token.</p>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3"><Code className="size-4 text-[#b6ddcc]" aria-hidden="true" /><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">modern tools/list probe</span></div>
                <pre className="overflow-x-auto p-5 text-[11px] leading-6 text-white/58"><code>{`curl --request POST \
  --url ${MCP_URL} \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --header 'MCP-Protocol-Version: ${MCP_PROTOCOL_VERSION}' \
  --header 'Mcp-Method: tools/list' \
  --data-raw '{"jsonrpc":"2.0","id":"tools-list","method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"${MCP_PROTOCOL_VERSION}"}}}'`}</code></pre>
              </div>
            </section>

            <section id="commands" className="scroll-mt-28">
              <SectionIntro eyebrow="02 · Transport" title="RPC commands and protocol behavior">The endpoint supports the standard initialize handshake plus modern stateless requests with per-request metadata. Legacy protocol versions remain available for older compatible clients.</SectionIntro>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{PROTOCOL_COMMANDS.map((item) => <CommandRow key={item.command} item={item} />)}</div>
            </section>

            <section id="mcp-tools" className="scroll-mt-28">
              <SectionIntro eyebrow="03 · Remote MCP" title="Every public MCP tool">These definitions are rendered from the live contract in the repository. Open a row to inspect authorization, side-effect classification, consent boundary, arguments, and the output envelope.</SectionIntro>
              <div className="mb-5 flex flex-wrap gap-2 text-xs text-white/42"><span className="rounded-full border border-white/10 px-3 py-2">{MCP_TOOL_COUNT} tools</span><span className="rounded-full border border-white/10 px-3 py-2">server-owned bounds</span><span className="rounded-full border border-white/10 px-3 py-2">no arbitrary code or SQL</span></div>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{MCP_TOOLS.map((tool, index) => <ToolRow key={tool.name} tool={tool} index={index} kind="remote MCP" />)}</div>
            </section>

            <section id="webmcp" className="scroll-mt-28">
              <SectionIntro eyebrow="04 · Native browser" title="WebMCP tools on the visible page">The home and try surfaces progressively register bounded tools with the browser’s native model context. They operate on visible controls and keep audio, account, and payment edges user-controlled.</SectionIntro>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-[#182723] p-5">
                  <div className="flex items-start justify-between gap-4"><div><Browser className="size-5 text-[#b6ddcc]" aria-hidden="true" /><h3 className="mt-4 text-lg font-medium text-white">Public page bridge</h3></div><span className="font-mono text-[9px] text-white/35">v{WEBMCP_CONTRACT_VERSION}</span></div>
                  <p className="mt-3 text-xs leading-5 text-white/45"><code>{WEBMCP_CONTRACT_ID}</code> · {WEBMCP_TOOL_DEFINITIONS.length} tools registered on the visible tone machine.</p>
                  <div className="mt-5 border-t border-white/10 pt-4"><p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30">Registration shape</p><pre className="mt-3 overflow-x-auto text-[10px] leading-5 text-white/55"><code>{`document.modelContext.registerTool({
  name: "cognistration_generate_tone",
  inputSchema: { type: "object", properties: { intention: { type: "string" } } },
  execute: async (input) => { /* visible bounded action */ }
})`}</code></pre></div>
                </div>
                <div className="rounded-2xl border border-[#e0b493]/20 bg-[#e0b493]/[0.045] p-5">
                  <div className="flex items-start justify-between gap-4"><div><LockKey className="size-5 text-[#e0b493]" aria-hidden="true" /><h3 className="mt-4 text-lg font-medium text-white">Authenticated member bridge</h3></div><span className="font-mono text-[9px] text-white/35">v{MEMBER_WEBMCP_CONTRACT_VERSION}</span></div>
                  <p className="mt-3 text-xs leading-5 text-white/45"><code>{MEMBER_WEBMCP_CONTRACT_ID}</code> · {MEMBER_WEBMCP_TOOL_DEFINITIONS.length} tools on the signed-in dashboard.</p>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">Private workspace reads are scoped to the current member. Creating a private session or starting an audio render requires an explicit confirmation in the current browser context.</p>
                </div>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{WEBMCP_TOOL_DEFINITIONS.map((tool, index) => <ToolRow key={tool.name} tool={tool} index={index} kind="public WebMCP" />)}</div>
              <details className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">
                <summary className="cursor-pointer list-none px-4 py-4 text-sm text-white/65 [&::-webkit-details-marker]:hidden">Show the {MEMBER_WEBMCP_TOOL_DEFINITIONS.length} authenticated member tools <span className="ml-2 text-white/30">+</span></summary>
                <div className="border-t border-white/10">{MEMBER_WEBMCP_TOOL_DEFINITIONS.map((tool, index) => <ToolRow key={tool.name} tool={tool} index={index} kind="authenticated member WebMCP" />)}</div>
              </details>
            </section>

            <section id="resources" className="scroll-mt-28">
              <SectionIntro eyebrow="05 · Readable surfaces" title="Resources and interactive UI">Resources are addressable by stable URI. The {MCP_RESOURCES.filter((resource) => resource.uri.startsWith('ui://')).length} <code className="text-[#d7eadf]">ui://</code> entries are MCP Apps resources; they render in a compatible host and keep their user actions inside the declared boundary.</SectionIntro>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{MCP_RESOURCES.map((resource) => <ResourceRow key={resource.uri} resource={resource} />)}</div>
            </section>

            <section id="skills" className="scroll-mt-28">
              <SectionIntro eyebrow="06 · Reusable guidance" title="Skills">The server advertises the MCP skills extension. Skills are routing guidance, not authorization; they never grant access to private records, payment credentials, or side effects.</SectionIntro>
              <div className="mb-5 flex flex-wrap gap-2 text-xs text-white/42"><span className="rounded-full border border-white/10 px-3 py-2">{skillSummary.extension}</span><span className="rounded-full border border-white/10 px-3 py-2">catalog v{skillSummary.version}</span></div>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{skills.map((skill) => <SkillRow key={skill.uri} skill={skill} />)}</div>
            </section>

            <section id="prompts" className="scroll-mt-28">
              <SectionIntro eyebrow="07 · Prompt template" title="Prompt templates">Use <code className="text-[#d7eadf]">prompts/get</code> when a host wants a reusable, bounded starting message for the public tone catalog.</SectionIntro>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{MCP_PROMPTS.map((prompt) => <div key={prompt.name} className="grid gap-3 px-4 py-5 sm:grid-cols-[210px_minmax(0,1fr)] sm:gap-5"><code className="text-xs text-[#d7eadf]">{prompt.name}</code><div><p className="text-xs text-white/70">{prompt.title}</p><p className="mt-1 text-xs leading-5 text-white/45">{prompt.description}</p><p className="mt-3 font-mono text-[10px] text-[#b6ddcc]">required argument: {prompt.arguments?.map((argument) => argument.name).join(', ') || 'none'}</p></div></div>)}</div>
            </section>

            <section id="routes" className="scroll-mt-28">
              <SectionIntro eyebrow="08 · HTTP map" title="Public routes around the contract">These are the supported discovery and compatibility routes that surround MCP. Internal audio, database, and admin routes are intentionally not presented as public agent commands.</SectionIntro>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#182723]">{HTTP_SURFACES.map((route) => <RouteRow key={`${route.method}-${route.path}`} route={route} />)}</div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/12 bg-[#182723]"><div className="border-b border-white/10 px-4 py-3"><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">supporting compatibility families</span></div>{SUPPORTING_ROUTE_FAMILIES.map((route) => <RouteRow key={route.path} route={{ ...route, label: 'Supporting adapter' }} />)}</div>
            </section>

            <section id="safety" className="scroll-mt-28">
              <SectionIntro eyebrow="09 · Boundary" title="What agents must keep user-controlled">Cognistration is designed for visible, consent-aware orchestration. The machine can recommend and stage a session; it cannot silently turn a recommendation into audio, a signup into an account, or a checkout into a payment.</SectionIntro>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [Compass, 'Audio', 'No public tool starts local audio automatically. Browser preview requires an explicit confirmation and remains visible to the listener.'],
                  [LockKey, 'Credentials', 'Signup credentials are entered and submitted by the person in the in-platform form. Card data never enters MCP arguments.'],
                  [Database, 'Private data', 'Public tools do not expose diary text, private sessions, arbitrary SQL, or another member’s workspace records.'],
                  [BookOpenText, 'Claims', 'Tone labels and science content are descriptive and educational. They do not make medical, diagnostic, or guaranteed-performance claims.']
                ].map(([Icon, title, copy]) => <div key={title} className="rounded-2xl border border-white/12 bg-[#182723] p-5"><Icon className="size-5 text-[#b6ddcc]" aria-hidden="true" /><h3 className="mt-4 text-sm font-medium text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-white/45">{copy}</p></div>)}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-white/42"><span>Canonical policy: <Link href="/health-warning" className="text-[#b6ddcc] hover:text-white">/health-warning</Link></span><Link href="/agent-instructions.md" className="inline-flex items-center gap-2 text-[#b6ddcc] hover:text-white">Read agent instructions <ArrowRight className="size-3.5" aria-hidden="true" /></Link></div>
            </section>
          </div>
        </div>
      </main>
      <PublicTrustFooter />
    </div>
  );
}
