import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Tutorial | Cognistration',
  description: 'Learn how to set up a calm listening session and use Cognistration effectively.',
  path: '/tutorial',
  type: 'website'
});

export default function TutorialLayout({ children }) {
  return children;
}
