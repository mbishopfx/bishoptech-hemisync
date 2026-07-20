const title = 'How to Use Cognistration Safely and Intentionally';
const description = 'Prepare, listen, and reflect with a clear Cognistration routine, practical safety guidance, and a responsible overview of binaural-beat research.';
const canonical = 'https://cognistration.com/tutorial';
const mark = 'https://cognistration.com/images/cognistration-mark.png';

export const metadata = {
  title: { absolute: `${title} — Cognistration` },
  description,
  alternates: { canonical },
  openGraph: {
    title: `${title} — Cognistration`,
    description,
    siteName: 'Cognistration',
    type: 'website',
    url: canonical,
    images: [{ url: mark, width: 1254, height: 1254, alt: 'Cognistration brain and waveform mark' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} — Cognistration`,
    description,
    images: [mark],
  },
};

export default function TutorialLayout({ children }) {
  return children;
}
