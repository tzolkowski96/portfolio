#!/usr/bin/env python3
"""
Build feed.json from the Medium RSS feed.

Pulls the latest posts, grabs a clean subtitle (og:description) for each,
drops anything on the SKIP list, and writes the six newest survivors to
feed.json at the repo root. The site reads that file on load.

No manual editing of the post list ever again: a scheduled Action runs this
and commits the result.
"""

import datetime
import html
import json
import re
import urllib.request
from xml.etree import ElementTree as ET

FEED_URL = "https://medium.com/feed/@grateful_aqua_goat_147"
MAX_POSTS = 6

# Your curation rule: keep criminal cases and overtly political pieces off the
# professional feed. Match by URL slug. Edit this list, nothing else.
SKIP = [
    "the-man-who-filled-a-ditch-with-babies",   # criminal case
    "the-most-expensive-denial-in-history",      # political framing
]

UA = {"User-Agent": "Mozilla/5.0 (feed-builder; +https://github.com/tzolkowski96)"}


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", "replace")


def og_description(url: str) -> str:
    """The Medium subtitle lives in og:description. Falls back to empty."""
    try:
        page = get(url)
        m = re.search(
            r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']*)["\']',
            page,
        )
        if m:
            text = html.unescape(m.group(1)).strip()
            # Medium truncates with an ellipsis; cut it back to a clean sentence.
            return text.rstrip(" .…")
    except Exception:
        pass
    return ""


def fmt_date(pub: str) -> str:
    try:
        dt = datetime.datetime.strptime(pub[:25].strip(), "%a, %d %b %Y %H:%M:%S")
        return dt.strftime("%b %Y")
    except Exception:
        return pub[:11].strip()


def main() -> None:
    root = ET.fromstring(get(FEED_URL))
    posts = []
    for item in root.findall(".//item"):
        link = (item.findtext("link") or "").split("?")[0]
        title = html.unescape((item.findtext("title") or "").strip())
        if not link or not title:
            continue
        if any(slug in link for slug in SKIP):
            continue
        cats = item.findall("category")
        tag = ""
        if cats and cats[0].text:
            tag = cats[0].text.replace("-", " ").title()
        posts.append({
            "date": fmt_date(item.findtext("pubDate") or ""),
            "title": title,
            "dek": og_description(link),
            "tag": tag,
            "url": link,
        })
        if len(posts) >= MAX_POSTS:
            break

    with open("feed.json", "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"wrote feed.json with {len(posts)} posts")


if __name__ == "__main__":
    main()
