# Cognistration SEO Growth Loop

Purpose
- Monitor Google Search Console trends on a 3-day cadence.
- Find query/page gaps that can become blog posts, landing pages, FAQ pages, and social repurposing angles.
- Use the blog system message to request a deeper, article-style ghostwritten draft: more mechanism, logic, examples, and practical meaning than a short promo blurb.
- Keep the resulting post aligned with the calm, premium, trust-first brand.
- After publish, make sure the new URL is in the sitemap and submit the sitemap again so current and new pages are refreshed for indexing.

Cadence
- Run every 3 days.
- If the current search data is sparse, log that clearly and keep building the watchlist instead of forcing publication.

Inputs
- Google Search Console queries, pages, clicks, impressions, CTR, and position.
- Existing blog archive and sitemap coverage.
- Existing conversion paths on the site.

What to look for
- High impressions with low CTR.
- Queries with improving impressions or position over the last 3 days vs. the previous 3 days.
- Queries that imply intent around privacy, private app use, premium positioning, tutorials, setup, or trust.
- Pages that rank but do not convert.
- Repeated user language that can become a new page, FAQ block, or social post.

Decision rules
- If there is no meaningful GSC data yet, do not invent trends.
- Use existing site content and product intent to build a candidate list.
- Promote only topics that feel native to Cognistration’s voice and product promise.
- Avoid sensational language, medical claims, or hype.

Output format
1. Current trend summary.
2. Top opportunities by query/page.
3. Recommended next pages or blog posts.
4. Suggested social angles derived from those topics.
5. Indexing actions needed after publish.

Publishing workflow
- Draft the page in the existing site theme.
- Use clean semantic HTML structure and readable sectioning.
- Add internal links to related pages.
- Make sure the page is included in the sitemap.
- Submit the new URL to Search Console after deployment.
- Record the result in loops/seo-growth-state.md.

Page style guardrails
- Keep the tone calm, clear, premium, and trust-first.
- Use proper headings, lists, FAQs, and clear CTA blocks.
- Avoid raw markdown markers in rendered pages.
- Prefer useful, conversion-oriented explanations over generic SEO filler.
- **Card-based theme**: Blog posts must organize their contents inside glassmorphic card containers to maintain visual consistency with the `/blog` page:
  - The outer page container must use: `className="mx-auto w-full max-w-4xl space-y-8 px-6 md:px-10 research-paper-style"` (do not wrap in `page-shell` which overrides width constraints).
  - Post header wrapper class: `className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12"`
  - Post section wrapper class: `className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8"`
- **Typography**: Retain `.research-paper-style` typography rules (serif display fonts for h1/h2 headings, justified body paragraphs with clean line height, italic callout blockquotes) but do not strip section padding, backgrounds, or borders.
