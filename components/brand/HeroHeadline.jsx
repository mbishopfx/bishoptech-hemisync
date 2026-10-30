'use client';

import { Fragment } from 'react';

// The hero headline is the first thing a visitor reads, so it earns a real
// entrance instead of fading in as a block. Words rise out of a mask one at a
// time, then a sheen travels through each word so the line reads as a signal
// moving through the text — the same idea as the signal lab below it: a steady
// carrier with something passing through it.
//
// Deliberately CSS-driven, not framer-motion. An initial="hidden" variant
// leaves the headline invisible for as long as JavaScript has not hydrated,
// and this headline carries the product's one-sentence explanation. A CSS
// keyframe with fill-mode both paints the first frame from the server render
// and still lands on the final state if the animation never runs at all.
//
// The words are split for animation only, so the semantic text stays in the
// h1's aria-label and the visual spans are hidden from assistive tech. Each
// mask gets padding/margin so descenders are not guillotined by overflow.
//
// Two custom properties are handed to each word: --rise-delay staggers the
// entrance, --sheen-delay offsets the sweep so the highlight travels left to
// right across the line instead of flashing on every word at once. They have to
// be set here rather than in the stylesheet because the stagger depends on the
// word's position, which only the component knows.

const SHEEN_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function HeroHeadline({ children, className = '', id }) {
  const text = String(children).trim();
  const words = text.split(/\s+/);

  return (
    <h1
      id={id}
      aria-label={text}
      className={`hero-headline text-[clamp(2.6rem,7.2vw,5.5rem)] font-medium leading-[0.94] tracking-[-0.055em] ${className}`}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="hero-word-mask" aria-hidden="true">
            <span
              className="hero-word"
              style={{
                '--rise-delay': `${120 + index * 85}ms`,
                '--sheen-delay': `${(SHEEN_ORDER[index] ?? index) * 180}ms`
              }}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </h1>
  );
}