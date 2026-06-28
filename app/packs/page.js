import { PacksBrowser } from '@/components/packs/PacksBrowser';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Tone Packs | Cognistration',
  description: 'Preview Cognistration tone packs, purchase access through Stripe, and download full tracks after checkout.',
  path: '/packs'
});

export default function PacksPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-28 md:px-10">
      <PacksBrowser />
    </main>
  );
}
