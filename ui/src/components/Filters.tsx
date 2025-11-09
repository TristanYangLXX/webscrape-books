import type { ChangeEvent } from "react"

export type SortKey = "title" | "price" | "rating"
export type SortDir = "asc" | "desc"

type Props = {
  search: string
  setSearch: (v: string) => void
  selectedCategories: string[]
  setSelectedCategories: (v: string[]) => void
  categories: string[]
  ratingRange: [number, number]
  setRatingRange: (r: [number, number]) => void
  sortKey: SortKey
  setSortKey: (v: SortKey) => void
  sortDir: SortDir
  setSortDir: (v: SortDir) => void
  pageSize: number
  setPageSize: (n: number) => void
  onRefresh: () => void
  onExportCsv: () => void
}

export default function Filters({
  search,
  setSearch,
  selectedCategories,
  setSelectedCategories,
  categories,
  ratingRange,
  setRatingRange,
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
  pageSize,
  setPageSize,
  onRefresh,
  onExportCsv,
}: Props) {
  const onCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value)
    setSelectedCategories(values)
  }

  const [minR, maxR] = ratingRange

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-5">
      <input
        className="rounded-md border border-gray-300 px-3 py-2 md:col-span-2"
        placeholder="Search title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        multiple
        className="rounded-md border border-gray-300 px-3 py-2"
        value={selectedCategories}
        onChange={onCategoryChange}
        title="Cmd/Ctrl-click to multi-select"
      >
        {categories.map((c) => {
          const label = c?.trim() ? c : "(unknown)"
          const key = c?.trim() ? c : "(unknown)"
          return (
            <option key={key} value={c}>
              {label}
            </option>
          )
        })}
      </select>

      <div className="flex gap-2">
        <select
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
        >
          <option value="title">Title</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-2"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as SortDir)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <select
        className="rounded-md border border-gray-300 px-3 py-2"
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>

      <div className="md:col-span-5 flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600">Rating:</label>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={minR}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxR)
            setRatingRange([v, maxR])
          }}
        />
        <span className="text-sm text-gray-700">{minR}★</span>
        <span className="text-gray-400">—</span>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={maxR}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minR)
            setRatingRange([minR, v])
          }}
        />
        <span className="text-sm text-gray-700">{maxR}★</span>

        <div className="ml-auto flex gap-2">
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
            onClick={onRefresh}
            title="Reload data from items.jsonl (bypass cache)"
          >
            Refresh
          </button>
          <button
            className="rounded-md border border-gray-300 bg-[var(--brand)] px-3 py-2 text-sm text-white"
            onClick={onExportCsv}
            title="Export current page to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  )
}
