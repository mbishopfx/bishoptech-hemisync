'use client';

import { useEffect, useRef } from 'react';
import { animate, createScope, stagger } from 'animejs';

export function TutorialMotion({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return undefined;

    const scope = createScope({
      root: rootRef.current,
      mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' },
    }).add((self) => {
      if (self.matches.reduceMotion) return;

      animate('[data-tutorial-reveal]', {
        opacity: [0, 1],
        y: [22, 0],
        duration: 850,
        delay: stagger(65),
        ease: 'out(4)',
      });

      animate('[data-signal-bar]', {
        opacity: stagger([0.25, 0.75], { from: 'center' }),
        scaleY: stagger([0.35, 1], { from: 'center' }),
        duration: 1400,
        delay: stagger(55),
        alternate: true,
        loop: true,
        ease: 'inOut(3)',
      });
    });

    return () => scope.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
