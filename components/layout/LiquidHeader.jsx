'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function LiquidHeader({ onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 md:px-12 lg:px-16 pointer-events-none">
      {/* Left: Brand Logo */}
      <Link href="/" className="pointer-events-auto flex items-center gap-3 transition-opacity hover:opacity-80">
        <Image
          src="/images/logo.png"
          alt="Cognistration Logo"
          width={36}
          height={36}
          className="w-8 h-8 md:w-9 md:h-9 object-contain brightness-110 contrast-125"
          priority
        />
        <span className="text-white text-lg font-medium tracking-tight">Cognistration</span>
      </Link>

      {/* Center (Desktop): Liquid Glass Navigation Pill with Core Pages */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 liquid-glass rounded-full px-6 lg:px-8 py-3 pointer-events-auto">
        <Link href="/" className="text-white text-sm font-medium transition-opacity hover:opacity-100">
          Home
        </Link>
        <Link href="/packs" className="text-white/70 text-sm font-medium transition-opacity hover:opacity-100">
          Packs
        </Link>
        <Link href="/machine" className="text-white/70 text-sm font-medium transition-opacity hover:opacity-100">
          Machine
        </Link>
        <Link href="/tutorial" className="text-white/70 text-sm font-medium transition-opacity hover:opacity-100">
          Tutorial
        </Link>
        <Link href="/blog" className="text-white/70 text-sm font-medium transition-opacity hover:opacity-100">
          Blog
        </Link>
        <Link href="/pricing" className="text-white/70 text-sm font-medium transition-opacity hover:opacity-100">
          Pricing
        </Link>
      </nav>

      {/* Right (Desktop): Liquid Glass Account Circle */}
      <div className="hidden md:flex items-center gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenAuth}
          className="liquid-glass h-10 w-10 rounded-full flex items-center justify-center text-white/80 transition-all hover:text-white hover:bg-white/10"
          aria-label="Account"
          title="Account / Sign In"
        >
          <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        </button>
      </div>

      {/* Right (Mobile Button Toggle) */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden liquid-glass h-10 w-10 rounded-full z-50 flex items-center justify-center text-white pointer-events-auto transition-transform active:scale-95"
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6 md:hidden pointer-events-auto transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-8'
        }`}
      >
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="text-white text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Home
        </Link>
        <Link
          href="/packs"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Tone Packs
        </Link>
        <Link
          href="/machine"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Inside the Machine
        </Link>
        <Link
          href="/tutorial"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Tutorial
        </Link>
        <Link
          href="/blog"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Blog
        </Link>
        <Link
          href="/pricing"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Pricing
        </Link>
        <Link
          href="/services"
          onClick={() => setMenuOpen(false)}
          className="text-white/80 text-xl font-medium transition-colors hover:text-cyan-300"
        >
          Services
        </Link>

        <div className="pt-4 border-t border-white/10 w-48 flex flex-col items-center">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenAuth?.();
            }}
            className="liquid-glass rounded-full px-6 py-3 flex items-center gap-3 text-sm font-light text-white/80 transition-colors hover:text-white"
          >
            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            Sign In / Account
          </button>
        </div>
      </div>
    </header>
  );
}
