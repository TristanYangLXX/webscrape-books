import React from "react"

import Chart from "./components/Chart"
import DetailPanel from "./components/DetailPanel"
import Filters, { type SortDir, type SortKey } from "./components/Filters"
import Pagination from "./components/Pagination"
import Table from "./components/Table"
import { clearItemsCache, loadItems, type BookItem } from "./lib/loadData"
import { exportRowsToCsv } from "./lib/exportCsv"
import { useDebouncedValue } from "./lib/useDebouncedValue"

export default function App() {
  const [items, setItems] = React.useState<BookItem[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 250)

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [ratingRange, setRatingRange] = React.useState<[number, number]>([0, 5])

  const [sortKey, setSortKey] = React.useState<SortKey>("title")
  const [sortDir, setSortDir] = React.useState<SortDir>("asc")
  const [pageSize, setPageSize] = React.useState(20)
  const [page, setPage] = React.useState(1)

  const [chartMode, setChartMode] = React.useState<"category" | "rating">("category")
  const [selected, setSelected] = React.useState<BookItem | null>(null)

  React.useEffect(() => {
    loadItems()
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch((e) => setError(String(e)))
  }, [])

  const onRefresh = React.useCallback(() => {
    clearItemsCache()
    loadItems({ forceRefresh: true })
      .then((data) => {
        setItems(data)
        setError(null)
        setPage(1)
      })
      .catch((e) => setError(String(e)))
  }, [])

  const clearFilters = React.useCallback(() => {
    setSearch("")
    setSelectedCategories([])
    setRatingRange([0, 5])
    setSortKey("title")
    setSortDir("asc")
    setPageSize(20)
    setPage(1)
  }, [])

  const categories = React.useMemo(() => {
    if (!items) return []
    const s = new Set(items.map((i) => i.category ?? ""))
    const arr = Array.from(s)
    arr.sort((a, b) => a.localeCompare(b))
    return arr
  }, [items])

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedCategories, ratingRange, sortKey, sortDir, pageSize])

  const filtered = React.useMemo(() => {
    if (!items) return []
    const q = debouncedSearch.trim().toLowerCase()
    const catsActive = selectedCategories.length > 0

    const rows = items.filter((i) => {
      const matchSearch = q ? i.title.toLowerCase().includes(q) : true
      const categoryKey = i.category ?? ""
      const matchCategory = catsActive ? selectedCategories.includes(categoryKey) : true
      const matchRating = i.rating >= ratingRange[0] && i.rating <= ratingRange[1]
      return matchSearch && matchCategory && matchRating
    })

    rows.sort((a, b) => {
      let cmp = 0
      if (sortKey === "title") cmp = a.title.localeCompare(b.title)
      else if (sortKey === "price") cmp = a.price - b.price
      else cmp = a.rating - b.rating
      return sortDir === "asc" ? cmp : -cmp
    })

    return rows
  }, [items, debouncedSearch, selectedCategories, ratingRange, sortKey, sortDir])

  const paged = React.useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const exportCsv = React.useCallback(() => {
    exportRowsToCsv("books_visible.csv", paged)
  }, [paged])

  return (
    <div className="mx-auto max-w-6xl bg-white p-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Books Explorer</h1>
          <p className="text-gray-600">
            Data loaded from <code>/items.jsonl</code> (cached locally for faster reloads)
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {items === null ? (
        <div className="text-gray-600">Loading…</div>
      ) : (
        <>
          <Filters
            search={search}
            setSearch={setSearch}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
            ratingRange={ratingRange}
            setRatingRange={setRatingRange}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortDir={sortDir}
            setSortDir={setSortDir}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onRefresh={onRefresh}
            onExportCsv={exportCsv}
          />

          <Chart items={filtered} mode={chartMode} setMode={setChartMode} />

          <Table rows={paged} onRowClick={setSelected} onClearFilters={clearFilters} />

          <Pagination page={page} setPage={setPage} total={filtered.length} pageSize={pageSize} />

          <DetailPanel item={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}