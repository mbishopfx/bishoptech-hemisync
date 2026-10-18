#!/usr/bin/env python3
"""Apple Calendar bookkeeping for the channel-clips loop.

Two jobs, both writing to the "Work" calendar:

  --series   lay out the upcoming run slots so the calendar shows the real
             cadence (Monday and Thursday, three channels, 04:00-06:30 local),
             and refresh anything that has already passed;
  --record   called after a run to file what actually shipped, with links, so a
             later review can see cause and effect next to the schedule.

AppleScript is written to a temp file rather than passed inline, exactly like
the analytics runner does, because a title with a stray quote or backslash
otherwise breaks the string literal and the event silently never appears.

Usage:
  python3 scripts/clip_calendar.py --series
  python3 scripts/clip_calendar.py --record --channel jesse --url https://...
"""

import argparse
import os
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timedelta

CALENDAR = "Work"
# Three channels, twice a week: six clips a week. Staggered an hour apart so
# one slow yt-dlp fetch does not stack up behind the others.
RUN_DAYS = (0, 3)          # Monday, Thursday  (cron: 1,4)
START_HOUR = 4
CHANNELS = ["jesse", "shawn", "rogan"]
SUMMARY_PREFIX = "Cognistration clips"

_CACHE = os.path.expanduser(
    "~/.hermes/profiles/cognistration/cache/clip_calendar_seen.json")


def esc(value):
    """Escape for an AppleScript double-quoted literal."""
    text = "" if value is None else str(value)
    return text.replace("\\", "\\\\").replace('"', '\\"')


def _ensure_running():
    """Calendar.app answers Apple Events, but only if it is actually running.

    A cron job hits this with the app closed and gets -600 "Application isn't
    running", which is why these events were never appearing. Launch it in the
    background and wait for it to come up before scripting.
    """
    if subprocess.run(["pgrep", "-x", "Calendar"], capture_output=True).returncode == 0:
        return True
    subprocess.run(["open", "-ga", "Calendar"], capture_output=True)
    for _ in range(20):
        time.sleep(0.5)
        if subprocess.run(["pgrep", "-x", "Calendar"],
                          capture_output=True).returncode == 0:
            time.sleep(2)   # let it finish opening before sending events
            return True
    return False


def _run(script):
    if not _ensure_running():
        print("  calendar: Calendar.app would not start", file=sys.stderr)
        return False
    fd, path = tempfile.mkstemp(suffix=".applescript", prefix="clipcal_")
    try:
        with os.fdopen(fd, "w") as fh:
            fh.write(script)
        r = subprocess.run(["osascript", path], capture_output=True,
                           text=True, timeout=45)
        if r.returncode != 0:
            print(f"  calendar error: {r.stderr.strip()[:200]}", file=sys.stderr)
            return False
        return True
    except Exception as exc:
        print(f"  calendar exception: {exc}", file=sys.stderr)
        return False
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def upcoming_slots(weeks=3):
    """Next `weeks` Monday/Thursday run dates, each with its three channel times."""
    out = []
    day = datetime.now().replace(hour=START_HOUR, minute=0, second=0,
                                 microsecond=0)
    seen = 0
    guard = 0
    while seen < weeks * 2 and guard < 60:
        guard += 1
        day += timedelta(days=1)
        if day.weekday() not in RUN_DAYS:
            continue
        seen += 1
        for i, ch in enumerate(CHANNELS):
            out.append((day + timedelta(hours=i), ch))
    return out


def _date_setup(var, when):
    """AppleScript lines that build a date field by field.

    `date "10/19/2026 04:00"` parses, but its interpretation of the time part
    is locale dependent and on this machine it silently resolved every event to
    midnight. Assigning the components cannot be misread.
    """
    return (
        f'set {var} to current date\n'
        f'set year of {var} to {when.year}\n'
        f'set month of {var} to {when.month}\n'
        f'set day of {var} to {when.day}\n'
        f'set hours of {var} to {when.hour}\n'
        f'set minutes of {var} to {when.minute}\n'
        f'set seconds of {var} to 0\n'
    )


def make_event(start, end, summary, notes, uid=None):
    """Create (or refresh) one event.

    The `uid` property cannot be supplied at creation: Calendar returns -10000
    "AppleEvent handler failed" the moment it is in the property list, which is
    what silently killed every clip event. Calendar mints the uid itself, so
    idempotency is done by matching on the summary, which always carries the
    date and is therefore unique per slot.
    """
    script = f'''tell application "Calendar"
    set workCal to first calendar whose name is "{esc(CALENDAR)}"
    {_date_setup("dStart", start)}
    {_date_setup("dEnd", end)}
    -- `first event whose` raises instead of returning missing value when there
    -- is no match, so drive the cleanup off a count.
    repeat while (count of (events of workCal whose summary is "{esc(summary)}")) > 0
        delete (first event of workCal whose summary is "{esc(summary)}")
    end repeat
    make new event at end of events of workCal with properties {{summary:"{esc(summary)}", start date:dStart, end date:dEnd, description:"{esc(notes)}"}}
    return "ok"
end tell'''
    return _run(script)


def do_series():
    slots = upcoming_slots()
    ok = 0
    # One event per run day covering all three channels is far easier to read
    # in month view than three separate blocks.
    by_day = {}
    for when, ch in slots:
        by_day.setdefault(when.date(), []).append((when, ch))
    for d, entries in sorted(by_day.items()):
        times = ", ".join(f"{w:%H:%M} {c}" for w, c in entries)
        start = entries[0][0]
        end = entries[-1][0] + timedelta(minutes=30)
        uid = f"cog-clips-{d:%Y%m%d}"
        notes = (f"Cognistration channel clips run.\n\n"
                 f"Channels: {times}\n\n"
                 f"Cadence: Monday and Thursday, six clips a week.\n"
                 f"Pipeline: scripts/channel_clip.py --channel <name>\n"
                 f"Posts to the Cognistration channel with creator credit only.")
        if make_event(start, end, f"{SUMMARY_PREFIX} run ({d:%a %d %b})", notes, uid):
            ok += 1
    print(f"[calendar] laid out {ok}/{len(by_day)} upcoming clip runs")
    return ok > 0


def do_record(args):
    now = datetime.now()
    notes = "\n".join(filter(None, [
        f"Clipped from {args.channel}.",
        f"Published: {args.url}" if args.url else None,
        f"At: {now:%Y-%m-%d %H:%M}",
        f"Status: {args.status}" if args.status else None,
        args.note,
    ]))
    # Date in the summary keeps each run its own event; the dedupe in
    # make_event matches on summary, so a repeating summary would erase the
    # earlier runs for the same channel.
    summary = f"{SUMMARY_PREFIX}: {args.channel} {args.status or 'done'} ({now:%a %d %b %H:%M})"
    ok = make_event(now, now + timedelta(minutes=15), summary, notes)
    print(f"[calendar] recorded {args.channel}: {'ok' if ok else 'FAILED'}")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--series", action="store_true",
                    help="Create upcoming run blocks")
    ap.add_argument("--record", action="store_true",
                    help="Record a run that just happened")
    ap.add_argument("--channel")
    ap.add_argument("--url", default="")
    ap.add_argument("--status", default="")
    ap.add_argument("--note", default="")
    args = ap.parse_args()

    if args.series:
        sys.exit(0 if do_series() else 1)
    if args.record:
        if not args.channel:
            ap.error("--record needs --channel")
        sys.exit(0 if do_record(args) else 1)
    ap.error("choose --series or --record")


if __name__ == "__main__":
    main()
