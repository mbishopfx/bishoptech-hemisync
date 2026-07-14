const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function Head() {
  return (
    <>
      <title>Pricing | Cognistration</title>
      <meta
        name="description"
        content="Cognistration is one complete private audio studio membership for $9 per month."
      />
      <link rel="canonical" href={`${siteUrl}/pricing`} />
      <meta property="og:title" content="Pricing | Cognistration" />
      <meta
        property="og:description"
        content="Cognistration is one complete private audio studio membership for $9 per month."
      />
      <meta property="og:url" content={`${siteUrl}/pricing`} />
      <meta property="og:image" content={`${siteUrl}/images/og-preview.png`} />
      <meta name="twitter:title" content="Pricing | Cognistration" />
      <meta
        name="twitter:description"
        content="Cognistration is one complete private audio studio membership for $9 per month."
      />
      <meta name="twitter:image" content={`${siteUrl}/images/og-preview.png`} />
    </>
  );
}
