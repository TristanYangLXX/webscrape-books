# Web Scraping + Mini UI Project

I pulled together a small end-to-end builder sprint: a polite scraper for **Books to Scrape** plus a React dashboard that lets me browse what I collected. The idea was to practice responsible crawling, structured parsing, and surfacing the data in a lightweight UI.

## Tech Stack

**Scraper (Python)**
- `httpx` with retries, jittered delays, and robots.txt checks
- `BeautifulSoup4` for parsing listing + detail pages
- Outputs newline-delimited JSON (`data/items.jsonl`)

**UI (React + TypeScript)**
- Vite + React + TypeScript
- Local JSONL loader with search/filter/sort/pagination
- Recharts bar chart to visualize category or rating distribution

---

## How to Run the Scraper

From `/Users/yanglixin/webscrape-books/scraper`:

1. **Install dependencies (editable mode + dev tools)**
   ```bash
   pip install -e ".[dev]"
   ```
2. **Kick off a polite crawl** (writes `data/items.jsonl`)
   ```bash
   python3 -m src.main --max-pages=3 --delay-ms=800 --user-agent "book-scraper/0.1 (+yourname)"
   ```
3. **Dry run option** (parse + log without writing)
   ```bash
   python3 -m src.main --max-pages=2 --dry-run
   ```

Notes:
- Scraper respects `robots.txt` and merges in any declared crawl-delay.
- Items are deduped by product URL so reruns won t spam duplicates.

---

## How to Run the UI

From `/Users/yanglixin/webscrape-books/ui`:

1. **Install front-end deps**
   ```bash
   npm install
   ```
   > Vite 7 needs Node.js 9.0 or 22.12+. I used Node 20.

2. **Copy the scraped data into the UI**
   ```bash
   cp ../scraper/data/items.jsonl public/items.jsonl
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open the app**
   - http://localhost:5173

Inside the UI you can search by title, filter by category, change the sort order (title/price/rating), adjust page size, and open a slide-over panel for book specifics. The chart toggle shows counts by category or rating so you can spot trends at a glance.

---

## Design Decisions
- Keep the scraper synchronous but wrap it with tenacity-based retries for clarity.
- Persist to JSONL so analysts (or the UI) can stream records without loading everything at once.
- Build the UI as client-only since the data set is tiny and static.

---

## What I d Tackle Next
- Add a CLI flag to fetch detail pages for richer fields (UPC, description, etc.).
- Move the JSONL loading behind a small API or cache layer for larger crawls.
- Package the UI with a hosted preview (e.g., Vercel) once the Node version is bumped.

---

## Known Limitations
- The scraper stops at listing pages; detailed enrichment is optional right now.
- UI expects `public/items.jsonl`; if the file is missing you ll see a friendly error toast.
- Build tooling requires Node 20+ (dev server is fine; `npm run build` will fail on Node 16).

---

## AI Tools Usage Disclosure
I leaned on IDE autocomplete and documentation lookups, plus an AI pair-programmer to iterate quicker. Every code change was reviewed and tested manually before committing.

