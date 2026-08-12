#!/usr/bin/env python3
"""Crawl MenWhoFeel and report broken internal/external links.

Uses only Python's standard library so GitHub Actions needs no third-party package.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from collections import deque
from html.parser import HTMLParser
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE_URL = os.environ.get("SITE_URL", "https://www.menwhofeel.online").rstrip("/")
MAX_PAGES = int(os.environ.get("MAX_PAGES", "500"))
TIMEOUT = int(os.environ.get("TIMEOUT_SECONDS", "15"))
USER_AGENT = "MenWhoFeel-SiteHealth/1.0 (+https://www.menwhofeel.online)"

SKIP_SCHEMES = {"mailto", "tel", "javascript", "data", "blob"}
SKIP_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".css", ".js",
    ".woff", ".woff2", ".ttf", ".pdf", ".zip", ".mp4", ".mp3", ".webm",
}

class LinkParser(HTMLParser):
    def __init__(self, page_url: str):
        super().__init__(convert_charrefs=True)
        self.page_url = page_url
        self.links: set[str] = set()

    def handle_starttag(self, tag: str, attrs):
        if tag.lower() not in {"a", "area"}:
            return
        href = dict(attrs).get("href")
        if not href:
            return
        absolute = urljoin(self.page_url, href.strip())
        absolute, _ = urldefrag(absolute)
        parsed = urlparse(absolute)
        if parsed.scheme.lower() in SKIP_SCHEMES or not parsed.netloc:
            return
        self.links.add(absolute)


def fetch(url: str) -> tuple[int, str, str]:
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xml,text/xml,*/*"})
    try:
        with urlopen(req, timeout=TIMEOUT) as response:
            status = response.status
            content_type = response.headers.get("Content-Type", "")
            body = response.read(2_000_000).decode("utf-8", errors="replace")
            return status, content_type, body
    except HTTPError as exc:
        return exc.code, exc.headers.get("Content-Type", ""), ""
    except (URLError, TimeoutError, OSError) as exc:
        return 0, type(exc).__name__, str(exc)


def check_url(url: str) -> dict:
    status, content_type, body = fetch(url)
    return {"url": url, "status": status, "content_type": content_type, "error": body if status == 0 else None}


def is_html(url: str, content_type: str) -> bool:
    path = urlparse(url).path.lower()
    if any(path.endswith(ext) for ext in SKIP_EXTENSIONS):
        return False
    return "text/html" in content_type.lower() or not content_type


def same_site(url: str) -> bool:
    return urlparse(url).netloc.lower() in {
        urlparse(BASE_URL).netloc.lower(),
        urlparse(BASE_URL).netloc.lower().removeprefix("www."),
    }


def normalise(url: str) -> str:
    url, _ = urldefrag(url)
    parsed = urlparse(url)
    path = parsed.path or "/"
    return parsed._replace(path=path).geturl().rstrip("/") if path != "/" else parsed._replace(path="/").geturl()


def main() -> int:
    started = time.time()
    base = normalise(BASE_URL)
    queue = deque([base])
    queued = {base}
    checked_pages: list[dict] = []
    all_links: set[str] = set()
    external_links: set[str] = set()

    # Critical endpoints first.
    critical = [base, f"{base}/robots.txt", f"{base}/sitemap.xml"]
    critical_results = [check_url(url) for url in critical]

    while queue and len(checked_pages) < MAX_PAGES:
        page = queue.popleft()
        result = check_url(page)
        checked_pages.append(result)
        if result["status"] < 200 or result["status"] >= 400:
            continue
        if not is_html(page, result["content_type"]):
            continue
        parser = LinkParser(page)
        try:
            parser.feed(result.get("error") or "") if result["status"] == 0 else parser.feed(fetch(page)[2])
        except Exception:
            continue
        for link in parser.links:
            all_links.add(link)
            if same_site(link):
                link = normalise(link)
                if link not in queued and len(queued) < MAX_PAGES:
                    queued.add(link)
                    queue.append(link)
            else:
                external_links.add(link)

    # Re-check discovered external links separately. Limit to avoid turning the check into an internet crawler.
    external_results = []
    for url in sorted(external_links)[:MAX_PAGES]:
        external_results.append(check_url(url))

    broken_internal = [r for r in checked_pages if r["status"] == 0 or r["status"] >= 400]
    broken_external = [r for r in external_results if r["status"] == 0 or r["status"] >= 400]
    critical_failures = [r for r in critical_results if r["status"] == 0 or r["status"] >= 400]

    result = {
        "site": BASE_URL,
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "duration_seconds": round(time.time() - started, 2),
        "pages_checked": len(checked_pages),
        "links_discovered": len(all_links),
        "external_links_checked": len(external_results),
        "critical": critical_results,
        "broken_internal": broken_internal,
        "broken_external": broken_external,
        "status": "fail" if critical_failures or broken_internal or broken_external else "ok",
    }

    os.makedirs("site-health-report", exist_ok=True)
    with open("site-health-report/report.json", "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)

    print(json.dumps(result, indent=2))
    if result["status"] == "fail":
        print("::error::MenWhoFeel site health check found broken or unavailable URLs.")
        return 1
    print("::notice::MenWhoFeel site health check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
