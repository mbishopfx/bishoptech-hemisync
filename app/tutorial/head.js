const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function Head() {
  return (
    <>
      <title>Tutorial | Cognistration</title>
      <meta
        name="description"
        content="Learn how to set up a calm listening session and use Cognistration effectively."
      />
      <link rel="canonical" href={`${siteUrl}/tutorial`} />
      <meta property="og:title" content="Tutorial | Cognistration" />
      <meta
        property="og:description"
        content="Learn how to set up a calm listening session and use Cognistration effectively."
      />
      <meta property="og:url" content={`${siteUrl}/tutorial`} />
      <meta property="og:image" content={`${siteUrl}/images/og-preview.png`} />
      <meta name="twitter:title" content="Tutorial | Cognistration" />
      <meta
        name="twitter:description"
        content="Learn how to set up a calm listening session and use Cognistration effectively."
      />
      <meta name="twitter:image" content={`${siteUrl}/images/og-preview.png`} />
    </>
  );
}
