# T018 Community Server Client Worker Receipt

## Result

Done with a public-profile discovery limitation. Replaced the nonexistent `createServerClient` import with the installed `createServerComponentClient`, awaited the Next 15 cookie store, made `getSupabaseServerClient` async, and awaited both community callers. Queries, visibility rules, data semantics, rendering, navigation, metadata, auth, entitlements, packages, and UX remain unchanged.

## Verification

- Installed `@supabase/auth-helpers-nextjs` 0.10.0 export: confirmed.
- Minimal diff: helper conversion and exactly two awaited callers.
- Targeted ESLint: pass.
- Billing 5/5 and Studio 13/13: pass.
- `/community`: HTTP 200 with no `createServerClient` type error.
- Anonymous render: join CTA present, no Follow/Following action button.
- Missing profile: correct HTTP 404 and 1254x1254 OG dimensions.
- A real public profile could not be discovered after two attempts; no profile appeared in the feed and the direct read-only query hit local module/network limits.
- Existing Next 15 synchronous `params.username` warnings remain outside this judged compatibility boundary.
- Exactly three allowed paths changed.
- Backup: `/tmp/cognistration-t018.65yKrR`.
- Pre-manifest SHA: `ac1ffa21ecbf098cff55fd60d9e86763a81b60184d94c2c45fb10d3500932e5f`.
- Post-manifest SHA: `2cac3666a0eafdc88b817337faef025e793c573a1d03ee13e10fd17700871943`.
