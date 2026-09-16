# Daily Cognistration YouTube source scout — 2026-09-02

- Run time: `2026-09-02 09:00 -0500`
- Search topics: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation; intuition and synchronicity; metaphysics, consciousness, and related philosophy.
- Direct YouTube discovery: 26 `yt-dlp` searches (18 topical + 8 rights-focused) returned 238 raw entries / 178 unique direct video IDs.
- Web discovery fallback: 5 DuckDuckGo searches returned 40 results. The configured Firecrawl-backed search failed with the known `NoneType` / `status_code` error; DDGS was used for discovery only. Visible YouTube pages confirmed canonical titles for the final CC finalists.
- Candidate union: **181** unique video IDs (direct YouTube plus DDGS-only discoveries).
- Metadata validation: **181** candidates were checked with `yt-dlp` without downloading media; **160** resolved and **21** remained unresolved.
- Existing-source deduplication: the queue had **17** unique URLs before this run; prior research/clip records were checked by video ID.
- Decision ledger: 4 approved, 71 held for rights review, 54 duplicates, 31 rejected, and 21 unresolved.
- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.

## Approved and appended

All four additions are public, English-language, `not_live`, substantive records uploaded inside the current discovery window. The first item has YouTube Creative Commons license metadata; the second and third have explicit description-level permission from Devendra Mohan for the English translated versions; the fourth has an explicit CC BY-SA 4.0 description statement. Attribution and ShareAlike obligations must be retained for the CC items.

1. **Stop Thinking. Start Doing. | Turn Your Intentions Into Action | Live #153 | Devendra Mohan** — Devendra-Diary — uploaded `20260831` — `2248s` — `https://www.youtube.com/watch?v=2QazKP2d1Lc`
   - Rights evidence: Description: This is an AI-translated English voice version of the original Hindi Live, published with permission.
2. **Channeling the Collective Human Consciousness: Human First - July 26, 2026** — Grounded Galactic Twins — uploaded `20260813` — `3118s` — `https://www.youtube.com/watch?v=3lW3K-_Sjd0`
   - Rights evidence: YouTube license metadata: Creative Commons Attribution license (reuse allowed)
3. **Cognitive Biases in Learning. Why Our Brains Misjudge Learning?** — Wydział Zarządzania i Ekonomii Politechnika Gdańska — uploaded `20260824` — `304s` — `https://www.youtube.com/watch?v=89qrD-8KbXo`
   - Rights evidence: Description: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
4. **INNER PEACE DOESN’T BEGIN OUTSIDE | Devendra Mohan Satsang | 17.04.2026** — Devendra-Diary — uploaded `20260815` — `2167s` — `https://www.youtube.com/watch?v=W_Ihk1N6yeQ`
   - Rights evidence: Description: This is an AI-translated English voice version of the original Hindi Live, published with permission.

## Held for rights review

These are relevant, technically available, and not duplicates, but they lack sufficient video-level reuse evidence. Rights attached only to music, cited source documents, or non-commercial licenses were not treated as clearance.

- **Lets Meditate Every Day Together | DAY 356** — Daily Meditation Group — uploaded `20260828` — `1067s` — https://www.youtube.com/watch?v=-YDI3SMsLLg
- **Consciousness by The Imaginary Guy Himself FinnO4 | WTA | Lectures** — Witness The Anamalous  — uploaded `20260823` — `485s` — https://www.youtube.com/watch?v=-rDb0JePVug
- **The Neural Correlates of Jhāna & Three Ways to Engage the Unconditioned | Rick Hanson** — Vancouver Dharma and Gnosis — uploaded `20260803` — `3552s` — https://www.youtube.com/watch?v=0ttGwBHoeho
- **Other Dimensions** — Chick Stories — uploaded `20260829` — `1419s` — https://www.youtube.com/watch?v=159PlHZPMcU
- **Past Lives &The Dark Side of Healing: What Happens When People Refuse to Change** — Dr Jo Whitaker Organic Conscious Thought Leader — uploaded `20260801` — `5093s` — https://www.youtube.com/watch?v=1sEsqNLMMcY
- **A Breathscape Practice for Cultivating Mindfulness** — Mindful — uploaded `20260821` — `1259s` — https://www.youtube.com/watch?v=1sx81hSJw4A
- **Joyous Effort: A Buddhist Approach to Finding Inner Strength | Dr. Pilar Jennings** — Theosophical Society — uploaded `20260828` — `3641s` — https://www.youtube.com/watch?v=4JFblb2f5rs
- **Lets Meditate Every Day Together | DAY 338** — Daily Meditation Group — uploaded `20260808` — `1242s` — https://www.youtube.com/watch?v=5YoVregcO0Q
- **Jon Kabat-Zinn: A Breathscape Practice for Cultivating Mindfulness** — Mindful — uploaded `20260821` — `1258s` — https://www.youtube.com/watch?v=62CZWlO6tCE
- **Bashar Exposes Atlantis Energy Imprints Blocking New Earth | Bashar Channeling** — Divine Insights — uploaded `20260804` — `1717s` — https://www.youtube.com/watch?v=8TNyeAhWlfw
- **Lets Meditate Every Day Together | DAY 335** — Daily Meditation Group — uploaded `20260805` — `1451s` — https://www.youtube.com/watch?v=9kPhpruO0Bg
- **Consciousness and Reality | Online Forum | PWPA Los Angeles** — PWPA Los Angeles — uploaded `20260825` — `5687s` — https://www.youtube.com/watch?v=9llk9WnIHuc
- Additional relevant rights-held records are preserved in `2026-09-02_candidate_decisions.json` (59 more).

## Rejected or blocked highlights

- Active/upcoming and historical-live records were rejected by `live_status`; non-English records were rejected by the English-only contract.
- Music-only, low-value, spam-like, off-topic, and short records were screened out.
- Creative Commons credits for individual music tracks were not treated as a license for the surrounding video.
- Creative Commons `BY-NC-SA` material was held out because the Cognistration channel is a commercial publishing context.
- One short follow-up `yt-dlp` read-back retry for the two CC finalists hit YouTube client errors; their initial direct metadata records resolved successfully, the license/description evidence was preserved, and browser-visible pages confirmed the canonical titles. No cookies or credentials were accessed.

## Verification

- `sources/links.txt` was appended without reordering or deleting existing entries.
- Final validation: **21** non-comment lines, **21** unique YouTube video IDs, **0** invalid lines; all four new canonical watch URLs are present.
- `git diff --check` passed for the repository worktree (pre-existing unrelated worktree changes remain untouched).

## Next recommended source

`https://www.youtube.com/watch?v=3lW3K-_Sjd0` — **Channeling the Collective Human Consciousness: Human First - July 26, 2026** by **Grounded Galactic Twins**. It is the first newly appended source and carries YouTube `Creative Commons Attribution license (reuse allowed)` metadata; preserve attribution when clipping.
