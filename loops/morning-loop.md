# Morning Loop

Use this loop for the first pass of the day.

Goals
- Check what changed since the last run.
- Keep tone growth moving forward.
- Verify website/runtime build readiness.
- Verify the blog-to-app sync assumptions still make sense.
- Verify Stripe env, checkout, and webhook readiness when payments are in scope.

Suggested routine
1. Read loops/state.md first.
2. Inspect recent repo changes.
3. If tone work changed, generate or request at least 2 new tone variants.
4. If blog content changed, confirm the website/runtime still builds.
5. If payments changed, verify Stripe keys, webhook endpoint, and checkout flow are still aligned.
6. Update loops/state.md with what changed, what passed, and what needs follow-up.

Pass/fail signals
- Pass: at least 2 tone variants are produced when tone work is involved, and the build check stays green.
- Pass: Stripe webhook and checkout configuration are consistent with the live domain when payments are involved.
- Fail: build break, missing sync path, or unclear ownership of the latest content.
