const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';

export default function Head() {
  const title = 'Inside the Machine';
  const description = 'See how Cognistration organizes listening, generation, and account workflows.';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${siteUrl}/machine`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${siteUrl}/machine`} />
      <meta property="og:image" content={`${siteUrl}/images/og-preview.png`} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/images/og-preview.png`} />
    </>
  );
}
