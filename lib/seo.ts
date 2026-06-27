import type { Metadata } from "next";

export const SITE_NAME = "Cognistration";
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bishoptech.dev",
);
export const SITE_DESCRIPTION =
  "Cognistration is a premium audio app for focus, rest, and intentional reset.";
export const SITE_OG_IMAGE = "/images/og-preview.png";

export const PUBLIC_ROUTES = [
  "/",
  "/blog",
  "/community",
  "/pricing",
  "/tutorial",
  "/machine",
  "/privacy",
  "/terms",
  "/cookies",
  "/contact",
  "/health-warning",
  "/ai-disclosure",
  "/llms.txt",
] as const;

export function buildAbsoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    metadataBase: SITE_URL,
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title: `${title} — Cognistration`,
      description,
      siteName: SITE_NAME,
      type: "website",
      url: path ?? "/",
      images: [
        {
          url: SITE_OG_IMAGE,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Cognistration`,
      description,
      images: [SITE_OG_IMAGE],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
  };
}
