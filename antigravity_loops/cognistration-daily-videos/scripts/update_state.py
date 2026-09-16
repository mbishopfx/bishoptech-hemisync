#!/usr/bin/env python3
import os
import sys
import datetime

def main():
    if len(sys.argv) < 4:
        print("Usage: python3 update_state.py <day> <title> <youtube-url>")
        sys.exit(1)

    day = sys.argv[1].lower()
    title = sys.argv[2]
    url = sys.argv[3]

    base_loop_dir = os.environ.get(
        "LOOP_BASE_DIR",
        "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-daily-videos"
    )
    state_file = os.path.join(base_loop_dir, day, "state.md")

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date_str = datetime.date.today().isoformat()

    if not os.path.exists(state_file):
        os.makedirs(os.path.dirname(state_file), exist_ok=True)
        with open(state_file, 'w', encoding='utf-8') as f:
            f.write(
                f"# CRM Run State - {day.capitalize()}\n\n"
                "## Last Run Status\n"
                f"- Timestamp: {now_str}\n"
                "- Status: Pending\n"
                f"- Video File: {day}/output.mp4\n"
                "- YouTube URL: \n"
                "## Run History\n"
                "| Run Date | Status | Title | Video Path | YouTube Link |\n"
                "|----------|--------|-------|------------|--------------|\n"
            )
        print(f"Created missing state file at {state_file}.")

    with open(state_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("- Timestamp:"):
            new_lines.append(f"- Timestamp: {now_str}\n")
        elif line.startswith("- Status:"):
            new_lines.append("- Status: Success\n")
        elif line.startswith("- Video File:"):
            new_lines.append(f"- Video File: {day}/output.mp4\n")
        elif line.startswith("- YouTube URL:"):
            new_lines.append(f"- YouTube URL: {url}\n")
        else:
            new_lines.append(line)

        if "| Run Date | Status | Title | Video Path | YouTube Link |" in line:
            # Append next line (separator line)
            i += 1
            if i < len(lines):
                new_lines.append(lines[i])
            # Append new run details row
            new_row = f"| {date_str} | Success | {title} | {day}/output.mp4 | {url} |\n"
            new_lines.append(new_row)
            
        i += 1

    with open(state_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    print(f"State file for {day} successfully updated.")

if __name__ == "__main__":
    main()
