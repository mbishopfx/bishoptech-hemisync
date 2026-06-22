import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Pricing | Cognistration',
  description: 'Compare Cognistration plans, free access, and premium membership options.',
  path: '/pricing',
  type: 'website'
});

export default function PricingLayout({ children }) {
  return children;
}
