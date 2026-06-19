const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

function normalizePageTitle(title) {
  if (typeof title !== 'string') {
    return title;
  }

  return title
    .replace(/\s[|—-]\sCognistration$/u, '')
    .trim();
}

export function buildPageMetadata({ title, description, path, image = '/images/logo.png', type = 'website' }) {
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const normalizedTitle = normalizePageTitle(title);

  return {
    title: normalizedTitle,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type,
      url: `${siteUrl}${path}`,
      siteName: 'Cognistration',
      title: normalizedTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: 'Cognistration logo'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: normalizedTitle,
      description,
      images: [imageUrl]
    }
  };
}

export function buildAbsoluteUrl(path) {
  return `${siteUrl}${path}`;
}
