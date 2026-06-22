const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function Head() {
  return (
    <>
      <title>Pricing | Cognistration</title>
      <meta
        name="description"
        content="Compare Cognistration plans, free access, and premium membership options."
      />
      <link rel="canonical" href={`${siteUrl}/pricing`} />
      <meta property="og:title" content="Pricing | Cognistration" />
      <meta
        property="og:description"
        content="Compare Cognistration plans, free access, and premium membership options."
      />
      <meta property="og:url" content={`${siteUrl}/pricing`} />
      <meta property="og:image" content={`${siteUrl}/images/logo.png`} />
      <meta name="twitter:title" content="Pricing | Cognistration" />
      <meta
        name="twitter:description"
        content="Compare Cognistration plans, free access, and premium membership options."
      />
      <meta name="twitter:image" content={`${siteUrl}/images/logo.png`} />
    </>
  );
}
