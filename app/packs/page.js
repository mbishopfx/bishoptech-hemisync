import { PacksBrowser } from '@/components/packs/PacksBrowser';
import { buildPageMetadata, buildAbsoluteUrl } from '@/lib/seo';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicTrustFooter } from '@/components/layout/PublicTrustFooter';

const packsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cognistration Tone Packs',
  url: buildAbsoluteUrl('/packs'),
  description: 'Choose a Cognistration brain-state audio pack, preview the direction, pay once, and receive about 50 minutes of downloadable audio without creating an account.'
};

export const metadata = buildPageMetadata({
  title: 'Cognistration Tone Packs — Choose Your State',
  description: 'Choose a Cognistration brain-state audio pack, preview the direction, pay once, and receive about 50 minutes of downloadable audio without creating an account.',
  path: '/packs'
});

export default function PacksPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080c0d] text-white">
      <PublicHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(packsJsonLd) }}
        />
        <PacksBrowser />
      </main>
      <PublicTrustFooter />
    </div>
  );
}
