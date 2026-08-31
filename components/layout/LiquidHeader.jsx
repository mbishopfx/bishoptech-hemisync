'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowSquareOut, Check, Copy, X } from '@phosphor-icons/react';

const MCP_SERVER_URL = 'https://cognistration.com/api/mcp';
const CHATGPT_URL = 'https://chatgpt.com/';
const MENU_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/packs', label: 'Tone Packs' },
  { href: '/machine', label: 'Inside the Machine' },
  { href: '/tutorial', label: 'Tutorial' },
  { href: '/blog', label: 'Blog' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'MCP Docs' }
];

const MCP_HOSTS = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    detail: 'Add Cognistration as a remote app',
    logo: '/images/ai-logos/openai.svg',
    href: CHATGPT_URL
  },
  {
    id: 'claude',
    label: 'Claude',
    detail: 'Connect an MCP server',
    logo: '/images/ai-logos/claude-color.svg',
    href: 'https://docs.anthropic.com/en/docs/mcp'
  },
  {
    id: 'antigravity',
    label: 'Antigravity',
    detail: 'Manage MCP servers',
    href: 'https://www.antigravity.google/docs/mcp'
  },
  {
    id: 'cursor',
    label: 'Cursor',
    detail: 'Add an MCP integration',
    logo: '/images/ai-logos/cursor.svg',
    href: 'https://docs.cursor.com/context/model-context-protocol'
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    detail: 'Configure MCP servers',
    logo: '/images/ai-logos/geminicli-color.svg',
    href: 'https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md'
  },
  {
    id: 'codex',
    label: 'Codex',
    detail: 'Give Codex tools and context',
    logo: '/images/ai-logos/codex-color.svg',
    href: 'https://developers.openai.com/codex/mcp/'
  }
];

const CHATGPT_SETUP_PROMPT = `Help me connect Cognistration to this ChatGPT account as a remote app.

Use this remote app server URL: ${MCP_SERVER_URL}

This is an HTTPS MCP endpoint, not a Git repository. Do not run git clone, do not add it as a local skill or marketplace source, and do not look for a repository checkout.

If you can use browser controls, open ChatGPT's app or connector setup, enable Developer mode if it is required, add this remote server, and pause for my confirmation before saving the connection. If you cannot change account settings from this chat, give me the exact clicks to complete the one user-controlled setup step.

If you are looking at a Plugins or marketplace form with Source, Git ref, or Sparse paths, do not paste this endpoint there. That form installs Git repositories; Cognistration must be added as a remote HTTPS app or connector.

After the connection is saved, verify it with Cognistration's public capability read, then offer to open the Cognistration tone machine. Keep audio off until I explicitly ask for a preview.`;

function HostMark({ host, isLight }) {
  if (host.logo) {
    return (
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${isLight ? 'border-[#d7e2da] bg-white/80' : 'border-[#b6ddcc]/15 bg-white/[0.08]'}`}>
        <Image src={host.logo} alt="" width={19} height={19} className="size-[19px] object-contain" />
      </span>
    );
  }

  return (
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold tracking-[0.12em] ${isLight ? 'border-[#c8d8ce] bg-[#e4eee8] text-[#315e55]' : 'border-[#b6ddcc]/20 bg-[#b6ddcc]/10 text-[#b6ddcc]'}`} aria-hidden="true">
      AG
    </span>
  );
}

export function LiquidHeader({ onOpenAuth, theme = 'dark', scrollAware = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPluginInstructions, setShowPluginInstructions] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!scrollAware) return undefined;

    const updateScrollState = () => setHasScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [scrollAware]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (!connectOpen) return undefined;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousDocumentOverflow = documentElement.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousOverscrollBehavior = documentElement.style.overscrollBehavior;
    const scrollbarGap = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    documentElement.style.overscrollBehavior = 'none';
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousDocumentOverflow;
      documentElement.style.overscrollBehavior = previousOverscrollBehavior;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [connectOpen]);

  useEffect(() => {
    if (!connectOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setConnectOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [connectOpen]);

  const isLight = (scrollAware && hasScrolled) || theme === 'light';

  const headerSurface = isLight
    ? 'border-b border-[#d7e0d9]/80 bg-[#eef1ee]/90 text-[#1d302c] shadow-[0_10px_30px_rgba(45,65,59,0.06)] backdrop-blur-xl'
    : 'text-white';
  const actionSurface = isLight
    ? 'border-[#b8cbc0] bg-white/60 text-[#315e55] hover:border-[#7fa594] hover:bg-white'
    : 'border-[#b6ddcc]/20 bg-[#13201d]/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.1)] hover:border-[#b6ddcc]/42 hover:bg-[#b6ddcc]/[0.1]';
  const menuSurface = isLight
    ? 'border-[#cbd6cf]/90 bg-[#eef1ee]/[0.95] text-[#1d302c] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_60px_rgba(45,65,59,0.14)]'
    : 'border-[#b6ddcc]/15 bg-[#16231f]/[0.92] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_30px_80px_rgba(0,0,0,0.28)]';
  const menuItemSurface = isLight
    ? 'text-[#52665e] hover:bg-[#dce8e0]/70 hover:text-[#1d302c]'
    : 'text-white/70 hover:bg-white/[0.06] hover:text-white';
  const menuDivider = isLight ? 'border-[#d4dfd8]' : 'border-[#b6ddcc]/10';
  const menuCopy = isLight ? 'text-[#60716b]' : 'text-white/55';

  const copySetupPrompt = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(CHATGPT_SETUP_PROMPT);
        } catch {
          // Some browsers expose the Clipboard API without granting this click surface permission.
          const textarea = document.createElement('textarea');
          textarea.value = CHATGPT_SETUP_PROMPT;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          textarea.remove();
        }
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = CHATGPT_SETUP_PROMPT;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const openConnect = () => {
    setMenuOpen(false);
    setCopied(false);
    setShowPluginInstructions(true);
    setConnectOpen(true);
  };

  const openAccount = () => {
    setMenuOpen(false);
    if (onOpenAuth) {
      onOpenAuth();
      return;
    }
    window.location.assign('/login');
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 pb-4 pt-4 pointer-events-none transition-colors duration-300 sm:px-8 sm:pb-5 sm:pt-5 lg:px-12 ${headerSurface}`}>
      <div className="pointer-events-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`z-50 flex size-10 shrink-0 items-center justify-center rounded-full border transition active:scale-95 ${actionSurface}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="site-menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <span className="flex flex-col gap-1.5" aria-hidden="true"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>}
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
          <Image
            src="/images/logo.png"
            alt="Cognistration Logo"
            width={36}
            height={36}
            className="size-8 object-contain brightness-110 contrast-125 md:size-9"
            priority
          />
          <span className={`truncate text-lg font-medium tracking-tight ${isLight ? 'text-[#1d302c]' : 'text-white'}`}>Cognistration</span>
        </Link>
      </div>

      <div className="hidden items-center gap-3 pointer-events-auto md:flex">
        <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-[#d7eadf] px-4 text-sm font-medium text-[#17332e] transition hover:bg-white">
          Create account
        </Link>
        <button
          type="button"
          onClick={openAccount}
          className={`flex size-10 items-center justify-center rounded-full border transition ${actionSurface}`}
          aria-label="Account"
          title="Account / Sign In"
        >
          <svg className="size-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </button>
      </div>

      {menuOpen && <button type="button" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 cursor-default bg-[#071512]/[0.04] pointer-events-auto" aria-label="Close menu" />}

      <div
        id="site-menu"
        className={`site-menu-panel fixed left-5 top-[5.25rem] z-40 max-h-[calc(100dvh-6.5rem)] w-[min(31rem,calc(100vw-2.5rem))] origin-top-left overflow-y-auto rounded-[1.75rem] border p-4 pointer-events-auto backdrop-blur-2xl transition-all duration-200 sm:left-8 lg:left-12 ${menuSurface} ${menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="flex items-start justify-between gap-4 px-2 pb-4">
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${isLight ? 'text-[#548477]' : 'text-[#b6ddcc]'}`}>Cognistration menu</p>
            <p className={`mt-2 text-sm ${menuCopy}`}>Move between sessions, tools, and MCP hosts.</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${isLight ? 'border-[#c9d9cf] bg-white/55 text-[#548477]' : 'border-[#b6ddcc]/20 bg-[#b6ddcc]/[0.08] text-[#b6ddcc]'}`}>MCP ready</span>
        </div>

        <nav aria-label="Site navigation" className={`grid gap-1 border-t pt-3 ${menuDivider}`}>
          {MENU_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-[background-color,color,transform] duration-200 hover:translate-x-0.5 ${index === 0 ? (isLight ? 'bg-[#dce8e0]/60 text-[#1d302c]' : 'bg-white/[0.06] text-white') : menuItemSurface}`}
            >
              {link.label}
              <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-70" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <section aria-labelledby="mcp-hosts-title" className={`mt-4 border-t pt-4 ${menuDivider}`}>
          <div className="px-2">
            <h2 id="mcp-hosts-title" className={`text-sm font-medium ${isLight ? 'text-[#1d302c]' : 'text-white'}`}>Connect through your AI host</h2>
            <p className={`mt-1 text-xs leading-5 ${menuCopy}`}>Use Cognistration wherever you already work with MCP.</p>
          </div>

          <button
            type="button"
            onClick={openConnect}
            className={`group mt-3 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px ${isLight ? 'border-[#b9d0c1] bg-white/65 text-[#1d302c] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_24px_rgba(45,65,59,0.06)] hover:border-[#7fa594] hover:bg-white/85' : 'border-[#b6ddcc]/20 bg-white/[0.055] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#b6ddcc]/40 hover:bg-white/[0.09]'}`}
          >
            <HostMark host={MCP_HOSTS[0]} isLight={isLight} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">Add to ChatGPT <span className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] ${isLight ? 'bg-[#dce8e0] text-[#548477]' : 'bg-[#b6ddcc]/10 text-[#b6ddcc]'}`}>Guided</span></span>
              <span className={`mt-0.5 block truncate text-xs ${menuCopy}`}>Connect Cognistration as a remote MCP app</span>
            </span>
            <ArrowRight className="size-4 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MCP_HOSTS.slice(1).map((host) => (
              <a
                key={host.id}
                href={host.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className={`group flex min-w-0 items-center gap-2.5 rounded-2xl border p-2.5 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px ${isLight ? 'border-[#d2ded6] bg-white/45 text-[#31443e] hover:border-[#9ebdaf] hover:bg-white/75 hover:shadow-[0_8px_18px_rgba(45,65,59,0.06)]' : 'border-[#b6ddcc]/10 bg-white/[0.035] text-white/85 hover:border-[#b6ddcc]/30 hover:bg-white/[0.07]'}`}
              >
                <HostMark host={host} isLight={isLight} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{host.label}</span>
                  <span className={`mt-0.5 block truncate text-[11px] ${menuCopy}`}>{host.detail}</span>
                </span>
                <ArrowSquareOut className="size-3.5 shrink-0 opacity-35 transition-opacity duration-200 group-hover:opacity-75" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className={`px-2 pt-3 text-[11px] leading-5 ${menuCopy}`}>Each host opens its own MCP setup surface. Availability and permissions depend on the host and plan.</p>
        </section>

        <div className={`mt-4 flex items-center gap-2 border-t pt-4 md:hidden ${menuDivider}`}>
          <Link href="/signup" onClick={() => setMenuOpen(false)} className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d7eadf]/30 bg-[#d7eadf]/90 px-4 py-2.5 text-sm font-medium text-[#17332e] transition hover:bg-white">Create account</Link>
          <button type="button" onClick={openAccount} className={`inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm transition ${actionSurface}`}>Sign in</button>
        </div>
      </div>

      {connectOpen && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden overscroll-none bg-[#0e1614]/80 p-5 backdrop-blur-md pointer-events-auto" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConnectOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="connect-chatgpt-title" className="glass-panel relative max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#b6ddcc]/10 bg-[#1d2926] text-white shadow-2xl">
            <button type="button" onClick={() => setConnectOpen(false)} className="!absolute right-5 top-5 z-10 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close connection instructions">
              <X className="size-5" aria-hidden="true" />
            </button>
            <div data-testid="chatgpt-connect-scroll" className="max-h-[calc(100dvh-2rem)] !overflow-y-auto overscroll-contain p-7 sm:p-9">
            <div className="max-w-sm">
              <p className="text-sm font-medium text-[#b6ddcc]">Bring your sessions with you</p>
              <h2 id="connect-chatgpt-title" className="mt-3 text-3xl font-medium tracking-[-0.04em]">Connect ChatGPT</h2>
              <p className="mt-4 text-sm leading-6 text-white/65">Add Cognistration to your ChatGPT conversations so you can find and shape sessions from wherever you think next.</p>
            </div>
            <ol className="connect-steps mt-7 text-sm text-white/75">
              <li className="connect-step"><span className="connect-step__number" aria-hidden="true">01</span><span>Copy the setup prompt below.</span></li>
              <li className="connect-step"><span className="connect-step__number" aria-hidden="true">02</span><span>Open ChatGPT, start a new chat, and paste the prompt. It will guide you to the one-time app connection step.</span></li>
              <li className="connect-step"><span className="connect-step__number" aria-hidden="true">03</span><span>Approve the connection when ChatGPT asks. The app server is remote; do not send the URL to a Git or marketplace installer.</span></li>
            </ol>
            <div className="glass-subpanel mt-7 rounded-2xl border border-[#b6ddcc]/10 bg-white/[0.04] p-3">
              <p className="px-2 text-[11px] uppercase tracking-[0.16em] text-white/40">ChatGPT setup prompt</p>
              <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap px-2 text-xs leading-5 text-white/75">{CHATGPT_SETUP_PROMPT}</pre>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={copySetupPrompt} className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3 text-sm font-medium text-[#17332e] transition hover:bg-white">
                {copied ? <Check className="size-4" weight="bold" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy setup prompt'}
              </button>
              <a href={CHATGPT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#b6ddcc]/20 bg-[#13201d]/45 px-5 py-3 text-sm text-white transition hover:border-[#b6ddcc]/42 hover:bg-[#b6ddcc]/[0.1]">
                Open ChatGPT chat
                <ArrowSquareOut className="size-4" aria-hidden="true" />
              </a>
            </div>
            <button type="button" onClick={() => setShowPluginInstructions((open) => !open)} aria-expanded={showPluginInstructions} className="mt-6 text-left text-xs text-[#b6ddcc] underline decoration-[#b6ddcc]/30 underline-offset-4 transition hover:text-white">
              {showPluginInstructions ? 'Hide Plugins-tab instructions' : 'Adding from the Plugins tab?'}
            </button>
            {showPluginInstructions && (
              <div className="mt-4 rounded-2xl border border-[#e0b493]/20 bg-[#e0b493]/[0.06] p-4 text-xs leading-5 text-white/65">
                <p className="font-medium text-[#e0b493]">Use the remote connection flow</p>
                <p className="mt-2">A screen asking for Source, Git ref, and Sparse paths is a repository marketplace installer. It is not the right form for Cognistration’s HTTPS MCP endpoint.</p>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5">
                  <li>Close that Git or marketplace form for this connection.</li>
                  <li>Open ChatGPT’s Add connector, remote app, or Developer mode flow.</li>
                  <li>Paste <code className="rounded bg-black/20 px-1.5 py-0.5 text-[#d7eadf]">{MCP_SERVER_URL}</code> and approve the connection.</li>
                </ol>
                <p className="mt-3 text-white/45">For a different Git plugin, Source is that repository URL, Git ref is its requested branch or tag, and Sparse paths are optional repository folders. Do not invent those values for Cognistration.</p>
              </div>
            )}
            <p className="mt-6 text-xs leading-5 text-white/40">Availability depends on your ChatGPT plan and workspace settings.</p>
          </div>
          </div>
        </div>,
        document.body
      ) : null}
    </header>
  );
}
