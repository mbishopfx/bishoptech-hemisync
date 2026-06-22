import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Inside the Machine | Cognistration',
  description: 'See how Cognistration organizes listening, generation, and account workflows.',
  path: '/machine',
  type: 'website'
});

export default function MachineLayout({ children }) {
  return children;
}
