# Evening Loop

Use this loop for the second pass of the day.

Goals
- Audit one backend section deeply.
- Make sure the site/runtime is still healthy.
- Catch regressions early.
- Record any unresolved issues in loops/state.md.
- Include Stripe health/webhook checks whenever the rotation lands on payments or billing.

Suggested routine
1. Read loops/state.md first.
2. Rotate to the next backend section from the state file.
3. Check build/lint health.
4. Verify the current section's features still behave as expected.
5. If the section is auth/paywall or analytics, verify Stripe checkout, webhook delivery, and event handling.
6. Update the state file with issues, next steps, and the next section to review.

Backend section rotation
- auth/paywall
- tone generation
- blog publish/share
- app sync
- analytics
- admin/ops

Pass/fail signals
- Pass: the selected section is verified and any issues are logged.
- Fail: a broken route, broken build, or unclear sync rule.
