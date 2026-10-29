'use client';

import { useEffect, useRef } from 'react';
import * as hairline from '@lucasmarkes/hairline';

/**
 * Mounts one of the @lucasmarkes/hairline figures.
 *
 * The React entry (`@lucasmarkes/hairline/react`) resolves locally but not in
 * Next.js production webpack, so this uses the DOM API from the main entry and
 * tears the figure down on unmount.
 */
export function HairlineFigure({
  figure,
  label,
  intensity = 0.45,
  play = true,
  className = '',
  style,
  palette
}) {
  const hostRef = useRef(null);

  useEffect(() => {
    const el = hostRef.current;
    const draw = hairline[figure];
    if (!el || typeof draw !== 'function') return undefined;

    const instance = draw(el, { intensity, label, play, theme: 'dark' });
    return () => instance.destroy();
  }, [figure, intensity, label, play]);

  return (
    <div
      ref={hostRef}
      aria-hidden={label ? undefined : 'true'}
      className={className}
      style={{
        width: '100%',
        aspectRatio: '5 / 4',
        // Hairline reads these six properties from the host element.
        '--hairline-plate': 'transparent',
        '--hairline-hi': '#eef2ee',
        '--hairline-edge': '#8ea79c',
        '--hairline-mid': '#3d5750',
        '--hairline-lo': '#16201d',
        '--hairline-stroke': '1',
        ...palette,
        ...style
      }}
    />
  );
}
