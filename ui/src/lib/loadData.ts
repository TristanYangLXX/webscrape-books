export type BookItem = {
  key: string
  site: "books"
  url: string
  title: string
  price: number
  availability: string
  rating: number
  category: string
  imageUrl?: string
  description?: string
}

const CACHE_KEY = "books_items_jsonl_cache_v1"

function parseJsonl(text: string): BookItem[] {
  const out: BookItem[] = []
  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    try {
      out.push(JSON.parse(line) as BookItem)
    } catch {
      // ignore malformed lines
    }
  }
  return out
}

export async function loadItems(opts?: { forceRefresh?: boolean }): Promise<BookItem[]> {
  const force = !!opts?.forceRefresh
  if (!force) {
    const cached = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null
    if (cached) {
      try {
        const { data } = JSON.parse(cached) as { data: BookItem[]; ts: number }
        return data.slice().sort((a, b) => a.title.localeCompare(b.title))
      } catch {
        // ignore parse errors
      }
    }
  }

  const res = await fetch("/items.jsonl", { cache: force ? "reload" : "default" })
  if (!res.ok) throw new Error(`Failed to load items.jsonl: ${res.status}`)
  const text = await res.text()
  const items = parseJsonl(text).sort((a, b) => a.title.localeCompare(b.title))

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: items }))
  } catch {
    // ignore storage errors (quota, etc.)
  }

  return items
}

export function clearItemsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}
