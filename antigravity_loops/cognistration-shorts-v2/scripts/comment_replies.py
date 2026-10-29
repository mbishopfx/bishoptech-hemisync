#!/usr/bin/env python3
"""Answer new comments on Cognistration YouTube videos.

Runs as a no-agent cron job, so every reply has to come from a fixed, reviewed
template rather than a model. That is deliberate: this channel talks about brain
states, and improvised copy drifts toward medical or treatment claims that the
brand rules forbid. The rules below are keyword matched, factual, and say
headphones are required, that this is exploration rather than treatment, and
where the app is.

Anything that does not match a rule is NOT guessed at. It is written to
`state/needs_replies.md` for a human and listed on stdout, and the job still
exits 0 so a stream of unanswerable comments never looks like a failure.

Usage:
  python3 scripts/comment_replies.py --dry-run     # preview, post nothing
  python3 scripts/comment_replies.py               # reply for real
  python3 scripts/comment_replies.py --limit 5     # cap replies this run
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATE_DIR = PROJECT_ROOT / "state"
STATE_PATH = STATE_DIR / "comment_state.json"
NEEDS_PATH = STATE_DIR / "needs_replies.md"
TOKEN_PATH = Path(os.path.expanduser(
    "~/.hermes/profiles/cognistration/youtube_oauth_token.json"))

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
except ImportError as exc:  # pragma: no cover
    print(f"google-api-python-client required: {exc}", file=sys.stderr)
    raise

# ---------------------------------------------------------------------------
# Reply rules, checked top to bottom, first match wins.
# ---------------------------------------------------------------------------
# Each entry: (pattern, reply). Language stays factual, mentions headphones, and
# never promises a clinical outcome.
RULES = [
    (r"\bheadphone|earbud|speaker|without headphones|need headphone",
     "Headphones or earbuds are needed for this. The effect comes from a "
     "slightly different tone in each ear, and speakers mix them back together "
     "before they reach you."),

    (r"\bhow long|how many (minutes|hours)|for how long|length|duration|"
     r"\bminute",
     "People usually run a session for the length of the video and stop when "
     "they feel done. Headphones in, volume low enough to hold a conversation "
     "over."),

    (r"\bfree|price|cost|pay|subscription|how much",
     "The app has a free tier and the longer sessions are in the paid one. "
     "It is on the App Store, and the web version is at cognistration.com."),

    (r"\bapp\b|ios|iphone|android|where (can i|do i) (get|download)",
     "The app is on the App Store, and the browser version is at "
     "cognistration.com/machine if you would rather not install anything."),

    (r"\bdelta|sleeping|bed|night time|nighttime",
     "Delta is the slowest band here, roughly 0.5 to 4 Hz, and it is the one "
     "people pick for deep rest. Headphones in and let it run."),

    (r"\btheta\b",
     "Theta is around 4 to 8 Hz. It shows up in deep meditation and in that "
     "drifting borderland just before sleep. Headphones required."),

    (r"\balpha\b",
     "Alpha is roughly 8 to 13 Hz, the calm but still awake band, eyes closed "
     "and attention soft. Headphones required."),

    (r"\bbeta\b|\bgamma\b|\bsmr\b|focus|study|concentration",
     "Beta and SMR are the focused bands, gamma is the fastest one here. If you "
     "are working, start with SMR or beta. Headphones required."),

    (r"\bwhy|how (does|do) (this|it) work|science|binaural|does it actually|"
     r"how does th",
     "Two tones, one per ear, a few hertz apart. The auditory brainstem "
     "resolves a phantom pulse at the difference between them, and cortical "
     "rhythm tends to follow it. That is the frequency following response. "
     "Headphones are required because the two tones have to stay separated."),

    (r"\bmeditat|anxious|anxiety|stress|calm|relax|pain|insomnia|sleep "
     r"(issue|problem)|treat|therap|adhd|depress",
     "This is an exploration tool rather than a treatment, so it is worth "
     "trying with low expectations and judging it by your own experience. If "
     "you are being treated for something, keep that care with your clinician "
     "and use this alongside it."),

    (r"\bthank|love (this|it)|great|amazing|nice|helped|worked well|"
     r"\bbest\b|awesome|\bcool\b",
     "Glad it landed. Headphones in and let it run its length."),

    # Emoji-only or very short affirmation. Answering "🙏" with a paragraph is
    # wrong and ignoring it is ruder than replying.
    (r"^\W*$|^\s*(🙏|❤|💛|👍|\+1|amen|yes|true|exactly|real|facts)\s*$",
     "Appreciate you stopping by. Headphones in and let it run."),

    # Someone describing their own experience. Mirror it back without claiming
    # anything happened for them.
    (r"\bi (can )?(feel|noticed|felt|heard|saw|experienced)|it (worked|helped|"
     r"calmed|quieted|put me|made me)|more aware|tingle|pressure in my head",
     "Thanks for sharing what you noticed. People react quite differently to "
     "these, and your own experience is the only measure that matters here."),

    # Visuals and branding questions, answered plainly with no hidden-meaning
    # claim, which is the honest answer.
    (r"flower of life|golden ratio|geometr|the (images|symbols|art)|what do you "
     r"know about the images",
     "The visuals are design, chosen because the proportions feel calm to look "
     "at. They are not carrying a hidden signal. The part doing anything is the "
     "audio, and only through headphones."),

    # Philosophical or reflective comments that deserve acknowledgment rather
    # than a product answer.
    (r"ancient|remembered|reclaim|consciousness|awareness|spiritual|awaken|"
     r"universal|connection",
     "Well put. The work here is mostly about paying attention to your own "
     "state, which is an old idea wearing new equipment."),

    # Duration / looping / volume logistics, which are safe factual answers.
    (r"loop|repeat|how often|every day|louder|quieter|volume",
     "Loop it for as long as you want, and keep the volume low enough that you "
     "could still hold a conversation over it. Louder is not more effective."),

    (r"\bsubscribe|more (of )?these|keep (it )?up|series|part 2|next one|"
     r"new video|when (is|are) (the )?next",
     "More sessions post here on the odd days, and the full library is in the "
     "app."),
]

# Questions that must never be answered from a template, checked before RULES.
# A tinnitus or epilepsy sufferer asking "which frequency" is a clinical
# question, and recommending a setting for it is unsolicited medical advice on a
# public brand channel even when a wellness rule would happily have matched it.
# These get flagged so a person decides.
ROUTE_TO_HUMAN = re.compile(
    r"tinitus|tinnitus|migraine|seizure|epilep|pacemaker|blood pressure|"
    r"heart rate|medication|meds\b|dosage|\bdose\b|prescrib|diagnos|therapy|"
    r"therap(?:y|ist|eut)|psychiatr|adhd|autis|depress|bipolar|ptsd|"
    r"pregnan|epilepsy|hearing loss|hearing damage|ear damage|dizz|vertigo|"
    r"insomnia|sleep apnea|narcolep|doctor|clinician|medical|anxiety|anxious|"
    r"panic|overwhelmed|uncomfortable|felt (bad|weird|strange)|made me (feel )?"
    r"(bad|weird|sick)", re.I)

# Comments we deliberately leave alone. Not a judgement call for a script.
SKIP = re.compile(
    r"^\s*(spam|http://|https://|t\.me/|discord\.gg|\bbuy\b|\bseo\b|"
    r"onlyfans|crypto|nft|click (here|this link))", re.I)

MAX_REPLIES_PER_RUN = 15


def credentials():
    data = json.loads(TOKEN_PATH.read_text())
    creds = Credentials(
        token=data.get("token") or data.get("access_token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=data.get("scope", "").split() or None,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        data["token"] = creds.token
        TOKEN_PATH.write_text(json.dumps(data, indent=2))
    return creds


def load_state():
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"handled": [], "needs_human": []}


def save_state(state):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state["handled"] = state.get("handled", [])[-3000:]
    state["needs_human"] = state.get("needs_human", [])[-400:]
    STATE_PATH.write_text(json.dumps(state, indent=2))


def write_needs(state):
    """A human-readable list of what we could not answer."""
    pending = state.get("needs_human", [])[-60:]
    if not pending:
        if NEEDS_PATH.exists():
            NEEDS_PATH.unlink()
        return
    lines = [
        "# Comments needing a human",
        "",
        "The reply job could not match these to a safe template.",
        "Answer them in YouTube Studio, then they will be marked handled "
        "automatically once we see a reply from the channel.",
        "",
    ]
    for p in pending:
        lines.append(f"- [{p.get('when','')[:10]}] {p.get('video','')} "
                     f"<{p.get('url','')}>")
        lines.append(f"  {p.get('author','')}: {p.get('text','').strip()}")
        lines.append("")
    NEEDS_PATH.write_text("\n".join(lines))


def match_reply(text):
    low = text.lower()
    for pattern, reply in RULES:
        if re.search(pattern, low):
            return reply
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=MAX_REPLIES_PER_RUN)
    args = ap.parse_args()

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state = load_state()
    handled = set(state.get("handled", []))

    yt = build("youtube", "v3", credentials=credentials())
    mine = yt.channels().list(part="snippet,contentDetails", mine=True).execute()
    if not mine.get("items"):
        print("No channel for this token.", file=sys.stderr)
        sys.exit(1)
    chan = mine["items"][0]
    channel_id = chan["id"]
    print(f"[comments] channel: {chan['snippet']['title']} ({channel_id})")

    # No moderationStatus: that parameter takes exactly one value, not a list.
    # Omitting it returns published and held threads, which is what we want.
    threads = yt.commentThreads().list(
        part="snippet",
        allThreadsRelatedToChannelId=channel_id,
        maxResults=100,
        textFormat="plainText",
    ).execute()

    replied = 0
    flagged = 0
    for item in threads.get("items", []):
        top = item["snippet"]["topLevelComment"]
        cid = top["id"]
        if cid in handled:
            continue
        s = top["snippet"]
        author = s.get("authorDisplayName", "")
        text = (s.get("textDisplay") or "").strip()
        is_own = s.get("authorChannelId", {}).get("value") == channel_id
        has_channel_reply = any(
            r["snippet"].get("authorChannelId", {}).get("value") == channel_id
            for r in item["snippet"].get("replies", {}).get("comments", [])
        )
        if is_own:
            # Our own comment; nothing to answer.
            handled.add(cid)
            continue
        if has_channel_reply:
            handled.add(cid)
            continue
        if SKIP.search(text) or not text:
            handled.add(cid)
            continue
        if replied >= args.limit:
            break

        url = f"https://www.youtube.com/watch?v={item['snippet']['videoId']}"
        reply = None if ROUTE_TO_HUMAN.search(text) else match_reply(text)
        if not reply:
            state.setdefault("needs_human", []).append({
                "id": cid, "video": item["snippet"]["videoId"], "url": url,
                "author": author, "text": text[:400],
                "when": s.get("publishedAt", ""),
            })
            flagged += 1
            handled.add(cid)
            print(f"  [needs human] {author}: {text[:90]}")
            continue

        print(f"  [reply] {author}: {text[:70]}")
        print(f"          -> {reply[:70]}")
        if not args.dry_run:
            # The insert schema is textOriginal, not textSnippet — the latter is
            # what the read side returns, and sending it yields a 400 "Comments
            # cannot be empty".
            created = yt.comments().insert(
                part="snippet",
                body={"snippet": {"parentId": cid,
                                  "textOriginal": reply}},
            ).execute()
            rid = created.get("id", "?")
            # Record it so a later pass sees a channel reply and never answers
            # the same comment twice even if this run dies mid-way.
            handled.add(cid)
            state.setdefault("answered", []).append({
                "commentId": cid, "replyId": rid, "author": author,
                "video": item["snippet"]["videoId"],
                "text": text[:200], "reply": reply,
                "at": datetime.now(timezone.utc).isoformat(),
            })
            state["answered"] = state["answered"][-500:]
            # Persist immediately: if this run dies part way through, the replies
            # already posted must not be posted again next time.
            state["handled"] = sorted(handled)
            save_state(state)
            print(f"          posted ({rid})")
        replied += 1
        handled.add(cid)

    state["handled"] = sorted(handled)
    # A dry run must not touch state. Persisting here would mark every comment
    # it merely *looked at* as handled, so the next real run would find nothing
    # left to answer and the preview would silently eat the backlog.
    if not args.dry_run:
        save_state(state)
        write_needs(state)
    else:
        print(f"[comments] dry run: not saving state ({flagged} would need a human)")
    verb = "would reply" if args.dry_run else "replied"
    print(f"[comments] {verb} to {replied}, flagged {flagged} for a human, "
          f"{len(handled)} considered this pass")


if __name__ == "__main__":
    main()
