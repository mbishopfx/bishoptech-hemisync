export const metadata = {
  title: { absolute: 'Purchase Complete — Cognistration' },
  description: 'Cognistration tone-pack delivery confirmation.',
  alternates: { canonical: '/packs/success' },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
};

export default function PacksSuccessLayout({ children }) {
  return children;
}