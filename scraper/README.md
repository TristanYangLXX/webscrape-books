 # Book Scraper

This package contains a polite scraper for the Books to Scrape demo site. It focuses on predictable pagination, resilient fetching, and cleanly structured output for later analysis or UI visualization.

## Installation

From `/Users/yanglixin/webscrape-books/scraper`:

```bash
pip install -e ".[dev]"
```

The extra dependencies include tooling for formatting, linting, and running the test suite.

## Usage

Run the scraper entry point to collect listing data:

```bash
python3 -m scraper.main --site=books --max-pages=3 --delay-ms=800 --user-agent "book-scraper/0.1 (+youremail)"
```

Key flags:
- `--max-pages`: limit the number of listing pages to crawl.
- `--delay-ms`: add jittered delays between requests to stay polite.
- `--dry-run`: parse and log results without writing output.

Successful runs create `data/items.jsonl`, a newline-delimited JSON file where each record represents a book listing with price, rating, stock, and category metadata.

## Project Structure

- `fetcher.py`: HTTP client with retry logic and robots.txt awareness.
- `parser.py`: BeautifulSoup-based parsing helpers for listing and detail pages.
- `pagination.py`: Utilities for following next-page links.
- `robots.py`: Helpers to respect crawler directives.
- `tests/`: Pytest coverage for fetching, pagination, parsing, and robots handling.

## Testing

Run the full test suite with:

```bash
pytest
```

## Troubleshooting

- Ensure your network allows outbound HTTPS to `books.toscrape.com`.
- If you hit rate limits, increase `--delay-ms` or lower `--max-pages`.
- Delete `data/items.jsonl` to force a clean re-run; the scraper will recreate it.
