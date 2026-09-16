# Daily Cognistration YouTube source scout — 2026-09-01

- Run time: `2026-09-01 09:00 -0500`
- Search topics: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation; intuition and synchronicity; metaphysics, consciousness, and related philosophy.
- Direct YouTube discovery: 18 topic queries returned `107` raw results / `105` unique video IDs. Eight additional rights-focused queries returned `79` raw results / `77` unique IDs, with overlap between passes; `178` unique direct-discovery IDs were available across both passes.
- Web discovery fallback: five DuckDuckGo queries returned `50` discovery results. The configured Firecrawl-backed web search failed with the same `NoneType`/`status_code` error seen previously. The browser-visible YouTube search page did not expose result anchors after access approval, so DDGS and direct YouTube search were used for discovery; `yt-dlp` metadata remained authoritative.
- Metadata validation: `138` shortlisted records were processed with `yt-dlp` without downloading media; `137` resolved successfully and one remained unresolved. The final approved records received a second metadata read-back confirming public availability, English audio, upload dates, and live status.
- Existing-source deduplication: prior queue/research records were checked by video ID; `49` of the processed records were already represented in prior records. The current queue had `12` unique IDs before this run.
- Live/upcoming gate: four historical live broadcasts (`was_live`) and one active live result were rejected; one unresolved metadata record was not eligible. No live or upcoming source was appended.
- Approved additions: **5**
- Held for rights review: **9** substantive topical finalists without sufficient video-level reuse evidence.
- Rejected or blocked: **124** processed records for duplicate, live/unresolved, language, topic-fit, low-value, medical-claim, or insufficient-rights reasons.

## Approved and appended

All five are public, substantive, English-audio, `not_live` records with upload dates inside the current 31-day discovery window. The first four have explicit permission statements; the university item has an explicit CC BY-SA 4.0 license statement. No source media was downloaded.

1. **Meditation and Consciousness with Ven. Guan Cheng (Lecture 10/10)** — BDG: Buddhistdoor Global — uploaded `2026-08-24` — `2,168s` — permission evidence: exact description text `Published with permission.`
   - `https://www.youtube.com/watch?v=bAwyh7KofbU`
2. **Meditation and Consciousness with Ven. Guan Cheng (Lecture 9/10)** — BDG: Buddhistdoor Global — uploaded `2026-08-17` — `1,965s` — permission evidence: exact description text `Published with permission.`
   - `https://www.youtube.com/watch?v=RlobB6-bXS8`
3. **TRUE DEVOTION EXPECTS NOTHING | Devendra Mohan Satsang | 12.07.2026** — Devendra-Diary — uploaded `2026-08-22` — `2,985s` — permission evidence: `AI-translated English voice version of the original Hindi Satsang, published with permission.` Metadata and formats report English audio.
   - `https://www.youtube.com/watch?v=NEESwDhSDUg`
4. **Become Spiritual Before You Become Religious | Pilibhit Satsang | 25 July 2026 | Devendra Mohan** — Devendra-Diary — uploaded `2026-08-08` — `3,325s` — permission evidence: `This video uses an AI-generated translated voice and has been published with permission from Devendra Mohan.` Metadata and formats report English audio.
   - `https://www.youtube.com/watch?v=DO3sMlabFBY`
5. **Metacognition and Learning Awareness. Thinking About Your Own Learning** — Wydział Zarządzania i Ekonomii Politechnika Gdańska — uploaded `2026-08-24` — `336s` — rights evidence: description states the material is licensed under `Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)`. English audio; attribution and ShareAlike obligations must be retained when clipped.
   - `https://www.youtube.com/watch?v=WvnKWP-UTdI`

## Held for rights review

These are relevant and technically available, but the rights evidence is not sufficient to append them to the clipping queue. The public-domain language applies to cited source documents or music rather than clearly licensing the video itself, unless noted otherwise.

- **The CIA Declassified a Report on Astral Travel Patanjali Described It 1,600 Years Earlier** — Quantum Spirituality Lab — uploaded `2026-08-26` — `1,603s` — description identifies the U.S. government report as public domain, but does not license the creator’s video.
  - `https://www.youtube.com/watch?v=g7KR4VI7XMY`
- **The Army Wrote A Manual For Leaving Your Body | GATEWAY Part 1 | FILE 010** — Project Moon Dust — uploaded `2026-08-24` — `509s` — public-domain government documents are cited, but the video itself has no reuse statement.
  - `https://www.youtube.com/watch?v=0xUXEFTezEg`
- **An Open-Ended Conversation with Tom Campbell** — New Thinking Allowed with Jeffrey Mishlove — uploaded `2026-08-21` — `7,322s` — substantive consciousness interview; no video-level reuse permission found.
  - `https://www.youtube.com/watch?v=NeCbzjjjehM`
- **Best of the Book Nook: 'Soul Traveler' by Albert Taylor** — WYSO — uploaded `2026-08-27` — `1,740s` — relevant OBE discussion; no video-level reuse permission found.
  - `https://www.youtube.com/watch?v=PfsIiLMmQ5s`
- **Neuroscience, Synchronicities, & the Evidence for a Playful Universe — Dr. Marjorie Woollacott** — The Weekend University — uploaded `2026-08-13` — `3,810s` — strong synchronicity/consciousness fit; no reuse statement found.
  - `https://www.youtube.com/watch?v=fWaHz2KcuNo`
- **The Easiest Astral Projection Method (The Star Corridor)** — Gael Anderson Meditation — uploaded `2026-08-04` — `10,803s` — relevant OBE meditation; no video-level reuse statement found.
  - `https://www.youtube.com/watch?v=GzRVihEJtho`
- **T.O.T. Public Interviews Ep.3 - Sleep Paralysis & Astral Projection** — The Orange Thought — uploaded `2026-08-24` — `4,302s` — relevant interview material; no video-level reuse statement found.
  - `https://www.youtube.com/watch?v=pPzdCvaFFFE`
- **What Is Metaphysics? | The Questions Behind Reality — Metaphysics Lecture 1** — Kahrba Hypothetically Speaking — uploaded `2026-08-17` — `3,590s` — substantive philosophy lecture; no video-level reuse statement found.
  - `https://www.youtube.com/watch?v=8sgZCOFPdWY`
- **Why Everything Is One | Swami Sarvapriyananda on Consciousness** — Vedanta — uploaded `2026-08-05` — `6,091s` — strong consciousness/philosophy fit; no video-level reuse statement found.
  - `https://www.youtube.com/watch?v=p5eJXYxO_tU`

## Rejected or blocked highlights

- The new BDG `Does God Exist? Dharma Reflections` item has explicit permission but only Korean audio with English subtitles, so it failed the loop’s English-audio contract.
- A French Creative Commons OBE documentary was rejected by the English-only gate.
- Frequency/sound candidates were generally music-only, carried unsupported medical or therapeutic claims, or had no video-level reuse permission; none were appended.
- Creative Commons music credits inside otherwise copyrighted videos were not treated as a license for the video.
- Historical live broadcasts, active live results, duplicates, obvious spam/low-value material, and off-topic results were excluded.

## Verification

- `sources/links.txt` was appended without reordering or deleting existing entries.
- Final validation: `17` non-comment lines, `17` unique YouTube video IDs, `0` invalid lines; all five new canonical watch URLs are present.
- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.

## Next recommended source

`https://www.youtube.com/watch?v=bAwyh7KofbU` — **Meditation and Consciousness with Ven. Guan Cheng (Lecture 10/10)**. It is the first new queue addition, has English audio, and has the clearest direct permission statement.
