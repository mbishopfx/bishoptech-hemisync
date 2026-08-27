'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowSquareOut, Check, Copy, Sparkle, X } from '@phosphor-icons/react';

const MCP_SERVER_URL = 'https://cognistration.com/api/mcp';
const CHATGPT_URL = 'https://chatgpt.com/';
const CHATGPT_SETUP_PROMPT = `Help me connect Cognistration to this ChatGPT account as a remote app.

Use this remote app server URL: ${MCP_SERVER_URL}

This is an HTTPS MCP endpoint, not a Git repository. Do not run git clone, do not add it as a local skill or marketplace source, and do not look for a repository checkout.

If you can use browser controls, open ChatGPT's app or connector setup, enable Developer mode if it is required, add this remote server, and pause for my confirmation before saving the connection. If you cannot change account settings from this chat, give me the exact clicks to complete the one user-controlled setup step.

After the connection is saved, verify it with Cognistration's public capability read, then offer to open the Cognistration tone machine. Keep audio off until I explicitly ask for a preview.`;

export function LiquidHeader({ onOpenAuth, theme = 'dark', scrollAware = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!scrollAware) return undefined;

    const updateScrollState = () => setHasScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [scrollAware]);

  const isLight = (scrollAware && hasScrolled) || theme === 'light';

  const headerSurface = isLight
    ? 'border-b border-[#d7e0d9]/80 bg-[#eef1ee]/90 text-[#1d302c] shadow-[0_10px_30px_rgba(45,65,59,0.06)] backdrop-blur-xl'
    : 'text-white';
  const navSurface = isLight
    ? 'border-[#cbd6cf] bg-white/80 text-[#31443e] shadow-[0_10px_24px_rgba(45,65,59,0.06)]'
    : 'border-white/15 bg-[#13201d]/55 text-white';
  const mutedLink = isLight ? 'text-[#60716b] hover:text-[#1d302c]' : 'text-white/70 hover:text-white';
  const actionSurface = isLight
    ? 'border-[#b8cbc0] bg-white/60 text-[#315e55] hover:border-[#7fa594] hover:bg-white'
    : 'border-white/20 bg-white/[0.08] text-white hover:border-white/40 hover:bg-white/[0.14]';
  const mobileSurface = isLight ? 'bg-[#eef1ee]/98 text-[#1d302c]' : 'bg-[#13201d]/96 text-white';

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
    setConnectOpen(true);
  };

  const openAccount = () => {
    if (onOpenAuth) {
      onOpenAuth();
      return;
    }
    window.location.assign('/login');
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 pb-4 pt-4 pointer-events-none transition-colors duration-300 sm:px-8 sm:pb-5 sm:pt-5 lg:px-12 ${headerSurface}`}>
      <Link href="/" className="pointer-events-auto flex items-center gap-3 transition-opacity hover:opacity-80">
        <Image
          src="/images/logo.png"
          alt="Cognistration Logo"
          width={36}
          height={36}
          className="size-8 object-contain brightness-110 contrast-125 md:size-9"
          priority
        />
        <span className={`text-lg font-medium tracking-tight ${isLight ? 'text-[#1d302c]' : 'text-white'}`}>Cognistration</span>
      </Link>

      <nav className={`!absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 rounded-full border px-6 py-3 text-sm backdrop-blur-xl pointer-events-auto md:flex lg:gap-8 ${navSurface}`}>
        <Link href="/" className={`${isLight ? 'text-[#1d302c]' : 'text-white'} transition-opacity hover:opacity-75`}>Home</Link>
        <Link href="/packs" className={`transition ${mutedLink}`}>Packs</Link>
        <Link href="/machine" className={`transition ${mutedLink}`}>Machine</Link>
        <Link href="/try" className={`transition ${mutedLink}`}>Agent demo</Link>
        <Link href="/tutorial" className={`transition ${mutedLink}`}>Tutorial</Link>
        <Link href="/blog" className={`transition ${mutedLink}`}>Blog</Link>
        <Link href="/pricing" className={`transition ${mutedLink}`}>Pricing</Link>
      </nav>

      <div className="hidden items-center gap-3 pointer-events-auto md:flex">
        <button
          type="button"
          onClick={openConnect}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition ${actionSurface}`}
        >
          <Sparkle className={`size-4 ${isLight ? 'text-[#548477]' : 'text-[#b6ddcc]'}`} weight="fill" aria-hidden="true" />
          Connect ChatGPT
        </button>
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

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={`z-50 flex size-10 items-center justify-center rounded-full border pointer-events-auto transition active:scale-95 md:hidden ${actionSurface}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X className="size-5" aria-hidden="true" /> : <span className="flex flex-col gap-1.5" aria-hidden="true"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>}
      </button>

      <div className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-8 backdrop-blur-xl transition-all duration-300 md:hidden pointer-events-auto ${mobileSurface} ${menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-8 pointer-events-none opacity-0'}`}>
        <Link href="/" onClick={() => setMenuOpen(false)} className={`text-xl font-medium ${isLight ? 'text-[#1d302c]' : 'text-white'}`}>Home</Link>
        <Link href="/packs" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Tone Packs</Link>
        <Link href="/machine" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Inside the Machine</Link>
        <Link href="/try" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Agent demo</Link>
        <Link href="/tutorial" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Tutorial</Link>
        <Link href="/blog" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Blog</Link>
        <Link href="/pricing" onClick={() => setMenuOpen(false)} className={`text-xl ${isLight ? 'text-[#60716b]' : 'text-white/75'}`}>Pricing</Link>
        <button type="button" onClick={openConnect} className={`mt-2 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm ${actionSurface}`}>
          <Sparkle className={`size-4 ${isLight ? 'text-[#548477]' : 'text-[#b6ddcc]'}`} weight="fill" aria-hidden="true" />
          Connect ChatGPT
        </button>
        <Link href="/signup" onClick={() => setMenuOpen(false)} className="inline-flex items-center rounded-full bg-[#d7eadf] px-5 py-3 text-sm font-medium text-[#17332e]">Create account</Link>
        <div className="mt-2 border-t border-white/10 pt-6">
          <button type="button" onClick={openAccount} className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm ${isLight ? 'border-[#cbd6cf] text-[#60716b]' : 'border-white/15 text-white/75'}`}>
            <svg className="size-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
            Sign in
          </button>
        </div>
      </div>

      {connectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0e1614]/80 p-5 backdrop-blur-md pointer-events-auto" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConnectOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="connect-chatgpt-title" className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-slate-200/15 bg-[#1d2926] p-7 text-white shadow-2xl sm:p-9">
            <button type="button" onClick={() => setConnectOpen(false)} className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close connection instructions">
              <X className="size-5" aria-hidden="true" />
            </button>
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
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <p className="px-2 text-[11px] uppercase tracking-[0.16em] text-white/40">ChatGPT setup prompt</p>
              <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap px-2 text-xs leading-5 text-white/75">{CHATGPT_SETUP_PROMPT}</pre>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={copySetupPrompt} className="inline-flex items-center gap-2 rounded-full bg-[#d7eadf] px-5 py-3 text-sm font-medium text-[#17332e] transition hover:bg-white">
                {copied ? <Check className="size-4" weight="bold" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy setup prompt'}
              </button>
              <a href={CHATGPT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm text-white transition hover:bg-white/10">
                Open ChatGPT chat
                <ArrowSquareOut className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-6 text-xs leading-5 text-white/40">Availability depends on your ChatGPT plan and workspace settings.</p>
          </div>
        </div>
      )}
    </header>
  );
}
