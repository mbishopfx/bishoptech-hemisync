# T002 Research and Information Architecture Receipt

## Result

Done. Live official, scientific, government, and repo research supports one first-party product tutorial hub plus four substantial spokes. It does not support creating a page for every keyword variant.

## Recommended URL Architecture

- `/tutorial` — Cognistration Tutorial: Set Up a Safe, Intentional Audio Session.
- `/tutorial/meditation-self-exploration` — Meditation and Self-Exploration with Cognistration: A Grounded Practice Guide.
- `/tutorial/dreamwork-lucid-dreaming` — Dreamwork and Lucid Dreaming: A Sleep-Respecting Guide.
- `/tutorial/astral-projection-out-of-body-experiences` — Astral Projection and Out-of-Body Experiences: Reports, Practice, and Evidence.
- `/tutorial/remote-viewing-stargate-documents` — Remote Viewing and STAR GATE: What the Declassified Records Show.

Do not add separate generic getting-started, binaural-beats, theta/alpha, metaphysics, “deep dreaming,” CIA, GRILL FLAME, or term-variant pages. Existing blog articles cover the generic product and audio-mechanism intents; the rejected pages would risk duplication, cannibalization, or doorway-page behavior.

## Intent and Semantic Phrase Map

- Product hub: how to use Cognistration; choose a session by intention; headphones and volume; what to notice; post-session reflection; when to stop.
- Meditation/self-exploration: sound-supported meditation; setting an intention; body awareness; reflection prompts; meditation without chasing an outcome; experience versus evidence; bounded metaphysical self-inquiry.
- Dreamwork: dream recall routine; dream journal prompts; hypnagogic imagery; lucid dreaming evidence; REM/non-REM dreaming; protect sleep continuity; sleep-paralysis grounding.
- Astral projection/OBE: astral projection versus out-of-body experience; OBE versus lucid dream; body-location sensations; hypnagogia; multisensory self-location; grounding after unusual experiences.
- Remote viewing history: CIA remote-viewing program; STAR GATE documents; GRILL FLAME and CENTER LANE; 1995 AIR evaluation; operational usefulness; evidence versus program history.
- Audio science: binaural percept; difference frequency; auditory beat stimulation; mixed entrainment evidence; safe listening. Keep this on the hub and link to existing editorial articles.

“Deep dreaming” is audience language rather than a standard scientific term. Use it sparingly, then define the relevant ideas as dream recall, dreamwork, lucid dreaming, hypnagogia, REM, and non-REM sleep.

## Scientific and Safety Sources

- Ingendoh, Posny, Heine, PLOS ONE 2023, systematic review of 14 heterogeneous EEG studies: binaural-beat entrainment findings were inconsistent. https://pubmed.ncbi.nlm.nih.gov/37205669/
- Garcia-Argibay, Santed, Reales, Psychological Research 2019: meta-analysis reported aggregate cognition/anxiety/pain effects but did not establish guaranteed frequency-specific states or treatment. https://pubmed.ncbi.nlm.nih.gov/30073406/
- Orozco Perez et al., eNeuro 2020: measurable connectivity patterns but weak cortical entrainment relative to monaural beats and unresolved functional significance. https://www.eneuro.org/content/7/2/ENEURO.0232-19.2020
- Goyal et al., JAMA Internal Medicine 2014: small-to-moderate improvements in some stress outcomes; insufficient evidence for several others. https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/1809754
- NIH NCCIH meditation safety/effectiveness summary: evidence varies, adverse experiences can occur, and meditation should not replace care. https://www.nccih.nih.gov/health/meditation-and-mindfulness-effectiveness-and-safety
- Farias et al., Acta Psychiatrica Scandinavica 2020 adverse-event systematic review. https://onlinelibrary.wiley.com/doi/10.1111/acps.13225
- NIH NICHD sleep basics: vivid dreaming is common in REM, also occurs in non-REM, and why humans dream remains unresolved. https://www.nichd.nih.gov/health/topics/sleep/conditioninfo/Pages/what-happens.aspx
- Konkoly et al., Current Biology 2021: limited communication with some polysomnographically verified lucid dreamers; not proof of reliable control or product-induced lucidity. https://pubmed.ncbi.nlm.nih.gov/33607035/
- Stumbrys et al., Consciousness and Cognition 2012: lucid-dream induction evidence is limited and uneven. https://pubmed.ncbi.nlm.nih.gov/22841958/
- Blanke et al., Brain 2004: some OBE/autoscopic experiences are associated with disrupted multisensory integration and temporoparietal processing; this does not adjudicate every spiritual interpretation. https://pubmed.ncbi.nlm.nih.gov/14662516/
- WHO–ITU Safe Listening Devices and Systems 2019: risk depends on volume and duration. https://www.who.int/publications/i/item/9789241515276

## CIA and Government Sources

- CIA STAR GATE collection: proves the archive/program history, not paranormal efficacy. https://www.cia.gov/readingroom/collection/stargate
- 1995 AIR evaluation, `CIA-RDP96-00791R000200180006-4.pdf`: documents competing interpretations, does not establish paranormal causation, and does not support actionable intelligence value. https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000200180006-4.pdf
- Proposed management strategy, `CIA-RDP96-00791R000100150004-8.pdf`: recommends terminating operations/R&D and describes vague or ambiguous output. https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000100150004-8.pdf
- Operational tasking evaluation, `CIA-RDP96-00791R000200300002-2.pdf`: shows why lab statistics and operational utility are separate questions. https://www.cia.gov/readingroom/docs/CIA-RDP96-00791R000200300002-2.pdf
- 2006 CIA FOIA letter: STAR GATE became an archive umbrella for related project names. https://www.cia.gov/readingroom/docs/DOC_0001299750.pdf

Required framing: U.S. intelligence agencies funded and evaluated remote-viewing research and operational trials. The existence and declassification of those records is not proof that remote viewing is paranormal, reliable, or operationally useful.

## Claim Rules

Use precise language such as:

- “Some studies report changes in anxiety, attention, pain, or brain activity, but findings vary and EEG evidence for reliable entrainment is inconsistent.”
- “Cognistration provides intentional audio and reflection tools; individual experiences vary.”
- “Lucid dreaming is a documented sleep phenomenon. Reliable induction and specific benefits are not guaranteed.”
- “People may interpret unusual bodily or dreamlike experiences spiritually, psychologically, or neurologically. Cognistration does not claim to verify a metaphysical explanation.”
- “A frequency label describes an audio design target; it does not guarantee a mental state.”

Avoid claims that Cognistration synchronizes the brain, induces theta, signals safety, opens portals, activates astral projection, is proved by the CIA, provides scientifically proven remote viewing, heals, or guarantees outcomes.

## Google-Aligned Technical Direction

- Server-render all essential copy, headings, sources, internal links, metadata, and JSON-LD; keep animation progressive and client-isolated.
- Use one metadata implementation per route.
- Use visible breadcrumbs plus `BreadcrumbList` JSON-LD on spokes.
- Do not use deprecated HowTo rich-result markup or expect FAQ rich results.
- Add only canonical, substantial routes to the sitemap; truthful `lastModified` values only.
- Keep public tutorial routes crawlable. `robots.txt` controls crawling, not guaranteed index exclusion.
- Keep `llms.txt` useful for other consumers but do not claim it boosts Google or AI-search ranking.
- Keep site-level Organization/WebSite markup centralized and use only accurate route-level WebPage/Article markup.
- Correct shared `bishoptech.dev` fallbacks to the verified `https://cognistration.com` canonical source where safe.

Official references:

- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/blog/2023/08/howto-faq-changes
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies

## Live Checks

`https://cognistration.com/tutorial` returned 200 with a self-canonical; `www.cognistration.com` redirected to the apex. The source still contains several `bishoptech.dev` SEO fallbacks, which should be centrally corrected if the Judge authorizes the shared scope.
