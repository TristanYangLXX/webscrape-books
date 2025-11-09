from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Iterable
from urllib.parse import urlsplit, urlunsplit

from .fetcher import Fetcher, FetcherConfig
from .parser import parse_books_list
from .robots import RobotsHandler
from .types import BookItem


def _root_of(url: str) -> str:
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc, "/", "", ""))


def _write_jsonl(path: Path, items: Iterable[dict]) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with path.open("a", encoding="utf-8") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")
            n += 1
    return n


def run() -> int:
    parser = argparse.ArgumentParser(
        description="BooksToScrape crawler - data/items.jsonl"
    )
    parser.add_argument(
        "--start",
        type=str,
        default="https://books.toscrape.com/",
        help="Start URL (listing page).",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=5,
        help="Maximum listing pages to crawl.",
    )
    parser.add_argument(
        "--delay-ms",
        type=int,
        default=800,
        help="Polite base delay between requests in milliseconds.",
    )
    parser.add_argument(
        "--user-agent",
        type=str,
        default="book-scraper/0.1 (+yourname)",
        help="Custom User-Agent string.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be crawled without writing items.jsonl.",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    log = logging.getLogger("main")

    start_url = args.start
    base_url = _root_of(start_url)

    robots = RobotsHandler(base_url=base_url, user_agent=args.user_agent)
    robots_delay_ms = robots.get_crawl_delay_ms()
    effective_delay_ms = max(args.delay_ms, robots_delay_ms)
    log.info(
        "Effective delay: %d ms (CLI=%d, robots=%d)",
        effective_delay_ms,
        args.delay_ms,
        robots_delay_ms,
    )

    cfg = FetcherConfig(
        user_agent=args.user_agent,
        base_delay_ms=effective_delay_ms,
    )

    data_path = Path(__file__).resolve().parents[1] / "data" / "items.jsonl"
    visited_pages: set[str] = set()
    seen_item_keys: set[str] = set()
    current_url = start_url
    pages_crawled = 0
    items_written_total = 0

    try:
        with Fetcher(cfg) as fetcher:
            while current_url and pages_crawled < args.max_pages:
                if current_url in visited_pages:
                    log.warning(
                        "Already visited page %s. Stopping to avoid loop.", current_url
                    )
                    break
                visited_pages.add(current_url)

                if not robots.can_fetch(current_url):
                    log.warning("Robots disallows page %s. Stopping.", current_url)
                    break

                html = fetcher.get_text(current_url)
                items, next_url = parse_books_list(
                    html, base_url=base_url, page_url=current_url
                )

                new_items: list[BookItem] = []
                for it in items:
                    k = it["key"]
                    if k in seen_item_keys:
                        continue
                    seen_item_keys.add(k)
                    new_items.append(it)

                if args.dry_run:
                    log.info(
                        "[dry-run] Page %s → parsed=%d, new=%d, next=%s",
                        current_url,
                        len(items),
                        len(new_items),
                        next_url,
                    )
                else:
                    n = _write_jsonl(data_path, new_items)
                    items_written_total += n
                    log.info(
                        "Wrote %d new items (total %d) from %s",
                        n,
                        items_written_total,
                        current_url,
                    )

                pages_crawled += 1

                if not next_url:
                    log.info("No next page found. Stopping.")
                    break

                current_url = next_url

        log.info(
            "Crawl complete: pages=%d, unique_items=%d, dry_run=%s, output=%s",
            pages_crawled,
            len(seen_item_keys),
            args.dry_run,
            data_path if not args.dry_run else "(none)",
        )
        return 0
    except KeyboardInterrupt:
        log.warning("Interrupted by user. Partial progress saved.")
        return 130
    except Exception as e:
        log.exception("Fatal error: %s", e)
        return 1


if __name__ == "__main__":
    sys.exit(run())

