import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';

export function TutorialBreadcrumbs({ current, currentUrl }) {
  const items = [
    { name: 'Home', href: '/', url: 'https://cognistration.com' },
    { name: 'Tutorial', href: '/tutorial', url: 'https://cognistration.com/tutorial' },
    { name: current, url: currentUrl },
  ];
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <nav aria-label="Breadcrumb" className="overflow-x-auto">
        <ol className="flex min-w-max items-center gap-2 text-xs text-[#87968f]">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center gap-2">
              {index > 0 && <CaretRight className="size-3 text-[#b1beb7]" aria-hidden="true" />}
              {item.href ? (
                <Link href={item.href} className="rounded-sm py-2 transition hover:text-[#315e55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#548477]">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="py-2 text-[#4e625b]">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
